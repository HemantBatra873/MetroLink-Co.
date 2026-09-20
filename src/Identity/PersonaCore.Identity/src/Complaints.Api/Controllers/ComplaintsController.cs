using System.Security.Claims;
using Complaints.Api.Models;
using IdentityPlatform.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Complaints.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ComplaintsController : ControllerBase
{
    private static readonly List<Complaint> SampleComplaints = new()
    {
        new Complaint
        {
            Id = 101,
            Title = "Water supply leakage in Ward 1",
            Description = "Main pipe broken near street 4",
            Status = "Open",
            OrganizationId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), // Municipality A
            AreaId = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567803"), // Ward 1 (Gurgaon)
            AreaName = "Gurgaon / Ward 1"
        },
        new Complaint
        {
            Id = 102,
            Title = "Garbage collection delayed in Ward 2",
            Description = "Bin overflowing since yesterday",
            Status = "Open",
            OrganizationId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), // Municipality A
            AreaId = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567804"), // Ward 2 (Gurgaon)
            AreaName = "Gurgaon / Ward 2"
        },
        new Complaint
        {
            Id = 201,
            Title = "Streetlight failure in Ward 3",
            Description = "Sector 15 streetlights not functioning",
            Status = "Open",
            OrganizationId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), // Municipality A
            AreaId = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567806"), // Ward 3 (Faridabad)
            AreaName = "Faridabad / Ward 3"
        }
    };

    private readonly IAuthorizationEngine _authorizationEngine;

    public ComplaintsController(IAuthorizationEngine authorizationEngine)
    {
        _authorizationEngine = authorizationEngine;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Complaint>> GetComplaints() => Ok(SampleComplaints);

    [HttpPost("{id:int}/update")]
    public async Task<IActionResult> UpdateComplaint(int id, [FromBody] string newDescription, CancellationToken cancellationToken)
    {
        var complaint = SampleComplaints.FirstOrDefault(c => c.Id == id);
        if (complaint == null) return NotFound($"Complaint #{id} not found.");

        var keycloakUserId = GetCurrentUserId();
        if (string.IsNullOrEmpty(keycloakUserId))
        {
            return Unauthorized("User identity claim ('sub') missing from token.");
        }

        var authRequest = new AuthorizationRequest(
            KeycloakUserId: keycloakUserId,
            OrganizationId: complaint.OrganizationId,
            PermissionCode: "Complaint.Update",
            ResourceAreaId: complaint.AreaId
        );

        var authResult = await _authorizationEngine.EvaluateAsync(authRequest, cancellationToken);
        if (!authResult.IsAllowed)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Access Denied", Reason = authResult.Reason });
        }

        complaint.Description = newDescription;
        return Ok(new { Message = $"Complaint #{id} updated successfully.", Complaint = complaint });
    }

    [HttpPost("{id:int}/close")]
    public async Task<IActionResult> CloseComplaint(int id, CancellationToken cancellationToken)
    {
        var complaint = SampleComplaints.FirstOrDefault(c => c.Id == id);
        if (complaint == null) return NotFound($"Complaint #{id} not found.");

        var keycloakUserId = GetCurrentUserId();
        if (string.IsNullOrEmpty(keycloakUserId))
        {
            return Unauthorized("User identity claim ('sub') missing from token.");
        }

        var authRequest = new AuthorizationRequest(
            KeycloakUserId: keycloakUserId,
            OrganizationId: complaint.OrganizationId,
            PermissionCode: "Complaint.Close",
            ResourceAreaId: complaint.AreaId
        );

        var authResult = await _authorizationEngine.EvaluateAsync(authRequest, cancellationToken);
        if (!authResult.IsAllowed)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Message = "Access Denied", Reason = authResult.Reason });
        }

        complaint.Status = "Closed";
        return Ok(new { Message = $"Complaint #{id} closed successfully.", Complaint = complaint });
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? HttpContext.Request.Headers["X-Test-User-Sub"].FirstOrDefault();
    }
}
