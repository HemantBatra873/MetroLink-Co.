namespace Parking.Api.Domain.Tickets;

public class ParkingTicket
{
    public Guid Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public Guid SessionId { get; set; }
    public Guid FacilityId { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset EntryTime { get; set; }
    public DateTimeOffset? ExitTime { get; set; }
    public decimal? Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public TicketStatus Status { get; set; }
}
