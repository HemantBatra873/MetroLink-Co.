using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain;
using Parking.Api.Domain.Sessions;
using Parking.Api.Domain.Tickets;
using Parking.Api.Infrastructure.Data;

namespace Parking.Api.Services;

public interface ITicketService
{
    Task<ParkingTicket> IssueOnEntryAsync(ParkingSession session, CancellationToken ct);
    Task<ParkingTicket?> CompleteOnSessionCompleteAsync(ParkingSession session, CancellationToken ct);
}

public class TicketService : ITicketService
{
    private readonly ParkingDbContext _db;

    public TicketService(ParkingDbContext db) => _db = db;

    public async Task<ParkingTicket> IssueOnEntryAsync(ParkingSession session, CancellationToken ct)
    {
        var ticket = new ParkingTicket
        {
            Id = Guid.NewGuid(),
            TicketNumber = await NextTicketNumberAsync(ct),
            SessionId = session.Id,
            FacilityId = session.FacilityId,
            VehiclePlate = session.VehiclePlate,
            IssuedAt = DateTimeOffset.UtcNow,
            EntryTime = session.EntryTime,
            Currency = session.Currency,
            Status = TicketStatus.Issued
        };
        _db.ParkingTickets.Add(ticket);
        session.TicketId = ticket.Id;
        await _db.SaveChangesAsync(ct);
        return ticket;
    }

    public async Task<ParkingTicket?> CompleteOnSessionCompleteAsync(ParkingSession session, CancellationToken ct)
    {
        if (session.TicketId is null)
            return null;

        var ticket = await _db.ParkingTickets.FirstOrDefaultAsync(t => t.Id == session.TicketId, ct);
        if (ticket is null)
            return null;

        ticket.Status = TicketStatus.Completed;
        ticket.ExitTime = session.ExitTime;
        ticket.Amount = session.CalculatedAmount;
        await _db.SaveChangesAsync(ct);
        return ticket;
    }

    private async Task<string> NextTicketNumberAsync(CancellationToken ct)
    {
        for (var i = 0; i < 5; i++)
        {
            var number = $"TKT-{DateTimeOffset.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
            if (!await _db.ParkingTickets.AnyAsync(t => t.TicketNumber == number, ct))
                return number;
        }

        return $"TKT-{Guid.NewGuid():N}"[..24];
    }
}
