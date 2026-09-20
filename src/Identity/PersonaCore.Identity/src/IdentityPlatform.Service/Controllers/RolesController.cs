using IdentityPlatform.Service.Domain.Entities;
using IdentityPlatform.Service.DTOs;
using IdentityPlatform.Service.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityPlatform.Service.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IdentityDbContext _db;

    public RolesController(IdentityDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Role>>> GetRoles([FromQuery] Guid? organizationId)
    {
        var query = _db.Roles.AsNoTracking();
        if (organizationId.HasValue)
        {
            query = query.Where(r => r.OrganizationId == organizationId.Value || r.OrganizationId == null);
        }

        var roles = await query
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .ToListAsync();
        return Ok(roles);
    }

    [HttpPost]
    public async Task<ActionResult<Role>> CreateRole([FromBody] CreateRoleRequest request)
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            Name = request.Name,
            Code = request.Code.ToUpperInvariant()
        };

        if (request.PermissionIds != null && request.PermissionIds.Any())
        {
            foreach (var permId in request.PermissionIds)
            {
                role.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permId });
            }
        }

        _db.Roles.Add(role);
        await _db.SaveChangesAsync();

        return Ok(role);
    }

    [HttpPost("{roleId:guid}/permissions")]
    public async Task<IActionResult> AssignPermissions(Guid roleId, [FromBody] AssignPermissionsToRoleRequest request)
    {
        var role = await _db.Roles.Include(r => r.RolePermissions).FirstOrDefaultAsync(r => r.Id == roleId);
        if (role == null) return NotFound($"Role {roleId} not found.");

        foreach (var permId in request.PermissionIds)
        {
            if (!role.RolePermissions.Any(rp => rp.PermissionId == permId))
            {
                role.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permId });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { Message = $"Permissions assigned successfully to role {role.Name}." });
    }
}
