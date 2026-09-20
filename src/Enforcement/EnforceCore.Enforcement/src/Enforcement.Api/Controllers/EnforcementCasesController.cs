using Enforcement.Api.Authorization;
using Enforcement.Api.Domain;
using Enforcement.Api.DTOs;
using Enforcement.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Enforcement.Api.Controllers;

[ApiController]
[Route("api/v1/enforcement-cases")]
public class EnforcementCasesController : ControllerBase
{
    private readonly ICaseService _cases;

    public EnforcementCasesController(ICaseService cases) => _cases = cases;

    [HttpGet]
    [RequirePermission(EnforcementPermissions.CaseView)]
    public async Task<IActionResult> List(
        [FromQuery] Guid organizationId,
        [FromQuery] CaseStatus? status,
        [FromQuery] Guid? domainId,
        [FromQuery] Guid? areaId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var (items, total) = await _cases.ListAsync(organizationId, status, domainId, areaId, search, page, pageSize, ct);
        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    [RequirePermission(EnforcementPermissions.CaseView)]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var c = await _cases.GetAsync(id, ct);
        return c is null ? NotFound() : Ok(c);
    }

    [HttpPost]
    [RequirePermission(EnforcementPermissions.CaseCreate)]
    public async Task<IActionResult> Create([FromBody] CreateCaseRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized("User identity claim ('sub') missing from token.");
        try
        {
            var created = await _cases.CreateAsync(request, actor, ct);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/assign")]
    [RequirePermission(EnforcementPermissions.CaseAssign)]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignCaseRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _cases.AssignAsync(id, request, actor, ct));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id:guid}/issue")]
    [RequirePermission(EnforcementPermissions.CaseIssue)]
    public async Task<IActionResult> Issue(Guid id, [FromBody] IssueCaseRequest? request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _cases.IssueAsync(id, request ?? new IssueCaseRequest(null, null), actor, ct));
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
    [RequirePermission(EnforcementPermissions.CaseCancel)]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelCaseRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _cases.CancelAsync(id, request, actor, ct));
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

    [HttpPost("{id:guid}/dispute")]
    [RequirePermission(EnforcementPermissions.CaseDispute)]
    public async Task<IActionResult> Dispute(Guid id, [FromBody] DisputeCaseRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _cases.DisputeAsync(id, request, actor, ct));
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

    [HttpPost("{id:guid}/review")]
    [RequirePermission(EnforcementPermissions.CaseReview)]
    public async Task<IActionResult> Review(Guid id, [FromBody] ReviewCaseRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _cases.ReviewAsync(id, request, actor, ct));
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

    [HttpPost("{id:guid}/evidence")]
    [RequirePermission(EnforcementPermissions.CaseUpdate)]
    public async Task<IActionResult> AddEvidence(Guid id, [FromBody] AddEvidenceRequest request, CancellationToken ct)
    {
        var actor = CurrentUser.GetKeycloakUserId(HttpContext);
        if (string.IsNullOrEmpty(actor)) return Unauthorized();
        try
        {
            return Ok(await _cases.AddEvidenceAsync(id, request, actor, ct));
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

[ApiController]
[Route("api/v1/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly ICaseService _cases;
    public DashboardController(ICaseService cases) => _cases = cases;

    [HttpGet]
    [RequirePermission(EnforcementPermissions.CaseView)]
    public async Task<IActionResult> Get([FromQuery] Guid organizationId, CancellationToken ct) =>
        Ok(await _cases.GetDashboardAsync(organizationId, ct));
}

[ApiController]
[Route("api/v1/financial-obligations")]
public class FinancialObligationsController : ControllerBase
{
    private readonly ICaseService _cases;
    private readonly Infrastructure.Data.EnforcementDbContext _db;

    public FinancialObligationsController(ICaseService cases, Infrastructure.Data.EnforcementDbContext db)
    {
        _cases = cases;
        _db = db;
    }

    [HttpGet("{id:guid}")]
    [RequirePermission(EnforcementPermissions.PaymentView)]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var o = await _db.FinancialObligations.FindAsync([id], ct);
        return o is null ? NotFound() : Ok(o);
    }

    /// <summary>
    /// Settlement callback for CashCore Payment (or any caller). Protected by shared service key.
    /// Payment posts here via SuccessCallbackUrl registered at initiate time — Enforcement owns applying the obligation.
    /// </summary>
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
            return Ok(await _cases.ApplyPaymentAsync(id, request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
