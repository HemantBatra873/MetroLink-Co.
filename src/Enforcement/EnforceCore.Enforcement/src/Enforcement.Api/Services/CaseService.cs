using Enforcement.Api.Authorization;
using Enforcement.Api.Domain;
using Enforcement.Api.DTOs;
using Enforcement.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Enforcement.Api.Services;

public interface IPenaltyCalculator
{
    Task<(decimal Amount, string Currency, int OffenceNumber)> ResolveAsync(
        Guid violationTypeId,
        Guid? areaId,
        int? requestedOffenceNumber,
        string? subjectExternalId,
        CancellationToken cancellationToken = default);
}

public class PenaltyCalculator : IPenaltyCalculator
{
    private readonly EnforcementDbContext _db;

    public PenaltyCalculator(EnforcementDbContext db) => _db = db;

    public async Task<(decimal Amount, string Currency, int OffenceNumber)> ResolveAsync(
        Guid violationTypeId,
        Guid? areaId,
        int? requestedOffenceNumber,
        string? subjectExternalId,
        CancellationToken cancellationToken = default)
    {
        var offenceNumber = requestedOffenceNumber
            ?? await InferOffenceNumberAsync(violationTypeId, subjectExternalId, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var rules = await _db.PenaltyRules
            .Where(r => r.ViolationTypeId == violationTypeId && r.IsActive)
            .Where(r => r.EffectiveFrom <= now && (r.EffectiveTo == null || r.EffectiveTo >= now))
            .ToListAsync(cancellationToken);

        var rule = rules
            .Where(r => r.OffenceNumber == offenceNumber)
            .OrderByDescending(r => r.AreaId == areaId)
            .ThenByDescending(r => r.AreaId == null)
            .FirstOrDefault()
            ?? rules.Where(r => r.OffenceNumber <= offenceNumber)
                .OrderByDescending(r => r.OffenceNumber)
                .ThenByDescending(r => r.AreaId == areaId)
                .FirstOrDefault();

        if (rule is null)
            throw new InvalidOperationException("No active penalty rule found for this violation.");

        return (rule.Amount, rule.Currency, offenceNumber);
    }

    private async Task<int> InferOffenceNumberAsync(Guid violationTypeId, string? subjectExternalId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(subjectExternalId))
            return 1;

        var prior = await _db.CaseViolations
            .Include(v => v.EnforcementCase)
            .CountAsync(v =>
                v.ViolationTypeId == violationTypeId
                && v.EnforcementCase!.Subject != null
                && v.EnforcementCase.Subject.ExternalId == subjectExternalId
                && v.EnforcementCase.Status != CaseStatus.Cancelled
                && v.EnforcementCase.Status != CaseStatus.Draft,
                cancellationToken);

        return prior + 1;
    }
}

public interface ICaseService
{
    Task<EnforcementCase> CreateAsync(CreateCaseRequest request, string actorId, CancellationToken ct);
    Task<EnforcementCase?> GetAsync(Guid id, CancellationToken ct);
    Task<(IReadOnlyList<CaseListItemDto> Items, int Total)> ListAsync(
        Guid organizationId, CaseStatus? status, Guid? domainId, Guid? areaId, string? search, int page, int pageSize, CancellationToken ct);
    Task<EnforcementCase> AssignAsync(Guid id, AssignCaseRequest request, string actorId, CancellationToken ct);
    Task<EnforcementCase> IssueAsync(Guid id, IssueCaseRequest request, string actorId, CancellationToken ct);
    Task<EnforcementCase> CancelAsync(Guid id, CancelCaseRequest request, string actorId, CancellationToken ct);
    Task<EnforcementCase> DisputeAsync(Guid id, DisputeCaseRequest request, string actorId, CancellationToken ct);
    Task<EnforcementCase> ReviewAsync(Guid id, ReviewCaseRequest request, string actorId, CancellationToken ct);
    Task<EvidenceItem> AddEvidenceAsync(Guid id, AddEvidenceRequest request, string actorId, CancellationToken ct);
    Task<FinancialObligation> ApplyPaymentAsync(Guid obligationId, MarkObligationPaidRequest request, CancellationToken ct);
    Task<DashboardStatsDto> GetDashboardAsync(Guid organizationId, CancellationToken ct);
}

