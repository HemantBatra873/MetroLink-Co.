using Enforcement.Api.Domain;

namespace Enforcement.Api.DTOs;

public record CreateCaseRequest(
    Guid OrganizationId,
    Guid EnforcementDomainId,
    Guid? AreaId,
    string SubjectTypeCode,
    string SubjectDisplayLabel,
    string? SubjectExternalId,
    string? SubjectMetadataJson,
    Guid ViolationTypeId,
    string? LocationLabel,
    double? Latitude,
    double? Longitude,
    string? Notes,
    int? OffenceNumber);

public record AssignCaseRequest(string OfficerKeycloakUserId);
public record IssueCaseRequest(Guid? ActionTypeId, string? Notes, int DueDays = 14);
public record CancelCaseRequest(string Reason);
public record DisputeCaseRequest(string Reason);
public record ReviewCaseRequest(bool Uphold, string? Reason);
public record AddEvidenceRequest(
    EvidenceType Type,
    string Title,
    string? Description,
    string? UriOrValue,
    string? ContentType);

public record CreateDomainRequest(Guid OrganizationId, string Code, string Name, string? Description);
public record CreateViolationTypeRequest(Guid EnforcementDomainId, string Code, string Name, string? Description);
public record CreateActionTypeRequest(Guid EnforcementDomainId, string Code, string Name, ActionOutcomeKind OutcomeKind);
public record CreateSubjectTypeRequest(Guid EnforcementDomainId, string Code, string Name, string? ExternalSystemHint);
public record CreatePenaltyRuleRequest(
    Guid ViolationTypeId,
    int OffenceNumber,
    decimal Amount,
    string Currency,
    DateTimeOffset EffectiveFrom,
    DateTimeOffset? EffectiveTo,
    Guid? AreaId);

public record MarkObligationPaidRequest(decimal AmountPaid, string? ExternalPaymentReference);

public record CaseListItemDto(
    Guid Id,
    string CaseNumber,
    string DomainCode,
    CaseStatus Status,
    string? SubjectLabel,
    Guid OrganizationId,
    Guid? AreaId,
    DateTimeOffset CreatedAt,
    decimal? OutstandingAmount);

public record DashboardStatsDto(
    int TotalCases,
    int OpenCases,
    int IssuedCases,
    int PendingPayment,
    int Paid,
    int Disputed,
    IReadOnlyList<RecentActivityDto> RecentActivity);

public record RecentActivityDto(Guid CaseId, string CaseNumber, string EventType, DateTimeOffset OccurredAt);
