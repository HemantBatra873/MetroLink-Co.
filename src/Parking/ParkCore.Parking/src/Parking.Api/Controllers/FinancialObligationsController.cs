using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Parking.Api.Authorization;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;
using Parking.Api.Services;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/financial-obligations")]
public class FinancialObligationsController : ControllerBase
{
    private readonly ISessionService _sessions;
    private readonly ParkingDbContext _db;

    public FinancialObligationsController(ISessionService sessions, ParkingDbContext db)
    {
        _sessions = sessions;
        _db = db;
    }

    [HttpGet("{id:guid}")]
    [RequirePermission(ParkingPermissions.SessionView)]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var o = await _db.FinancialObligations.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return o is null ? NotFound() : Ok(o);
    }

    [HttpPost("{id:guid}/mark-paid")]
    public async Task<IActionResult> MarkPaid(Guid id, [FromBody] MarkObligationPaidRequest request, CancellationToken ct)
    {
        var expected = HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Internal:ServiceKey"];
        var provided = Request.Headers["X-Internal-Service-Key"].FirstOrDefault();
        var env = HttpContext.RequestServices.GetRequiredService<IHostEnvironment>();
        if (!env.IsEnvironment("Testing")
            && !string.IsNullOrEmpty(expected)
            && !string.Equals(expected, provided, StringComparison.Ordinal))
        {
            return Unauthorized("Invalid service key.");
        }

        try
        {
            return Ok(await _sessions.ApplyPaymentAsync(id, request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
