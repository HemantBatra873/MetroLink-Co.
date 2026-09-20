namespace Parking.Api.Domain.Zones;

public class ParkingZone
{
    public Guid Id { get; set; }
    public Guid FacilityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? ZoneType { get; set; }
    public int Capacity { get; set; }
    public ZoneStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Facilities.ParkingFacility? Facility { get; set; }
    public ICollection<Spaces.ParkingSpace> Spaces { get; set; } = new List<Spaces.ParkingSpace>();
}
