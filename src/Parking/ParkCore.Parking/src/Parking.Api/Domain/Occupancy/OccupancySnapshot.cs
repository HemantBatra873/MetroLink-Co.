namespace Parking.Api.Domain.Occupancy;

public class OccupancySnapshot
{
    public Guid Id { get; set; }
    public Guid FacilityId { get; set; }
    public Guid? ZoneId { get; set; }
    public int TotalCapacity { get; set; }
    public int Occupied { get; set; }
    public int Available { get; set; }
    public OccupancySource Source { get; set; }
    public DateTimeOffset RecordedAt { get; set; }
    public string? RecordedByKeycloakUserId { get; set; }
    public string? Notes { get; set; }
}
