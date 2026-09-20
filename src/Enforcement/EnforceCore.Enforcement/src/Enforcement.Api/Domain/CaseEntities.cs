namespace Enforcement.Api.Domain;

public class EnforcementCase
{
    public Guid Id { get; set; }
    public string CaseNumber { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid? AreaId { get; set; }
    public Guid EnforcementDomainId { get; set; }
    public CaseStatus Status { get; set; } = CaseStatus.Draft;
    public DateTimeOffset CreatedAt { get; set; }
    public string CreatedByKeycloakUserId { get; set; } = string.Empty;
    public string? AssignedOfficerKeycloakUserId { get; set; }
    public DateTimeOffset? IssuedAt { get; set; }
    public string? LocationLabel { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public EnforcementDomain? EnforcementDomain { get; set; }
    public CaseSubject? Subject { get; set; }
    public ICollection<CaseViolation> Violations { get; set; } = new List<CaseViolation>();
    public ICollection<EvidenceItem> Evidence { get; set; } = new List<EvidenceItem>();
    public ICollection<EnforcementAction> Actions { get; set; } = new List<EnforcementAction>();
    public ICollection<FinancialObligation> FinancialObligations { get; set; } = new List<FinancialObligation>();
    public ICollection<CaseAuditEvent> AuditEvents { get; set; } = new List<CaseAuditEvent>();
}

/// <summary>
/// Flexible subject reference — Enforcement does not own the subject master data.
/// </summary>
public class CaseSubject
{
    public Guid Id { get; set; }
    public Guid EnforcementCaseId { get; set; }
    public string SubjectTypeCode { get; set; } = string.Empty;
    public string? ExternalId { get; set; }
    public string DisplayLabel { get; set; } = string.Empty;
    public string? MetadataJson { get; set; }

    public EnforcementCase? EnforcementCase { get; set; }
}

public class CaseViolation
{
    public Guid Id { get; set; }
    public Guid EnforcementCaseId { get; set; }
    public Guid ViolationTypeId { get; set; }
    public int OffenceNumberApplied { get; set; } = 1;
    public string? Notes { get; set; }

    public EnforcementCase? EnforcementCase { get; set; }
    public ViolationType? ViolationType { get; set; }
}

public class EvidenceItem
{
    public Guid Id { get; set; }
    public Guid EnforcementCaseId { get; set; }
    public EvidenceType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? UriOrValue { get; set; }
    public string? ContentType { get; set; }
    public DateTimeOffset CapturedAt { get; set; }
    public string CapturedByKeycloakUserId { get; set; } = string.Empty;

    public EnforcementCase? EnforcementCase { get; set; }
}

public class EnforcementAction
{
    public Guid Id { get; set; }
    public Guid EnforcementCaseId { get; set; }
    public Guid ActionTypeId { get; set; }
    public DateTimeOffset IssuedAt { get; set; }
    public string IssuedByKeycloakUserId { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public Guid? FinancialObligationId { get; set; }

    public EnforcementCase? EnforcementCase { get; set; }
    public ActionTypeDefinition? ActionType { get; set; }
    public FinancialObligation? FinancialObligation { get; set; }
}

public class FinancialObligation
{
    public Guid Id { get; set; }
    public Guid EnforcementCaseId { get; set; }
    public Guid? EnforcementActionId { get; set; }
    public decimal Amount { get; set; }
    public decimal AmountPaid { get; set; }
    public string Currency { get; set; } = "INR";
    public ObligationStatus Status { get; set; } = ObligationStatus.Outstanding;
    public DateTimeOffset? DueAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? ExternalPaymentReference { get; set; }

    public EnforcementCase? EnforcementCase { get; set; }
}

public class CaseAuditEvent
{
    public Guid Id { get; set; }
    public Guid EnforcementCaseId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string ActorKeycloakUserId { get; set; } = string.Empty;
    public DateTimeOffset OccurredAt { get; set; }
    public string? Reason { get; set; }
    public string? DetailsJson { get; set; }

    public EnforcementCase? EnforcementCase { get; set; }
}
