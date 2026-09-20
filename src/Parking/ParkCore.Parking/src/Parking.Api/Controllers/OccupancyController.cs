using Microsoft.AspNetCore.Mvc;
using Parking.Api.Authorization;
using Parking.Api.DTOs;
using Parking.Api.Services;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/occupancy")]
public class OccupancyController : ControllerBase
{
    private readonly IOccupancyService _occupancy;

    public OccupancyController(IOccupancyService occupancy) => _occupancy = occupancy;

    [HttpGet]
    [RequirePermission(ParkingPermissions.OccupancyView)]
    public async Task<IActionResult> GetCurrent([FromQuery] Guid facilityId, [FromQuery] Guid? zoneId, CancellationToken ct)
    {
        try
        {
            return Ok(await _occupancy.GetCurrentAsync(facilityId, zoneId, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{facilityId:guid}/manual")]
    [RequirePermission(ParkingPermissions.OccupancyUpdate)]
    public async Task<IActionResult> UpdateManual(Guid facilityId, [FromBody] ManualOccupancyRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _occupancy.UpdateManualAsync(facilityId, request, actor, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
