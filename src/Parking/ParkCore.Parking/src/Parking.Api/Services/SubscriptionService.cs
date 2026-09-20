using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain;
using Parking.Api.Domain.Subscriptions;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;

namespace Parking.Api.Services;

public interface ISubscriptionService
{
    Task<ParkingSubscription> CreateAsync(CreateSubscriptionRequest request, string actorId, CancellationToken ct);
    Task<ParkingSubscription> ActivateAsync(Guid id, string actorId, CancellationToken ct);
    Task<ParkingSubscription> CancelAsync(Guid id, string actorId, CancellationToken ct);
    Task<IReadOnlyList<ParkingSubscription>> ListAsync(Guid organizationId, Guid? facilityId, CancellationToken ct);
}

public class SubscriptionService : ISubscriptionService
{
    private readonly ParkingDbContext _db;

    public SubscriptionService(ParkingDbContext db) => _db = db;

    public async Task<ParkingSubscription> CreateAsync(CreateSubscriptionRequest request, string actorId, CancellationToken ct)
    {
        var sub = new ParkingSubscription
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            FacilityId = request.FacilityId,
            ProductId = request.ProductId,
            CustomerKeycloakUserId = request.CustomerKeycloakUserId,
            CustomerLabel = request.CustomerLabel,
            VehiclePlate = request.VehiclePlate,
            Status = SubscriptionStatus.Pending,
            StartsAt = request.StartsAt,
            EndsAt = request.EndsAt,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByKeycloakUserId = actorId
        };
        _db.ParkingSubscriptions.Add(sub);
        await _db.SaveChangesAsync(ct);
        return sub;
    }

    public async Task<ParkingSubscription> ActivateAsync(Guid id, string actorId, CancellationToken ct)
    {
        var sub = await _db.ParkingSubscriptions.FindAsync([id], ct) ?? throw new KeyNotFoundException();
        if (sub.Status != SubscriptionStatus.Pending)
            throw new InvalidOperationException("Only pending subscriptions can be activated.");
        sub.Status = SubscriptionStatus.Active;
        await _db.SaveChangesAsync(ct);
        return sub;
    }

    public async Task<ParkingSubscription> CancelAsync(Guid id, string actorId, CancellationToken ct)
    {
        var sub = await _db.ParkingSubscriptions.FindAsync([id], ct) ?? throw new KeyNotFoundException();
        sub.Status = SubscriptionStatus.Cancelled;
        await _db.SaveChangesAsync(ct);
        return sub;
    }

    public async Task<IReadOnlyList<ParkingSubscription>> ListAsync(Guid organizationId, Guid? facilityId, CancellationToken ct)
    {
        var q = _db.ParkingSubscriptions.AsNoTracking().Where(s => s.OrganizationId == organizationId);
        if (facilityId.HasValue)
            q = q.Where(s => s.FacilityId == facilityId);
        return await q.OrderByDescending(s => s.CreatedAt).ToListAsync(ct);
    }
}
