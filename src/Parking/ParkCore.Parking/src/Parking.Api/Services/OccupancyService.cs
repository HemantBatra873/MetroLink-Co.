using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain;
using Parking.Api.Domain.Occupancy;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;

namespace Parking.Api.Services;

public record CurrentOccupancyDto(Guid FacilityId, Guid? ZoneId, int TotalCapacity, int Occupied, int Available, OccupancySource Source, DateTimeOffset RecordedAt);

public interface IOccupancyService
{
    Task<CurrentOccupancyDto> GetCurrentAsync(Guid facilityId, Guid? zoneId, CancellationToken ct);
    Task<OccupancySnapshot> UpdateManualAsync(Guid facilityId, ManualOccupancyRequest request, string actorId, CancellationToken ct);
    Task ApplyEntryAsync(Guid facilityId, Guid? zoneId, CancellationToken ct);
    Task ApplyExitAsync(Guid facilityId, Guid? zoneId, CancellationToken ct);
}

public class OccupancyService : IOccupancyService
{
    private readonly ParkingDbContext _db;

    public OccupancyService(ParkingDbContext db) => _db = db;

    public async Task<CurrentOccupancyDto> GetCurrentAsync(Guid facilityId, Guid? zoneId, CancellationToken ct)
    {
        var snapshot = await _db.OccupancySnapshots.AsNoTracking()
            .Where(s => s.FacilityId == facilityId && s.ZoneId == zoneId)
            .OrderByDescending(s => s.RecordedAt)
            .FirstOrDefaultAsync(ct);

        if (snapshot is not null)
        {
            return new CurrentOccupancyDto(snapshot.FacilityId, snapshot.ZoneId, snapshot.TotalCapacity, snapshot.Occupied, snapshot.Available, snapshot.Source, snapshot.RecordedAt);
        }

        var facility = await _db.ParkingFacilities.AsNoTracking().FirstOrDefaultAsync(f => f.Id == facilityId, ct)
            ?? throw new KeyNotFoundException("Facility not found.");

        var capacity = zoneId.HasValue
            ? await _db.ParkingZones.Where(z => z.Id == zoneId).Select(z => z.Capacity).FirstOrDefaultAsync(ct)
            : facility.TotalCapacity;

        var occupied = await _db.ParkingSessions.CountAsync(
            s => s.FacilityId == facilityId && s.ZoneId == zoneId && s.Status == SessionStatus.Active, ct);

        return new CurrentOccupancyDto(facilityId, zoneId, capacity, occupied, Math.Max(0, capacity - occupied), OccupancySource.EntryExit, DateTimeOffset.UtcNow);
    }

    public async Task<OccupancySnapshot> UpdateManualAsync(Guid facilityId, ManualOccupancyRequest request, string actorId, CancellationToken ct)
    {
        var facility = await _db.ParkingFacilities.FindAsync([facilityId], ct) ?? throw new KeyNotFoundException();
        var current = await GetCurrentAsync(facilityId, null, ct);
        var snapshot = new OccupancySnapshot
        {
            Id = Guid.NewGuid(),
            FacilityId = facilityId,
            ZoneId = null,
            TotalCapacity = current.TotalCapacity,
            Occupied = request.Occupied,
            Available = Math.Max(0, current.TotalCapacity - request.Occupied),
            Source = OccupancySource.Manual,
            RecordedAt = DateTimeOffset.UtcNow,
            RecordedByKeycloakUserId = actorId,
            Notes = request.Notes
        };
        _db.OccupancySnapshots.Add(snapshot);
        await _db.SaveChangesAsync(ct);
        return snapshot;
    }

    public async Task ApplyEntryAsync(Guid facilityId, Guid? zoneId, CancellationToken ct)
    {
        var current = await GetCurrentAsync(facilityId, zoneId, ct);
        await SaveSnapshotAsync(facilityId, zoneId, current.TotalCapacity, current.Occupied + 1, OccupancySource.EntryExit, ct);
    }

    public async Task ApplyExitAsync(Guid facilityId, Guid? zoneId, CancellationToken ct)
    {
        var current = await GetCurrentAsync(facilityId, zoneId, ct);
        var occupied = Math.Max(0, current.Occupied - 1);
        await SaveSnapshotAsync(facilityId, zoneId, current.TotalCapacity, occupied, OccupancySource.EntryExit, ct);
    }

    private async Task SaveSnapshotAsync(Guid facilityId, Guid? zoneId, int capacity, int occupied, OccupancySource source, CancellationToken ct)
    {
        _db.OccupancySnapshots.Add(new OccupancySnapshot
        {
            Id = Guid.NewGuid(),
            FacilityId = facilityId,
            ZoneId = zoneId,
            TotalCapacity = capacity,
            Occupied = occupied,
            Available = Math.Max(0, capacity - occupied),
            Source = source,
            RecordedAt = DateTimeOffset.UtcNow
        });
        await _db.SaveChangesAsync(ct);
    }
}
