namespace Parking.Api.Domain.Obligations;

public class FinancialObligation
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid? SessionId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public decimal Amount { get; set; }
    public decimal AmountPaid { get; set; }
    public string Currency { get; set; } = "INR";
    public ObligationStatus Status { get; set; }
    public DateTimeOffset? DueAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? ExternalPaymentReference { get; set; }
}
