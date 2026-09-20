using Microsoft.EntityFrameworkCore;
using Parking.Api.Authorization;
using Parking.Api.Domain;
using Parking.Api.Domain.Facilities;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;

namespace Parking.Api.Services;

public interface IFacilityService
{
    Task<ParkingFacility> CreateAsync(CreateFacilityRequest request, string actorId, CancellationToken ct);
    Task<ParkingFacility> UpdateAsync(Guid id, UpdateFacilityRequest request, string actorId, CancellationToken ct);
    Task<ParkingFacility?> GetAsync(Guid id, CancellationToken ct);
    Task<(IReadOnlyList<ParkingFacility> Items, int Total)> ListAsync(Guid organizationId, FacilityStatus? status, int page, int pageSize, CancellationToken ct);
    Task<ParkingFacility> SubmitAsync(Guid id, string actorId, CancellationToken ct);
    Task<ParkingFacility> StartReviewAsync(Guid id, string actorId, CancellationToken ct);
    Task<ParkingFacility> ApproveAsync(Guid id, string actorId, CancellationToken ct);
    Task<ParkingFacility> RejectAsync(Guid id, RejectFacilityRequest request, string actorId, CancellationToken ct);
    Task<ParkingFacility> ActivateAsync(Guid id, string actorId, CancellationToken ct);
    Task<ParkingFacility> SuspendAsync(Guid id, string actorId, CancellationToken ct);
    Task<ParkingFacility> CloseAsync(Guid id, string actorId, CancellationToken ct);
}

public class FacilityService : IFacilityService
{
    private readonly ParkingDbContext _db;

    public FacilityService(ParkingDbContext db) => _db = db;

    public async Task<ParkingFacility> CreateAsync(CreateFacilityRequest request, string actorId, CancellationToken ct)
    {
        var exists = await _db.ParkingFacilities.AnyAsync(f => f.OrganizationId == request.OrganizationId && f.Code == request.Code, ct);
        if (exists)
            throw new InvalidOperationException("Facility code already exists for organization.");

        var now = DateTimeOffset.UtcNow;
        var facility = new ParkingFacility
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            OwnerOrganizationId = request.OwnerOrganizationId,
            OperatorOrganizationId = request.OperatorOrganizationId,
            AreaId = request.AreaId,
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            FacilityType = request.FacilityType,
            Status = FacilityStatus.Draft,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            TotalCapacity = request.TotalCapacity,
            OccupancyMode = request.OccupancyMode,
            VehicleTypesCsv = request.VehicleTypesCsv ?? string.Empty,
            OperatingHoursJson = request.OperatingHoursJson,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedByKeycloakUserId = actorId
        };

        _db.ParkingFacilities.Add(facility);
        _db.ParkingAuditEvents.Add(AuditWriter.Create(request.OrganizationId, "FacilityCreated", actorId, facility.Id));
        await _db.SaveChangesAsync(ct);
        return facility;
    }

    public async Task<ParkingFacility> UpdateAsync(Guid id, UpdateFacilityRequest request, string actorId, CancellationToken ct)
    {
        var facility = await _db.ParkingFacilities.FindAsync([id], ct) ?? throw new KeyNotFoundException();
        if (facility.Status is FacilityStatus.Closed)
            throw new InvalidOperationException("Closed facilities cannot be updated.");

        facility.Name = request.Name;
        facility.Description = request.Description;
        facility.Address = request.Address;
        facility.Latitude = request.Latitude;
        facility.Longitude = request.Longitude;
        facility.TotalCapacity = request.TotalCapacity;
        facility.OccupancyMode = request.OccupancyMode;
        facility.VehicleTypesCsv = request.VehicleTypesCsv ?? facility.VehicleTypesCsv;
        facility.OperatingHoursJson = request.OperatingHoursJson;
        facility.UpdatedAt = DateTimeOffset.UtcNow;
        facility.UpdatedByKeycloakUserId = actorId;

        _db.ParkingAuditEvents.Add(AuditWriter.Create(facility.OrganizationId, "FacilityUpdated", actorId, facility.Id));
        await _db.SaveChangesAsync(ct);
        return facility;
    }

    public Task<ParkingFacility?> GetAsync(Guid id, CancellationToken ct) =>
        _db.ParkingFacilities.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id, ct);

    public async Task<(IReadOnlyList<ParkingFacility> Items, int Total)> ListAsync(
        Guid organizationId, FacilityStatus? status, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.ParkingFacilities.AsNoTracking()
            .Where(f => f.OrganizationId == organizationId
                || f.OwnerOrganizationId == organizationId
                || f.OperatorOrganizationId == organizationId);

        if (status.HasValue)
            query = query.Where(f => f.Status == status.Value);

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return (items, total);
    }

    public async Task<ParkingFacility> SubmitAsync(Guid id, string actorId, CancellationToken ct) =>
        await TransitionAsync(id, FacilityStatus.Submitted, actorId, "FacilitySubmitted", f => f.SubmittedAt = DateTimeOffset.UtcNow, ct);

    public async Task<ParkingFacility> StartReviewAsync(Guid id, string actorId, CancellationToken ct) =>
        await TransitionAsync(id, FacilityStatus.UnderReview, actorId, "FacilityReviewStarted", null, ct);

    public async Task<ParkingFacility> ApproveAsync(Guid id, string actorId, CancellationToken ct) =>
        await TransitionAsync(id, FacilityStatus.Approved, actorId, "FacilityApproved", f =>
        {
            f.ReviewedAt = DateTimeOffset.UtcNow;
            f.ReviewedByKeycloakUserId = actorId;
            f.RejectionReason = null;
        }, ct);

    public async Task<ParkingFacility> RejectAsync(Guid id, RejectFacilityRequest request, string actorId, CancellationToken ct) =>
        await TransitionAsync(id, FacilityStatus.Rejected, actorId, "FacilityRejected", f =>
        {
            f.RejectionReason = request.Reason;
            f.ReviewedAt = DateTimeOffset.UtcNow;
            f.ReviewedByKeycloakUserId = actorId;
        }, ct);

    public async Task<ParkingFacility> ActivateAsync(Guid id, string actorId, CancellationToken ct) =>
        await TransitionAsync(id, FacilityStatus.Active, actorId, "FacilityActivated", f => f.ActivatedAt = DateTimeOffset.UtcNow, ct);

    public async Task<ParkingFacility> SuspendAsync(Guid id, string actorId, CancellationToken ct) =>
        await TransitionAsync(id, FacilityStatus.Suspended, actorId, "FacilitySuspended", null, ct);

    public async Task<ParkingFacility> CloseAsync(Guid id, string actorId, CancellationToken ct) =>
        await TransitionAsync(id, FacilityStatus.Closed, actorId, "FacilityClosed", null, ct);

    private async Task<ParkingFacility> TransitionAsync(
        Guid id,
        FacilityStatus to,
        string actorId,
        string auditEvent,
        Action<ParkingFacility>? mutate,
        CancellationToken ct)
    {
        var facility = await _db.ParkingFacilities.FindAsync([id], ct) ?? throw new KeyNotFoundException();
        FacilityLifecycle.EnsureTransition(facility.Status, to);
        facility.Status = to;
        facility.UpdatedAt = DateTimeOffset.UtcNow;
        facility.UpdatedByKeycloakUserId = actorId;
        mutate?.Invoke(facility);
        _db.ParkingAuditEvents.Add(AuditWriter.Create(facility.OrganizationId, auditEvent, actorId, facility.Id));
        await _db.SaveChangesAsync(ct);
        return facility;
    }
}
