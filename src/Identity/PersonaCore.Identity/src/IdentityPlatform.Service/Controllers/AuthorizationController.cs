using IdentityPlatform.Service.Services;
using Microsoft.AspNetCore.Mvc;

namespace IdentityPlatform.Service.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthorizationController : ControllerBase
{
    private readonly IAuthorizationEngine _authorizationEngine;

    public AuthorizationController(IAuthorizationEngine authorizationEngine)
    {
        _authorizationEngine = authorizationEngine;
    }

    [HttpPost("evaluate")]
    public async Task<ActionResult<AuthorizationResult>> Evaluate([FromBody] AuthorizationRequest request, CancellationToken cancellationToken)
    {
        if (request == null)
        {
            return BadRequest("Authorization request body is required.");
        }

        var result = await _authorizationEngine.EvaluateAsync(request, cancellationToken);
        return Ok(result);
    }
}
