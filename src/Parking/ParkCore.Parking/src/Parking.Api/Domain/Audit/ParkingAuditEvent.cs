namespace Parking.Api.Domain.Audit;

public class ParkingAuditEvent
{
    public Guid Id { get; set; }
    public Guid? FacilityId { get; set; }
    public Guid? SessionId { get; set; }
    public Guid OrganizationId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string ActorKeycloakUserId { get; set; } = string.Empty;
    public DateTimeOffset OccurredAt { get; set; }
    public string? Reason { get; set; }
    public string? DetailsJson { get; set; }
}
