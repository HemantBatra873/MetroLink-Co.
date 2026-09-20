namespace Payment.Api.Domain;

public enum PaymentStatus
{
    Pending,
    RequiresAction,
    Succeeded,
    Failed,
    Cancelled
}

/// <summary>
/// Central payment record. Source systems (Enforcement, Billing, etc.) reference payables
/// via SourceSystem + PayableReferenceId; Payment does not call those systems directly.
/// </summary>
public class Payment
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }

    /// <summary>Calling product code, e.g. "Enforcement", "Billing".</summary>
    public string SourceSystem { get; set; } = string.Empty;

    /// <summary>Opaque payable id in the source system (obligation, invoice, etc.).</summary>
    public Guid PayableReferenceId { get; set; }

    /// <summary>Optional parent correlation id (case, order, subscription).</summary>
    public Guid? CorrelationId { get; set; }

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string ProviderCode { get; set; } = "Mock";
    public string? ProviderOrderId { get; set; }
    public string? ProviderPaymentId { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? MetadataJson { get; set; }

    /// <summary>
    /// Optional URL the caller registers for settlement notification.
    /// Payment POSTs a generic settlement payload when the payment succeeds.
    /// </summary>
    public string? SuccessCallbackUrl { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public string? FailureReason { get; set; }

    public ICollection<PaymentEvent> Events { get; set; } = new List<PaymentEvent>();
}

public class PaymentEvent
{
    public Guid Id { get; set; }
    public Guid PaymentId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public DateTimeOffset OccurredAt { get; set; }
    public string? PayloadJson { get; set; }

    public Payment? Payment { get; set; }
}
