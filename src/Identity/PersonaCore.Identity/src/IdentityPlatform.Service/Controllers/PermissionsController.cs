using IdentityPlatform.Service.Domain.Entities;
using IdentityPlatform.Service.DTOs;
using IdentityPlatform.Service.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityPlatform.Service.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PermissionsController : ControllerBase
{
    private readonly IdentityDbContext _db;

    public PermissionsController(IdentityDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Permission>>> GetPermissions()
    {
        var permissions = await _db.Permissions.AsNoTracking().ToListAsync();
        return Ok(permissions);
    }

    [HttpPost]
    public async Task<ActionResult<Permission>> CreatePermission([FromBody] CreatePermissionRequest request)
    {
        var existing = await _db.Permissions.FirstOrDefaultAsync(p => p.Code == request.Code);
        if (existing != null)
        {
            return Conflict($"Permission '{request.Code}' already exists.");
        }

        var permission = new Permission
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Description = request.Description
        };

        _db.Permissions.Add(permission);
        await _db.SaveChangesAsync();

        return Ok(permission);
    }
}
