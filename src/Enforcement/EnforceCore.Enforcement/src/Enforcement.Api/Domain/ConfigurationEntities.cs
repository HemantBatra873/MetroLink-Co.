namespace Enforcement.Api.Domain;

/// <summary>
/// Configurable enforcement domain (Parking, Market, Construction, …).
/// Core engine behavior does not branch on domain code.
/// </summary>
public class EnforcementDomain
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<SubjectTypeDefinition> SubjectTypes { get; set; } = new List<SubjectTypeDefinition>();
    public ICollection<ViolationType> ViolationTypes { get; set; } = new List<ViolationType>();
    public ICollection<ActionTypeDefinition> ActionTypes { get; set; } = new List<ActionTypeDefinition>();
}

public class SubjectTypeDefinition
{
    public Guid Id { get; set; }
    public Guid EnforcementDomainId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ExternalSystemHint { get; set; }

    public EnforcementDomain? EnforcementDomain { get; set; }
}

public class ViolationType
{
    public Guid Id { get; set; }
    public Guid EnforcementDomainId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public EnforcementDomain? EnforcementDomain { get; set; }
    public ICollection<PenaltyRule> PenaltyRules { get; set; } = new List<PenaltyRule>();
}

public class ActionTypeDefinition
{
    public Guid Id { get; set; }
    public Guid EnforcementDomainId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ActionOutcomeKind OutcomeKind { get; set; }
    public bool IsActive { get; set; } = true;

    public EnforcementDomain? EnforcementDomain { get; set; }
}

/// <summary>
/// Simple configurable penalty model (offence tier → amount). Not a rule DSL.
/// </summary>
public class PenaltyRule
{
    public Guid Id { get; set; }
    public Guid ViolationTypeId { get; set; }
    public int OffenceNumber { get; set; } = 1;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public DateTimeOffset EffectiveFrom { get; set; }
    public DateTimeOffset? EffectiveTo { get; set; }
    public Guid? AreaId { get; set; }
    public bool IsActive { get; set; } = true;

    public ViolationType? ViolationType { get; set; }
}
