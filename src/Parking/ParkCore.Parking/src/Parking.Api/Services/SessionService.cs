using Microsoft.EntityFrameworkCore;
using Parking.Api.Authorization;
using Parking.Api.Domain;
using Parking.Api.Domain.Facilities;
using Parking.Api.Domain.Obligations;
using Parking.Api.Domain.Sessions;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;
using Parking.Api.Integrations;

namespace Parking.Api.Services;

public interface ISessionService
{
    Task<ParkingSession> CreateEntryAsync(CreateSessionEntryRequest request, string actorId, CancellationToken ct);
    Task<SessionExitResultDto> ExitAsync(Guid sessionId, SessionExitRequest request, string actorId, CancellationToken ct);
    Task<ParkingSession> CompleteAfterPaymentAsync(Guid sessionId, CancellationToken ct);
    Task<ParkingSession> CancelAsync(Guid sessionId, string actorId, CancellationToken ct);
    Task<ParkingSession?> GetAsync(Guid id, CancellationToken ct);
    Task<(IReadOnlyList<ParkingSession> Items, int Total)> ListAsync(Guid organizationId, Guid? facilityId, SessionStatus? status, int page, int pageSize, CancellationToken ct);
    Task<FinancialObligation> ApplyPaymentAsync(Guid obligationId, MarkObligationPaidRequest request, CancellationToken ct);
    Task<ParkingSession> ReportViolationAsync(Guid sessionId, ReportViolationRequest request, string actorId, IConfiguration configuration, CancellationToken ct);
}

public class SessionService : ISessionService
{
    private readonly ParkingDbContext _db;
    private readonly IOccupancyService _occupancy;
    private readonly IPricingService _pricing;
    private readonly ITicketService _tickets;
    private readonly IEnforcementClient _enforcement;

    public SessionService(
        ParkingDbContext db,
        IOccupancyService occupancy,
        IPricingService pricing,
        ITicketService tickets,
        IEnforcementClient enforcement)
    {
        _db = db;
        _occupancy = occupancy;
        _pricing = pricing;
        _tickets = tickets;
        _enforcement = enforcement;
    }

    public async Task<ParkingSession> CreateEntryAsync(CreateSessionEntryRequest request, string actorId, CancellationToken ct)
    {
        var facility = await _db.ParkingFacilities.FirstOrDefaultAsync(f => f.Id == request.FacilityId, ct)
            ?? throw new InvalidOperationException("Facility not found.");

        if (facility.Status != FacilityStatus.Active)
            throw new InvalidOperationException("Sessions can only be created for active facilities.");

        var current = await _occupancy.GetCurrentAsync(request.FacilityId, request.ZoneId, ct);
        if (current.Occupied >= current.TotalCapacity)
            throw new InvalidOperationException("Facility is at capacity.");

        var now = DateTimeOffset.UtcNow;
        var session = new ParkingSession
        {
            Id = Guid.NewGuid(),
            FacilityId = request.FacilityId,
            ZoneId = request.ZoneId,
            OrganizationId = request.OrganizationId,
            AreaId = request.AreaId ?? facility.AreaId,
            VehiclePlate = request.VehiclePlate.Trim().ToUpperInvariant(),
            VehicleExternalId = request.VehicleExternalId,
            VehicleType = request.VehicleType,
            Status = SessionStatus.Created,
            EntryTime = now,
            EntryMethod = request.EntryMethod,
            PricingProductId = request.PricingProductId,
            Currency = "INR",
            CreatedAt = now,
            UpdatedAt = now,
            CreatedByKeycloakUserId = actorId
        };

        SessionLifecycle.EnsureTransition(session.Status, SessionStatus.Active);
        session.Status = SessionStatus.Active;

        _db.ParkingSessions.Add(session);
        _db.ParkingAuditEvents.Add(AuditWriter.Create(session.OrganizationId, "SessionEntry", actorId, session.FacilityId, session.Id));

        await _db.SaveChangesAsync(ct);
        await _tickets.IssueOnEntryAsync(session, ct);
        await _occupancy.ApplyEntryAsync(session.FacilityId, session.ZoneId, ct);

        return session;
    }

