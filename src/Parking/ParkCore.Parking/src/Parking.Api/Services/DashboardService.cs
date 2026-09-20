using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;

namespace Parking.Api.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(Guid organizationId, CancellationToken ct);
}

public class DashboardService : IDashboardService
{
    private readonly ParkingDbContext _db;

    public DashboardService(ParkingDbContext db) => _db = db;

    public async Task<DashboardStatsDto> GetStatsAsync(Guid organizationId, CancellationToken ct)
    {
        var facilities = _db.ParkingFacilities.AsNoTracking()
            .Where(f => f.OrganizationId == organizationId || f.OwnerOrganizationId == organizationId || f.OperatorOrganizationId == organizationId);

        var facilityList = await facilities.ToListAsync(ct);
        var totalFacilities = facilityList.Count;
        var activeFacilities = facilityList.Count(f => f.Status == FacilityStatus.Active);
        var facilityIds = facilityList.Select(f => f.Id).ToList();

        var totalCapacity = facilityList.Where(f => f.Status == FacilityStatus.Active).Sum(f => f.TotalCapacity);

        var occupied = 0;
        foreach (var facilityId in facilityIds.Where(id => facilityList.Any(f => f.Id == id && f.Status == FacilityStatus.Active)))
        {
            var snap = await _db.OccupancySnapshots.AsNoTracking()
                .Where(s => s.FacilityId == facilityId && s.ZoneId == null)
                .OrderByDescending(s => s.RecordedAt)
                .FirstOrDefaultAsync(ct);
            occupied += snap?.Occupied ?? 0;
        }

        var available = Math.Max(0, totalCapacity - occupied);

        var dayStart = DateTimeOffset.UtcNow.Date;
        var todayEntries = await _db.ParkingSessions.AsNoTracking()
            .CountAsync(s => s.OrganizationId == organizationId && s.EntryTime >= dayStart, ct);
        var todayExits = await _db.ParkingSessions.AsNoTracking()
            .CountAsync(s => s.OrganizationId == organizationId && s.ExitTime != null && s.ExitTime >= dayStart, ct);

        var activeSessions = await _db.ParkingSessions.AsNoTracking()
            .CountAsync(s => s.OrganizationId == organizationId && s.Status == SessionStatus.Active, ct);

        var obligations = _db.FinancialObligations.AsNoTracking()
            .Where(o => o.OrganizationId == organizationId
                && (o.Status == ObligationStatus.Outstanding || o.Status == ObligationStatus.PartiallyPaid));

        var openObligations = await obligations.CountAsync(ct);
        var outstanding = await obligations.SumAsync(o => o.Amount - o.AmountPaid, ct);

        var recent = await _db.ParkingAuditEvents.AsNoTracking()
            .Where(a => a.OrganizationId == organizationId)
            .OrderByDescending(a => a.OccurredAt)
            .Take(10)
            .Select(a => new RecentParkingActivityDto(a.SessionId, a.FacilityId, a.EventType, a.OccurredAt))
            .ToListAsync(ct);

        return new DashboardStatsDto(
            totalFacilities,
            activeFacilities,
            totalCapacity,
            occupied,
            available,
            todayEntries,
            todayExits,
            activeSessions,
            openObligations,
            outstanding,
            recent);
    }
}
