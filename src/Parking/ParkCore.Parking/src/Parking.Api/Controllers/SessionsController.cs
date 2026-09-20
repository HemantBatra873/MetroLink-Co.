using Microsoft.AspNetCore.Mvc;
using Parking.Api.Authorization;
using Parking.Api.Domain;
using Parking.Api.DTOs;
using Parking.Api.Services;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/sessions")]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessions;
    private readonly IConfiguration _configuration;

    public SessionsController(ISessionService sessions, IConfiguration configuration)
    {
        _sessions = sessions;
        _configuration = configuration;
    }

    [HttpGet]
    [RequirePermission(ParkingPermissions.SessionView)]
    public async Task<IActionResult> List(
        [FromQuery] Guid organizationId,
        [FromQuery] Guid? facilityId,
        [FromQuery] SessionStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var (items, total) = await _sessions.ListAsync(organizationId, facilityId, status, page, pageSize, ct);
        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    [RequirePermission(ParkingPermissions.SessionView)]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var s = await _sessions.GetAsync(id, ct);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpPost]
    [RequirePermission(ParkingPermissions.SessionCreate)]
    public async Task<IActionResult> CreateEntry([FromBody] CreateSessionEntryRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            var session = await _sessions.CreateEntryAsync(request, actor, ct);
            return CreatedAtAction(nameof(Get), new { id = session.Id }, session);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/exit")]
    [RequirePermission(ParkingPermissions.SessionClose)]
    public async Task<IActionResult> Exit(Guid id, [FromBody] SessionExitRequest? request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _sessions.ExitAsync(id, request ?? new SessionExitRequest(null, null), actor, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/cancel")]
    [RequirePermission(ParkingPermissions.SessionClose)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _sessions.CancelAsync(id, actor, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/report-violation")]
    [RequirePermission(ParkingPermissions.ReportView)]
    public async Task<IActionResult> ReportViolation(Guid id, [FromBody] ReportViolationRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _sessions.ReportViolationAsync(id, request, actor, _configuration, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
