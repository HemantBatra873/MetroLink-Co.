using Microsoft.AspNetCore.Mvc;
using Parking.Api.Authorization;
using Parking.Api.Domain;
using Parking.Api.DTOs;
using Parking.Api.Services;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/facilities")]
public class FacilitiesController : ControllerBase
{
    private readonly IFacilityService _facilities;

    public FacilitiesController(IFacilityService facilities) => _facilities = facilities;

    [HttpGet]
    [RequirePermission(ParkingPermissions.FacilityView)]
    public async Task<IActionResult> List([FromQuery] Guid organizationId, [FromQuery] FacilityStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var (items, total) = await _facilities.ListAsync(organizationId, status, page, pageSize, ct);
        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    [RequirePermission(ParkingPermissions.FacilityView)]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var f = await _facilities.GetAsync(id, ct);
        return f is null ? NotFound() : Ok(f);
    }

    [HttpPost]
    [RequirePermission(ParkingPermissions.FacilityCreate)]
    public async Task<IActionResult> Create([FromBody] CreateFacilityRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            var created = await _facilities.CreateAsync(request, actor, ct);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [RequirePermission(ParkingPermissions.FacilityUpdate)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFacilityRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _facilities.UpdateAsync(id, request, actor, ct));
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

    [HttpPost("{id:guid}/submit")]
    [RequirePermission(ParkingPermissions.FacilitySubmit)]
    public async Task<IActionResult> Submit(Guid id, CancellationToken ct) => await Lifecycle(id, ct, _facilities.SubmitAsync);

    [HttpPost("{id:guid}/start-review")]
    [RequirePermission(ParkingPermissions.FacilityVerify)]
    public async Task<IActionResult> StartReview(Guid id, CancellationToken ct) => await Lifecycle(id, ct, _facilities.StartReviewAsync);

    [HttpPost("{id:guid}/approve")]
    [RequirePermission(ParkingPermissions.FacilityVerify)]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct) => await Lifecycle(id, ct, _facilities.ApproveAsync);

    [HttpPost("{id:guid}/reject")]
    [RequirePermission(ParkingPermissions.FacilityVerify)]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectFacilityRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _facilities.RejectAsync(id, request, actor, ct));
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

    [HttpPost("{id:guid}/activate")]
    [RequirePermission(ParkingPermissions.FacilityActivate)]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct) => await Lifecycle(id, ct, _facilities.ActivateAsync);

    [HttpPost("{id:guid}/suspend")]
    [RequirePermission(ParkingPermissions.FacilitySuspend)]
    public async Task<IActionResult> Suspend(Guid id, CancellationToken ct) => await Lifecycle(id, ct, _facilities.SuspendAsync);

    [HttpPost("{id:guid}/close")]
    [RequirePermission(ParkingPermissions.FacilityUpdate)]
    public async Task<IActionResult> Close(Guid id, CancellationToken ct) => await Lifecycle(id, ct, _facilities.CloseAsync);

    private async Task<IActionResult> Lifecycle(Guid id, CancellationToken ct, Func<Guid, string, CancellationToken, Task<Domain.Facilities.ParkingFacility>> action)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await action(id, actor, ct));
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
}