    public async Task<SessionExitResultDto> ExitAsync(Guid sessionId, SessionExitRequest request, string actorId, CancellationToken ct)
    {
        var session = await _db.ParkingSessions.FirstOrDefaultAsync(s => s.Id == sessionId, ct)
            ?? throw new KeyNotFoundException();

        if (session.Status is not SessionStatus.Active and not SessionStatus.Created)
            throw new InvalidOperationException($"Cannot exit session in status {session.Status}.");

        var exitTime = request.ExitTime ?? DateTimeOffset.UtcNow;
        session.ExitTime = exitTime;
        session.ExitMethod = request.ExitMethod ?? EntryExitMethod.Manual;
        session.UpdatedAt = DateTimeOffset.UtcNow;

        var pricing = await _pricing.CalculateAmountAsync(
            session.FacilityId, session.VehicleType, session.EntryTime, exitTime, session.PricingProductId, ct);

        session.CalculatedAmount = pricing.Amount;
        session.Currency = pricing.Currency;
        session.PricingProductId ??= pricing.ProductId;

        FinancialObligation? obligation = null;

        if (pricing.Amount <= 0)
        {
            SessionLifecycle.EnsureTransition(session.Status, SessionStatus.Completed);
            session.Status = SessionStatus.Completed;
            await _tickets.CompleteOnSessionCompleteAsync(session, ct);
            await _occupancy.ApplyExitAsync(session.FacilityId, session.ZoneId, ct);
            _db.ParkingAuditEvents.Add(AuditWriter.Create(session.OrganizationId, "SessionCompleted", actorId, session.FacilityId, session.Id,
                details: new { ZeroAmount = true }));
        }
        else
        {
            obligation = new FinancialObligation
            {
                Id = Guid.NewGuid(),
                OrganizationId = session.OrganizationId,
                SessionId = session.Id,
                Amount = pricing.Amount,
                AmountPaid = 0,
                Currency = pricing.Currency,
                Status = ObligationStatus.Outstanding,
                DueAt = DateTimeOffset.UtcNow.AddDays(7),
                CreatedAt = DateTimeOffset.UtcNow
            };
            _db.FinancialObligations.Add(obligation);
            session.FinancialObligationId = obligation.Id;

            SessionLifecycle.EnsureTransition(session.Status, SessionStatus.PaymentPending);
            session.Status = SessionStatus.PaymentPending;
            _db.ParkingAuditEvents.Add(AuditWriter.Create(session.OrganizationId, "SessionPaymentPending", actorId, session.FacilityId, session.Id,
                details: new { obligation.Id, pricing.Amount }));
        }

        await _db.SaveChangesAsync(ct);
        return new SessionExitResultDto(session, obligation);
    }

    public async Task<ParkingSession> CompleteAfterPaymentAsync(Guid sessionId, CancellationToken ct)
    {
        var session = await _db.ParkingSessions.FirstOrDefaultAsync(s => s.Id == sessionId, ct)
            ?? throw new InvalidOperationException("Session not found.");

        if (session.Status != SessionStatus.PaymentPending)
            return session;

        SessionLifecycle.EnsureTransition(session.Status, SessionStatus.Completed);
        session.Status = SessionStatus.Completed;
        session.ExitTime ??= DateTimeOffset.UtcNow;
        session.UpdatedAt = DateTimeOffset.UtcNow;

        await _tickets.CompleteOnSessionCompleteAsync(session, ct);
        await _occupancy.ApplyExitAsync(session.FacilityId, session.ZoneId, ct);

        _db.ParkingAuditEvents.Add(AuditWriter.Create(session.OrganizationId, "SessionCompleted", "payment-service", session.FacilityId, session.Id));
        await _db.SaveChangesAsync(ct);
        return session;
    }