public class CaseService : ICaseService
{
    private readonly EnforcementDbContext _db;
    private readonly IPenaltyCalculator _penaltyCalculator;

    public CaseService(EnforcementDbContext db, IPenaltyCalculator penaltyCalculator)
    {
        _db = db;
        _penaltyCalculator = penaltyCalculator;
    }

    public async Task<EnforcementCase> CreateAsync(CreateCaseRequest request, string actorId, CancellationToken ct)
    {
        var domain = await _db.EnforcementDomains
            .Include(d => d.SubjectTypes)
            .Include(d => d.ViolationTypes)
            .FirstOrDefaultAsync(d => d.Id == request.EnforcementDomainId && d.OrganizationId == request.OrganizationId, ct)
            ?? throw new InvalidOperationException("Enforcement domain not found for organization.");

        if (!domain.SubjectTypes.Any(s => s.Code.Equals(request.SubjectTypeCode, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException($"Subject type '{request.SubjectTypeCode}' is not configured for domain {domain.Code}.");

        if (!domain.ViolationTypes.Any(v => v.Id == request.ViolationTypeId && v.IsActive))
            throw new InvalidOperationException("Violation type is not valid for this domain.");

        var (amount, currency, offenceNumber) = await _penaltyCalculator.ResolveAsync(
            request.ViolationTypeId, request.AreaId, request.OffenceNumber, request.SubjectExternalId, ct);

        var now = DateTimeOffset.UtcNow;
        var caseEntity = new EnforcementCase
        {
            Id = Guid.NewGuid(),
            CaseNumber = await NextCaseNumberAsync(domain.Code, ct),
            OrganizationId = request.OrganizationId,
            AreaId = request.AreaId,
            EnforcementDomainId = domain.Id,
            Status = CaseStatus.Draft,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedByKeycloakUserId = actorId,
            AssignedOfficerKeycloakUserId = actorId,
            LocationLabel = request.LocationLabel,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Notes = request.Notes,
            Subject = new CaseSubject
            {
                Id = Guid.NewGuid(),
                SubjectTypeCode = request.SubjectTypeCode.ToUpperInvariant(),
                ExternalId = request.SubjectExternalId,
                DisplayLabel = request.SubjectDisplayLabel,
                MetadataJson = request.SubjectMetadataJson
            }
        };

        caseEntity.Violations.Add(new CaseViolation
        {
            Id = Guid.NewGuid(),
            ViolationTypeId = request.ViolationTypeId,
            OffenceNumberApplied = offenceNumber,
            Notes = $"Configured penalty {currency} {amount}"
        });

        caseEntity.AuditEvents.Add(AuditWriter.Create(caseEntity.Id, "CaseCreated", actorId, details: new { offenceNumber, amount, currency }));

        _db.EnforcementCases.Add(caseEntity);
        await _db.SaveChangesAsync(ct);
        return await GetAsync(caseEntity.Id, ct) ?? caseEntity;
    }

    public Task<EnforcementCase?> GetAsync(Guid id, CancellationToken ct) =>
        _db.EnforcementCases
            .Include(c => c.EnforcementDomain)
            .Include(c => c.Subject)
            .Include(c => c.Violations).ThenInclude(v => v.ViolationType)
            .Include(c => c.Evidence)
            .Include(c => c.Actions).ThenInclude(a => a.ActionType)
            .Include(c => c.FinancialObligations)
            .Include(c => c.AuditEvents)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<(IReadOnlyList<CaseListItemDto> Items, int Total)> ListAsync(
        Guid organizationId, CaseStatus? status, Guid? domainId, Guid? areaId, string? search, int page, int pageSize, CancellationToken ct)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.EnforcementCases
            .AsNoTracking()
            .Include(c => c.EnforcementDomain)
            .Include(c => c.Subject)
            .Include(c => c.FinancialObligations)
            .Where(c => c.OrganizationId == organizationId);

        if (status is not null) query = query.Where(c => c.Status == status);
        if (domainId is not null) query = query.Where(c => c.EnforcementDomainId == domainId);
        if (areaId is not null) query = query.Where(c => c.AreaId == areaId);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(c =>
                c.CaseNumber.Contains(s) ||
                (c.Subject != null && c.Subject.DisplayLabel.Contains(s)) ||
                (c.LocationLabel != null && c.LocationLabel.Contains(s)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CaseListItemDto(
                c.Id,
                c.CaseNumber,
                c.EnforcementDomain!.Code,
                c.Status,
                c.Subject != null ? c.Subject.DisplayLabel : null,
                c.OrganizationId,
                c.AreaId,
                c.CreatedAt,
                c.FinancialObligations
                    .Where(o => o.Status == ObligationStatus.Outstanding || o.Status == ObligationStatus.PartiallyPaid)
                    .Select(o => (decimal?)(o.Amount - o.AmountPaid))
                    .Sum()))
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<EnforcementCase> AssignAsync(Guid id, AssignCaseRequest request, string actorId, CancellationToken ct)
    {
        var c = await _db.EnforcementCases.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException($"Case {id} not found.");
        c.AssignedOfficerKeycloakUserId = request.OfficerKeycloakUserId;
        c.UpdatedAt = DateTimeOffset.UtcNow;
        _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "CaseAssigned", actorId, details: new { request.OfficerKeycloakUserId }));
        await _db.SaveChangesAsync(ct);
        return (await GetAsync(id, ct))!;
    }

    public async Task<EnforcementCase> IssueAsync(Guid id, IssueCaseRequest request, string actorId, CancellationToken ct)
    {
        var c = await _db.EnforcementCases
            .Include(x => x.Violations)
            .Include(x => x.Subject)
            .FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException($"Case {id} not found.");

        CaseLifecycle.EnsureTransition(c.Status, CaseStatus.Issued);

        var actionType = await ResolveIssueActionTypeAsync(c, request.ActionTypeId, ct);
        var violation = c.Violations.FirstOrDefault()
            ?? throw new InvalidOperationException("Case has no violation.");

        Guid? obligationId = null;
        decimal? obligationAmount = null;
        string? obligationCurrency = null;

        if (actionType.OutcomeKind == ActionOutcomeKind.Financial)
        {
            var (amount, currency, _) = await _penaltyCalculator.ResolveAsync(
                violation.ViolationTypeId, c.AreaId, violation.OffenceNumberApplied, c.Subject?.ExternalId, ct);

            var obligation = new FinancialObligation
            {
                Id = Guid.NewGuid(),
                EnforcementCaseId = c.Id,
                Amount = amount,
                AmountPaid = 0,
                Currency = currency,
                Status = ObligationStatus.Outstanding,
                DueAt = DateTimeOffset.UtcNow.AddDays(request.DueDays),
                CreatedAt = DateTimeOffset.UtcNow
            };
            _db.FinancialObligations.Add(obligation);
            obligationId = obligation.Id;
            obligationAmount = amount;
            obligationCurrency = currency;
        }

        _db.EnforcementActions.Add(new EnforcementAction
        {
            Id = Guid.NewGuid(),
            EnforcementCaseId = c.Id,
            ActionTypeId = actionType.Id,
            IssuedAt = DateTimeOffset.UtcNow,
            IssuedByKeycloakUserId = actorId,
            Notes = request.Notes,
            FinancialObligationId = obligationId
        });

        c.Status = CaseStatus.Issued;
        c.IssuedAt = DateTimeOffset.UtcNow;
        c.UpdatedAt = DateTimeOffset.UtcNow;

        _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "CaseIssued", actorId, request.Notes, new { actionType.Code, ObligationId = obligationId }));
        if (obligationId is not null)
        {
            CaseLifecycle.EnsureTransition(c.Status, CaseStatus.Payable);
            c.Status = CaseStatus.Payable;
            _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "FineCreated", actorId, details: new { Amount = obligationAmount, Currency = obligationCurrency }));
        }

        await _db.SaveChangesAsync(ct);
        return (await GetAsync(id, ct))!;
    }

    public async Task<EnforcementCase> CancelAsync(Guid id, CancelCaseRequest request, string actorId, CancellationToken ct)
    {
        var c = await _db.EnforcementCases.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException($"Case {id} not found.");
        CaseLifecycle.EnsureTransition(c.Status, CaseStatus.Cancelled);
        c.Status = CaseStatus.Cancelled;
        c.UpdatedAt = DateTimeOffset.UtcNow;

        var open = await _db.FinancialObligations
            .Where(o => o.EnforcementCaseId == id && (o.Status == ObligationStatus.Outstanding || o.Status == ObligationStatus.PartiallyPaid))
            .ToListAsync(ct);
        foreach (var o in open)
            o.Status = ObligationStatus.Cancelled;

        _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "CaseCancelled", actorId, request.Reason));
        await _db.SaveChangesAsync(ct);
        return (await GetAsync(id, ct))!;
    }

    public async Task<EnforcementCase> DisputeAsync(Guid id, DisputeCaseRequest request, string actorId, CancellationToken ct)
    {
        var c = await _db.EnforcementCases.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException($"Case {id} not found.");
        CaseLifecycle.EnsureTransition(c.Status, CaseStatus.Disputed);
        c.Status = CaseStatus.Disputed;
        c.UpdatedAt = DateTimeOffset.UtcNow;
        _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "CaseDisputed", actorId, request.Reason));

        CaseLifecycle.EnsureTransition(c.Status, CaseStatus.UnderReview);
        c.Status = CaseStatus.UnderReview;
        _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "CaseUnderReview", actorId));
        await _db.SaveChangesAsync(ct);
        return (await GetAsync(id, ct))!;
    }

    public async Task<EnforcementCase> ReviewAsync(Guid id, ReviewCaseRequest request, string actorId, CancellationToken ct)
    {
        var c = await _db.EnforcementCases.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException($"Case {id} not found.");
        if (request.Uphold)
        {
            CaseLifecycle.EnsureTransition(c.Status, CaseStatus.Upheld);
            c.Status = CaseStatus.Upheld;
            _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "CaseUpheld", actorId, request.Reason));
            CaseLifecycle.EnsureTransition(c.Status, CaseStatus.Payable);
            c.Status = CaseStatus.Payable;
            _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "CasePayable", actorId));
        }
        else
        {
            CaseLifecycle.EnsureTransition(c.Status, CaseStatus.Cancelled);
            c.Status = CaseStatus.Cancelled;
            var open = await _db.FinancialObligations
                .Where(o => o.EnforcementCaseId == id && (o.Status == ObligationStatus.Outstanding || o.Status == ObligationStatus.PartiallyPaid))
                .ToListAsync(ct);
            foreach (var o in open)
                o.Status = ObligationStatus.Cancelled;
            _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "CaseCancelled", actorId, request.Reason ?? "Dispute accepted"));
        }

        c.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);
        return (await GetAsync(id, ct))!;
    }

    public async Task<EvidenceItem> AddEvidenceAsync(Guid id, AddEvidenceRequest request, string actorId, CancellationToken ct)
    {
        var c = await _db.EnforcementCases.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException($"Case {id} not found.");
        if (c.Status is CaseStatus.Cancelled or CaseStatus.Paid)
            throw new InvalidOperationException("Cannot add evidence to a closed case.");

        var item = new EvidenceItem
        {
            Id = Guid.NewGuid(),
            EnforcementCaseId = c.Id,
            Type = request.Type,
            Title = request.Title,
            Description = request.Description,
            UriOrValue = request.UriOrValue,
            ContentType = request.ContentType,
            CapturedAt = DateTimeOffset.UtcNow,
            CapturedByKeycloakUserId = actorId
        };
        _db.EvidenceItems.Add(item);
        c.UpdatedAt = DateTimeOffset.UtcNow;
        _db.CaseAuditEvents.Add(AuditWriter.Create(c.Id, "EvidenceAdded", actorId, details: new { item.Type, item.Title }));
        await _db.SaveChangesAsync(ct);
        return item;
    }

    public async Task<FinancialObligation> ApplyPaymentAsync(Guid obligationId, MarkObligationPaidRequest request, CancellationToken ct)
    {
        var obligation = await _db.FinancialObligations.FirstOrDefaultAsync(o => o.Id == obligationId, ct)
            ?? throw new InvalidOperationException("Financial obligation not found.");

        if (obligation.Status is ObligationStatus.Cancelled or ObligationStatus.Waived)
            throw new InvalidOperationException($"Cannot pay obligation in status {obligation.Status}.");

        // Idempotent: same external reference already applied
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

        _db.CaseAuditEvents.Add(AuditWriter.Create(obligation.EnforcementCaseId, "PaymentReceived", "payment-service", details: new
        {
            obligation.Id,
            request.AmountPaid,
            request.ExternalPaymentReference,
            obligation.Status
        }));

        if (obligation.Status == ObligationStatus.Paid)
        {
            var caseEntity = await _db.EnforcementCases.FirstOrDefaultAsync(c => c.Id == obligation.EnforcementCaseId, ct)
                ?? throw new InvalidOperationException("Enforcement case not found for obligation.");

            var openOthers = await _db.FinancialObligations
                .Where(o => o.EnforcementCaseId == caseEntity.Id
                    && o.Id != obligation.Id
                    && o.Status != ObligationStatus.Paid
                    && o.Status != ObligationStatus.Waived
                    && o.Status != ObligationStatus.Cancelled)
                .CountAsync(ct);

            if (openOthers == 0 && caseEntity.Status == CaseStatus.Payable)
            {
                CaseLifecycle.EnsureTransition(caseEntity.Status, CaseStatus.Paid);
                caseEntity.Status = CaseStatus.Paid;
                caseEntity.UpdatedAt = DateTimeOffset.UtcNow;
                _db.CaseAuditEvents.Add(AuditWriter.Create(caseEntity.Id, "CasePaid", "payment-service"));
            }
        }

        await _db.SaveChangesAsync(ct);
        return obligation;
    }

    public async Task<DashboardStatsDto> GetDashboardAsync(Guid organizationId, CancellationToken ct)
    {
        var cases = _db.EnforcementCases.AsNoTracking().Where(c => c.OrganizationId == organizationId);
        var total = await cases.CountAsync(ct);
        var open = await cases.CountAsync(c => c.Status == CaseStatus.Draft || c.Status == CaseStatus.Issued, ct);
        var issued = await cases.CountAsync(c => c.Status == CaseStatus.Issued, ct);
        var pending = await cases.CountAsync(c => c.Status == CaseStatus.Payable, ct);
        var paid = await cases.CountAsync(c => c.Status == CaseStatus.Paid, ct);
        var disputed = await cases.CountAsync(c => c.Status == CaseStatus.Disputed || c.Status == CaseStatus.UnderReview, ct);

        var recent = await _db.CaseAuditEvents.AsNoTracking()
            .Include(a => a.EnforcementCase)
            .Where(a => a.EnforcementCase!.OrganizationId == organizationId)
            .OrderByDescending(a => a.OccurredAt)
            .Take(10)
            .Select(a => new RecentActivityDto(a.EnforcementCaseId, a.EnforcementCase!.CaseNumber, a.EventType, a.OccurredAt))
            .ToListAsync(ct);

        return new DashboardStatsDto(total, open, issued, pending, paid, disputed, recent);
    }

    private async Task<ActionTypeDefinition> ResolveIssueActionTypeAsync(EnforcementCase c, Guid? actionTypeId, CancellationToken ct)
    {
        if (actionTypeId is not null)
        {
            return await _db.ActionTypes.FirstOrDefaultAsync(a => a.Id == actionTypeId && a.EnforcementDomainId == c.EnforcementDomainId, ct)
                ?? throw new InvalidOperationException("Action type not found for domain.");
        }

        return await _db.ActionTypes
            .Where(a => a.EnforcementDomainId == c.EnforcementDomainId && a.IsActive)
            .OrderBy(a => a.OutcomeKind == ActionOutcomeKind.Financial ? 0 : 1)
            .FirstOrDefaultAsync(ct)
            ?? throw new InvalidOperationException("No action types configured for domain.");
    }

    private async Task<string> NextCaseNumberAsync(string domainCode, CancellationToken ct)
    {
        var prefix = $"{domainCode.ToUpperInvariant()}-{DateTime.UtcNow:yyyyMMdd}";
        var count = await _db.EnforcementCases.CountAsync(c => c.CaseNumber.StartsWith(prefix), ct);
        return $"{prefix}-{(count + 1):D4}";
    }
}
