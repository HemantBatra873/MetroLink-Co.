namespace Parking.Api.Domain.Facilities;

public class ParkingFacility
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid OwnerOrganizationId { get; set; }
    public Guid OperatorOrganizationId { get; set; }
    public Guid? AreaId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public FacilityType FacilityType { get; set; }
    public FacilityStatus Status { get; set; }

    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public int TotalCapacity { get; set; }
    public OccupancyMode OccupancyMode { get; set; }
    public string VehicleTypesCsv { get; set; } = string.Empty;
    public string? OperatingHoursJson { get; set; }

    public string? RejectionReason { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? ReviewedByKeycloakUserId { get; set; }
    public DateTimeOffset? ActivatedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string CreatedByKeycloakUserId { get; set; } = string.Empty;
    public string? UpdatedByKeycloakUserId { get; set; }

    public ICollection<Zones.ParkingZone> Zones { get; set; } = new List<Zones.ParkingZone>();
}
