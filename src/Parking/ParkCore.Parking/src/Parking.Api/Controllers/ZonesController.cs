using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Parking.Api.Authorization;
using Parking.Api.Domain;
using Parking.Api.Domain.Spaces;
using Parking.Api.Domain.Zones;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/facilities/{facilityId:guid}/zones")]
public class ZonesController : ControllerBase
{
    private readonly ParkingDbContext _db;

    public ZonesController(ParkingDbContext db) => _db = db;

    [HttpGet]
    [RequirePermission(ParkingPermissions.ZoneView)]
    public async Task<IActionResult> List(Guid facilityId, CancellationToken ct)
    {
        var zones = await _db.ParkingZones.AsNoTracking().Where(z => z.FacilityId == facilityId).ToListAsync(ct);
        return Ok(zones);
    }

    [HttpPost]
    [RequirePermission(ParkingPermissions.ZoneManage)]
    public async Task<IActionResult> Create(Guid facilityId, [FromBody] CreateZoneRequest request, CancellationToken ct)
    {
        if (!await _db.ParkingFacilities.AnyAsync(f => f.Id == facilityId, ct))
            return NotFound("Facility not found.");

        var zone = new ParkingZone
        {
            Id = Guid.NewGuid(),
            FacilityId = facilityId,
            Name = request.Name,
            Code = request.Code,
            ZoneType = request.ZoneType,
            Capacity = request.Capacity,
            Status = ZoneStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _db.ParkingZones.Add(zone);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(List), new { facilityId }, zone);
    }

    [HttpPost("{zoneId:guid}/spaces")]
    [RequirePermission(ParkingPermissions.SpaceManage)]
    public async Task<IActionResult> CreateSpace(Guid facilityId, Guid zoneId, [FromBody] CreateSpaceRequest request, CancellationToken ct)
    {
        var zone = await _db.ParkingZones.FirstOrDefaultAsync(z => z.Id == zoneId && z.FacilityId == facilityId, ct);
        if (zone is null)
            return NotFound();

        var space = new ParkingSpace
        {
            Id = Guid.NewGuid(),
            ZoneId = zoneId,
            Code = request.Code,
            Status = SpaceStatus.Active,
            IsOccupied = false,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _db.ParkingSpaces.Add(space);
        await _db.SaveChangesAsync(ct);
        return Ok(space);
    }

    [HttpGet("{zoneId:guid}/spaces")]
    [RequirePermission(ParkingPermissions.SpaceView)]
    public async Task<IActionResult> ListSpaces(Guid facilityId, Guid zoneId, CancellationToken ct)
    {
        if (!await _db.ParkingZones.AnyAsync(z => z.Id == zoneId && z.FacilityId == facilityId, ct))
            return NotFound();

        var spaces = await _db.ParkingSpaces.AsNoTracking().Where(s => s.ZoneId == zoneId).ToListAsync(ct);
        return Ok(spaces);
    }
}
