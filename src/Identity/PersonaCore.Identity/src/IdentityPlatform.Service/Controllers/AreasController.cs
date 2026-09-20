using IdentityPlatform.Service.Domain.Entities;
using IdentityPlatform.Service.DTOs;
using IdentityPlatform.Service.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityPlatform.Service.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AreasController : ControllerBase
{
    private readonly IdentityDbContext _db;

    public AreasController(IdentityDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Area>>> GetAreas([FromQuery] Guid? organizationId)
    {
        var query = _db.Areas.AsNoTracking();
        if (organizationId.HasValue)
        {
            query = query.Where(a => a.OrganizationId == organizationId.Value);
        }

        var areas = await query.Include(a => a.ChildAreas).ToListAsync();
        return Ok(areas);
    }

    [HttpPost]
    public async Task<ActionResult<Area>> CreateArea([FromBody] CreateAreaRequest request)
    {
        var area = new Area
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            ParentAreaId = request.ParentAreaId,
            Name = request.Name,
            Code = request.Code.ToUpperInvariant(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Areas.Add(area);
        await _db.SaveChangesAsync();

        return Ok(area);
    }
}
