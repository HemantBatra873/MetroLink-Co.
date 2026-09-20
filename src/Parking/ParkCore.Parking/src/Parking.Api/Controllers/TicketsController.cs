using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Parking.Api.Authorization;
using Parking.Api.Infrastructure.Data;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/tickets")]
public class TicketsController : ControllerBase
{
    private readonly ParkingDbContext _db;

    public TicketsController(ParkingDbContext db) => _db = db;

    [HttpGet("{id:guid}")]
    [RequirePermission(ParkingPermissions.TicketView)]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var ticket = await _db.ParkingTickets.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id, ct);
        return ticket is null ? NotFound() : Ok(ticket);
    }
}
