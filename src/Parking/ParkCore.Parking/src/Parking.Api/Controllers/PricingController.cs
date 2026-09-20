using Microsoft.AspNetCore.Mvc;
using Parking.Api.Authorization;
using Parking.Api.DTOs;
using Parking.Api.Services;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/pricing")]
public class PricingController : ControllerBase
{
    private readonly IPricingService _pricing;

    public PricingController(IPricingService pricing) => _pricing = pricing;

    [HttpGet("products")]
    [RequirePermission(ParkingPermissions.PricingView)]
    public async Task<IActionResult> ListProducts([FromQuery] Guid organizationId, CancellationToken ct) =>
        Ok(await _pricing.ListProductsAsync(organizationId, ct));

    [HttpPost("products")]
    [RequirePermission(ParkingPermissions.PricingManage)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _pricing.CreateProductAsync(request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("rates")]
    [RequirePermission(ParkingPermissions.PricingView)]
    public async Task<IActionResult> ListRates([FromQuery] Guid organizationId, [FromQuery] Guid? facilityId, CancellationToken ct) =>
        Ok(await _pricing.ListRatesAsync(organizationId, facilityId, ct));

    [HttpPost("rates")]
    [RequirePermission(ParkingPermissions.PricingManage)]
    public async Task<IActionResult> CreateRate([FromBody] CreateRateRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _pricing.CreateRateAsync(request, actor, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("rates/{id:guid}")]
    [RequirePermission(ParkingPermissions.PricingManage)]
    public async Task<IActionResult> UpdateRate(Guid id, [FromBody] UpdateRateRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _pricing.UpdateRateAsync(id, request, ct));
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
