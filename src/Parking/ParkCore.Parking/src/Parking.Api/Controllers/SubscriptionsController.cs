using Microsoft.AspNetCore.Mvc;
using Parking.Api.Authorization;
using Parking.Api.DTOs;
using Parking.Api.Services;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/subscriptions")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptions;

    public SubscriptionsController(ISubscriptionService subscriptions) => _subscriptions = subscriptions;

    [HttpGet]
    [RequirePermission(ParkingPermissions.SubscriptionView)]
    public async Task<IActionResult> List([FromQuery] Guid organizationId, [FromQuery] Guid? facilityId, CancellationToken ct) =>
        Ok(await _subscriptions.ListAsync(organizationId, facilityId, ct));

    [HttpPost]
    [RequirePermission(ParkingPermissions.SubscriptionManage)]
    public async Task<IActionResult> Create([FromBody] CreateSubscriptionRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        return Ok(await _subscriptions.CreateAsync(request, actor, ct));
    }

    [HttpPost("{id:guid}/activate")]
    [RequirePermission(ParkingPermissions.SubscriptionManage)]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _subscriptions.ActivateAsync(id, actor, ct));
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
    [RequirePermission(ParkingPermissions.SubscriptionManage)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _subscriptions.CancelAsync(id, actor, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
