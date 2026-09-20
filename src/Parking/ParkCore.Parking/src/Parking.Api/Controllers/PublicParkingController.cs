using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;
using Parking.Api.Services;

namespace Parking.Api.Controllers;

[ApiController]
[Route("api/v1/public/parking")]
[AllowAnonymous]
public class PublicParkingController : ControllerBase
{
    private readonly ParkingDbContext _db;
    private readonly IOccupancyService _occupancy;

    public PublicParkingController(ParkingDbContext db, IOccupancyService occupancy)
    {
        _db = db;
        _occupancy = occupancy;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var facilities = await _db.ParkingFacilities.AsNoTracking()
            .Where(f => f.Status == FacilityStatus.Active)
            .OrderBy(f => f.Name)
            .ToListAsync(ct);

        var result = new List<PublicFacilityDto>();
        foreach (var f in facilities)
        {
            var occ = await _occupancy.GetCurrentAsync(f.Id, null, ct);
            result.Add(ToPublicDto(f, occ));
        }

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var f = await _db.ParkingFacilities.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.Status == FacilityStatus.Active, ct);
        if (f is null)
            return NotFound();

        var occ = await _occupancy.GetCurrentAsync(f.Id, null, ct);
        return Ok(ToPublicDto(f, occ));
    }

    private static PublicFacilityDto ToPublicDto(Domain.Facilities.ParkingFacility f, CurrentOccupancyDto occ) =>
        new(f.Id, f.Name, f.Code, f.FacilityType, f.Address, f.Latitude, f.Longitude,
            f.TotalCapacity, occ.Occupied, occ.Available, f.VehicleTypesCsv, f.OperatingHoursJson);
}
