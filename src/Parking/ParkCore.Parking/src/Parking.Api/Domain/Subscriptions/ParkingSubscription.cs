namespace Parking.Api.Domain.Subscriptions;

public class ParkingSubscription
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid FacilityId { get; set; }
    public Guid ProductId { get; set; }
    public string? CustomerKeycloakUserId { get; set; }
    public string CustomerLabel { get; set; } = string.Empty;
    public string? VehiclePlate { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset? EndsAt { get; set; }
    public Guid? FinancialObligationId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string CreatedByKeycloakUserId { get; set; } = string.Empty;
}
