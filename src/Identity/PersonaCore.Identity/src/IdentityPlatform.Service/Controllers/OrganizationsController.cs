using IdentityPlatform.Service.Domain.Entities;
using IdentityPlatform.Service.DTOs;
using IdentityPlatform.Service.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityPlatform.Service.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class OrganizationsController : ControllerBase
{
    private readonly IdentityDbContext _db;

    public OrganizationsController(IdentityDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Organization>>> GetOrganizations()
    {
        var orgs = await _db.Organizations
            .AsNoTracking()
            .Include(o => o.Units)
            .Include(o => o.Areas)
            .ToListAsync();
        return Ok(orgs);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Organization>> GetOrganizationById(Guid id)
    {
        var org = await _db.Organizations
            .AsNoTracking()
            .Include(o => o.Units)
            .Include(o => o.Areas)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (org == null) return NotFound();
        return Ok(org);
    }

    [HttpPost]
    public async Task<ActionResult<Organization>> CreateOrganization([FromBody] CreateOrganizationRequest request)
    {
        var org = new Organization
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code.ToUpperInvariant(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Organizations.Add(org);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrganizationById), new { id = org.Id }, org);
    }

    [HttpPost("{organizationId:guid}/units")]
    public async Task<ActionResult<OrganizationUnit>> CreateOrganizationUnit(Guid organizationId, [FromBody] CreateOrganizationUnitRequest request)
    {
        var orgExists = await _db.Organizations.AnyAsync(o => o.Id == organizationId);
        if (!orgExists) return NotFound($"Organization {organizationId} not found.");

        var unit = new OrganizationUnit
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            ParentUnitId = request.ParentUnitId,
            Name = request.Name,
            Code = request.Code.ToUpperInvariant(),
            CreatedAt = DateTime.UtcNow
        };

        _db.OrganizationUnits.Add(unit);
        await _db.SaveChangesAsync();

        return Ok(unit);
    }
}
