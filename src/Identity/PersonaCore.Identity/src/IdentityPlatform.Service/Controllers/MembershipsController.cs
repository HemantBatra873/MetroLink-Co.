using IdentityPlatform.Service.Domain.Entities;
using IdentityPlatform.Service.DTOs;
using IdentityPlatform.Service.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityPlatform.Service.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MembershipsController : ControllerBase
{
    private readonly IdentityDbContext _db;

    public MembershipsController(IdentityDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Membership>>> GetMemberships([FromQuery] Guid? userId, [FromQuery] Guid? organizationId)
    {
        var query = _db.Memberships.AsNoTracking();
        if (userId.HasValue) query = query.Where(m => m.UserId == userId.Value);
        if (organizationId.HasValue) query = query.Where(m => m.OrganizationId == organizationId.Value);

        var memberships = await query
            .Include(m => m.User)
            .Include(m => m.Organization)
            .Include(m => m.OrganizationUnit)
            .Include(m => m.Role)
            .Include(m => m.ScopeArea)
            .ToListAsync();

        return Ok(memberships);
    }

    [HttpPost]
    public async Task<ActionResult<Membership>> CreateMembership([FromBody] CreateMembershipRequest request)
    {
        var membership = new Membership
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            OrganizationId = request.OrganizationId,
            OrganizationUnitId = request.OrganizationUnitId,
            RoleId = request.RoleId,
            ScopeAreaId = request.ScopeAreaId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Memberships.Add(membership);
        await _db.SaveChangesAsync();

        return Ok(membership);
    }
}
