namespace Parking.Api.Domain.Sessions;

public class ParkingSession
{
    public Guid Id { get; set; }
    public Guid FacilityId { get; set; }
    public Guid? ZoneId { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid? AreaId { get; set; }

    public string VehiclePlate { get; set; } = string.Empty;
    public string? VehicleExternalId { get; set; }
    public VehicleType VehicleType { get; set; }

    public SessionStatus Status { get; set; }
    public DateTimeOffset EntryTime { get; set; }
    public DateTimeOffset? ExitTime { get; set; }
    public EntryExitMethod EntryMethod { get; set; }
    public EntryExitMethod? ExitMethod { get; set; }

    public Guid? PricingProductId { get; set; }
    public decimal? CalculatedAmount { get; set; }
    public string Currency { get; set; } = "INR";
    public Guid? FinancialObligationId { get; set; }
    public Guid? EnforcementCaseId { get; set; }
    public Guid? TicketId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string CreatedByKeycloakUserId { get; set; } = string.Empty;
}