    public async Task<ParkingSession> CancelAsync(Guid sessionId, string actorId, CancellationToken ct)
    {
        var session = await _db.ParkingSessions.FirstOrDefaultAsync(s => s.Id == sessionId, ct)
            ?? throw new KeyNotFoundException();

        var previousStatus = session.Status;
        SessionLifecycle.EnsureTransition(previousStatus, SessionStatus.Cancelled);
        session.Status = SessionStatus.Cancelled;
        session.UpdatedAt = DateTimeOffset.UtcNow;
        session.ExitTime ??= DateTimeOffset.UtcNow;

        if (previousStatus is SessionStatus.Active or SessionStatus.PaymentPending)
            await _occupancy.ApplyExitAsync(session.FacilityId, session.ZoneId, ct);

        _db.ParkingAuditEvents.Add(AuditWriter.Create(session.OrganizationId, "SessionCancelled", actorId, session.FacilityId, session.Id));
        await _db.SaveChangesAsync(ct);
        return session;
    }

    public Task<ParkingSession?> GetAsync(Guid id, CancellationToken ct) =>
        _db.ParkingSessions.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<(IReadOnlyList<ParkingSession> Items, int Total)> ListAsync(
        Guid organizationId, Guid? facilityId, SessionStatus? status, int page, int pageSize, CancellationToken ct)
    {
        var q = _db.ParkingSessions.AsNoTracking().Where(s => s.OrganizationId == organizationId);
        if (facilityId.HasValue)
            q = q.Where(s => s.FacilityId == facilityId);
        if (status.HasValue)
            q = q.Where(s => s.Status == status);

        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(s => s.EntryTime).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<FinancialObligation> ApplyPaymentAsync(Guid obligationId, MarkObligationPaidRequest request, CancellationToken ct)
    {
        var obligation = await _db.FinancialObligations.FirstOrDefaultAsync(o => o.Id == obligationId, ct)
            ?? throw new InvalidOperationException("Financial obligation not found.");

        if (obligation.Status is ObligationStatus.Cancelled or ObligationStatus.Waived)
            throw new InvalidOperationException($"Cannot pay obligation in status {obligation.Status}.");

        if (!string.IsNullOrWhiteSpace(request.ExternalPaymentReference)
            && obligation.ExternalPaymentReference == request.ExternalPaymentReference
            && obligation.Status == ObligationStatus.Paid)
        {
            return obligation;
        }

        obligation.AmountPaid = Math.Min(obligation.Amount, obligation.AmountPaid + request.AmountPaid);
        obligation.ExternalPaymentReference = request.ExternalPaymentReference ?? obligation.ExternalPaymentReference;
        obligation.Status = obligation.AmountPaid >= obligation.Amount
            ? ObligationStatus.Paid
            : ObligationStatus.PartiallyPaid;

        await _db.SaveChangesAsync(ct);

        if (obligation.SessionId.HasValue && obligation.Status == ObligationStatus.Paid)
            await CompleteAfterPaymentAsync(obligation.SessionId.Value, ct);

        return obligation;
    }

    public async Task<ParkingSession> ReportViolationAsync(
        Guid sessionId, ReportViolationRequest request, string actorId, IConfiguration configuration, CancellationToken ct)
    {
        var session = await _db.ParkingSessions.FirstOrDefaultAsync(s => s.Id == sessionId, ct)
            ?? throw new KeyNotFoundException();

        var facility = await _db.ParkingFacilities.AsNoTracking().FirstAsync(f => f.Id == session.FacilityId, ct);
        var domainId = configuration.GetValue<Guid>("Enforcement:ParkingDomainId");
        if (domainId == Guid.Empty)
            domainId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        var caseId = await _enforcement.CreateCaseAsync(new CreateEnforcementCaseRequest(
            session.OrganizationId,
            domainId,
            session.AreaId ?? facility.AreaId,
            "VEHICLE",
            session.VehiclePlate,
            session.VehicleExternalId ?? session.VehiclePlate,
            System.Text.Json.JsonSerializer.Serialize(new { facilityId = session.FacilityId, sessionId = session.Id }),
            request.ViolationTypeId,
            request.LocationLabel ?? facility.Name,
            request.Latitude ?? facility.Latitude,
            request.Longitude ?? facility.Longitude,
            request.Notes), ct);

        session.EnforcementCaseId = caseId;
        session.UpdatedAt = DateTimeOffset.UtcNow;
        _db.ParkingAuditEvents.Add(AuditWriter.Create(session.OrganizationId, "ViolationReported", actorId, session.FacilityId, session.Id,
            details: new { caseId }));
        await _db.SaveChangesAsync(ct);
        return session;
    }
}
