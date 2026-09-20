using Microsoft.AspNetCore.Mvc;
using Parking.Api.Authorization;
using Parking.Api.Services;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboard;

    public DashboardController(IDashboardService dashboard) => _dashboard = dashboard;

    [HttpGet]
    [RequirePermission(ParkingPermissions.ReportView)]
    public async Task<IActionResult> Get([FromQuery] Guid organizationId, CancellationToken ct) =>
        Ok(await _dashboard.GetStatsAsync(organizationId, ct));
}
