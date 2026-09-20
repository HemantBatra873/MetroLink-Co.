using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Payment.Api.Authorization;
using Payment.Api.Domain;
using Payment.Api.DTOs;
using Payment.Api.Services;

namespace Payment.Api.Controllers;

[ApiController]
[Route("api/v1/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentOrchestrationService _payments;
    private readonly IConfiguration _configuration;

    public PaymentsController(IPaymentOrchestrationService payments, IConfiguration configuration)
    {
        _payments = payments;
        _configuration = configuration;
    }

    [HttpPost("initiate")]
    [Authorize(Policy = PaymentPolicies.InitiatePayments)]
    public async Task<IActionResult> Initiate([FromBody] InitiatePaymentRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _payments.InitiateAsync(request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("stats")]
    [Authorize(Policy = PaymentPolicies.ViewPayments)]
    public async Task<IActionResult> Stats(
        [FromQuery] Guid? organizationId,
        [FromQuery] string? sourceSystem,
        CancellationToken ct)
    {
        if (!User.IsInRole(PaymentRoles.Admin) && organizationId is null)
            return BadRequest("organizationId is required for non-admin callers.");

        return Ok(await _payments.GetStatsAsync(organizationId, sourceSystem, ct));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = PaymentPolicies.ViewPayments)]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        try
        {
            return Ok(await _payments.GetByIdAsync(id, ct));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{id:guid}/events")]
    [Authorize(Policy = PaymentPolicies.ViewPayments)]
    public async Task<IActionResult> GetEvents(Guid id, CancellationToken ct)
    {
        try
        {
            return Ok(await _payments.GetEventsAsync(id, ct));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet]
    [Authorize(Policy = PaymentPolicies.ViewPayments)]
    public async Task<IActionResult> List(
        [FromQuery] Guid? organizationId,
        [FromQuery] Guid? payableReferenceId,
        [FromQuery] string? sourceSystem,
        [FromQuery] PaymentStatus? status,
        CancellationToken ct)
    {
        if (!User.IsInRole(PaymentRoles.Admin) && organizationId is null)
            return BadRequest("organizationId is required for non-admin callers.");

        return Ok(await _payments.ListAsync(organizationId, payableReferenceId, sourceSystem, status, ct));
    }

    [HttpPost("{id:guid}/complete-mock")]
    [AllowAnonymous]
    public async Task<IActionResult> CompleteMock(Guid id, CancellationToken ct)
    {
        try
        {
            return Ok(await _payments.CompleteMockAsync(id, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("webhooks/{provider}")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook(
        string provider,
        [FromBody] PaymentWebhookPayload payload,
        CancellationToken ct)
    {
        if (!ValidateWebhookSecret())
            return Unauthorized("Invalid webhook secret.");

        try
        {
            return Ok(await _payments.ProcessWebhookAsync(provider, payload, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private bool ValidateWebhookSecret()
    {
        var expected = _configuration["Payment:WebhookSecret"];
        if (string.IsNullOrEmpty(expected))
            return true;

        var provided = Request.Headers["X-Webhook-Secret"].FirstOrDefault();
        return string.Equals(expected, provided, StringComparison.Ordinal);
    }
}
