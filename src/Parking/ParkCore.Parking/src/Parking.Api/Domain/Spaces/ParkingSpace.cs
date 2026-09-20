namespace Parking.Api.Domain.Spaces;

public class ParkingSpace
{
    public Guid Id { get; set; }
    public Guid ZoneId { get; set; }
    public string Code { get; set; } = string.Empty;
    public SpaceStatus Status { get; set; }
    public bool IsOccupied { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Zones.ParkingZone? Zone { get; set; }
}
