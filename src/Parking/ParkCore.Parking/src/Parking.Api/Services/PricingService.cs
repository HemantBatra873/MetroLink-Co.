using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain;
using Parking.Api.Domain.Pricing;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;

namespace Parking.Api.Services;

public record PricingResult(decimal Amount, string Currency, Guid RateId, Guid ProductId);

public interface IPricingService
{
    Task<ParkingProduct> CreateProductAsync(CreateProductRequest request, CancellationToken ct);
    Task<IReadOnlyList<ParkingProduct>> ListProductsAsync(Guid organizationId, CancellationToken ct);
    Task<ParkingRate> CreateRateAsync(CreateRateRequest request, string actorId, CancellationToken ct);
    Task<ParkingRate> UpdateRateAsync(Guid id, UpdateRateRequest request, CancellationToken ct);
    Task<IReadOnlyList<ParkingRate>> ListRatesAsync(Guid organizationId, Guid? facilityId, CancellationToken ct);
    Task<PricingResult> CalculateAmountAsync(Guid facilityId, VehicleType vehicleType, DateTimeOffset entry, DateTimeOffset exit, Guid? productId, CancellationToken ct);
}

public class PricingService : IPricingService
{
    private readonly ParkingDbContext _db;

    public PricingService(ParkingDbContext db) => _db = db;

    public async Task<ParkingProduct> CreateProductAsync(CreateProductRequest request, CancellationToken ct)
    {
        var exists = await _db.ParkingProducts.AnyAsync(p => p.OrganizationId == request.OrganizationId && p.Code == request.Code, ct);
        if (exists)
            throw new InvalidOperationException("Product code already exists.");

        var product = new ParkingProduct
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            Code = request.Code,
            Name = request.Name,
            ProductType = request.ProductType,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _db.ParkingProducts.Add(product);
        await _db.SaveChangesAsync(ct);
        return product;
    }

    public async Task<IReadOnlyList<ParkingProduct>> ListProductsAsync(Guid organizationId, CancellationToken ct) =>
        await _db.ParkingProducts.AsNoTracking().Where(p => p.OrganizationId == organizationId).OrderBy(p => p.Code).ToListAsync(ct);

    public async Task<ParkingRate> CreateRateAsync(CreateRateRequest request, string actorId, CancellationToken ct)
    {
        await EnsureNoOverlapAsync(request.OrganizationId, request.FacilityId, request.ProductId, request.VehicleType,
            request.EffectiveFrom, request.EffectiveTo, excludeRateId: null, ct);

        var rate = new ParkingRate
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            FacilityId = request.FacilityId,
            ProductId = request.ProductId,
            VehicleType = request.VehicleType,
            Currency = "INR",
            BaseAmount = request.BaseAmount,
            PerHourAmount = request.PerHourAmount,
            MaxDailyAmount = request.MaxDailyAmount,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByKeycloakUserId = actorId
        };
        _db.ParkingRates.Add(rate);
        await _db.SaveChangesAsync(ct);
        return rate;
    }

    public async Task<ParkingRate> UpdateRateAsync(Guid id, UpdateRateRequest request, CancellationToken ct)
    {
        var rate = await _db.ParkingRates.FindAsync([id], ct) ?? throw new KeyNotFoundException();
        if (request.IsActive)
        {
            await EnsureNoOverlapAsync(rate.OrganizationId, rate.FacilityId, rate.ProductId, rate.VehicleType,
                rate.EffectiveFrom, request.EffectiveTo ?? rate.EffectiveTo, excludeRateId: id, ct);
        }

        rate.BaseAmount = request.BaseAmount;
        rate.PerHourAmount = request.PerHourAmount;
        rate.MaxDailyAmount = request.MaxDailyAmount;
        rate.EffectiveTo = request.EffectiveTo ?? rate.EffectiveTo;
        rate.IsActive = request.IsActive;
        await _db.SaveChangesAsync(ct);
        return rate;
    }

    public async Task<IReadOnlyList<ParkingRate>> ListRatesAsync(Guid organizationId, Guid? facilityId, CancellationToken ct)
    {
        var q = _db.ParkingRates.AsNoTracking().Include(r => r.Product).Where(r => r.OrganizationId == organizationId);
        if (facilityId.HasValue)
            q = q.Where(r => r.FacilityId == facilityId || r.FacilityId == null);
        return await q.OrderByDescending(r => r.EffectiveFrom).ToListAsync(ct);
    }

    public async Task<PricingResult> CalculateAmountAsync(
        Guid facilityId, VehicleType vehicleType, DateTimeOffset entry, DateTimeOffset exit, Guid? productId, CancellationToken ct)
    {
        var facility = await _db.ParkingFacilities.AsNoTracking().FirstOrDefaultAsync(f => f.Id == facilityId, ct)
            ?? throw new InvalidOperationException("Facility not found.");

        var at = entry;
        var rate = await FindActiveRateAsync(facility.OrganizationId, facilityId, vehicleType, productId, at, ct)
            ?? throw new InvalidOperationException("No active parking rate found.");

        var product = await _db.ParkingProducts.AsNoTracking().FirstAsync(p => p.Id == rate.ProductId, ct);
        decimal amount;

        if (product.ProductType == ProductType.Daily)
        {
            amount = rate.BaseAmount;
        }
        else
        {
            var hours = Math.Max(1, (int)Math.Ceiling((exit - entry).TotalHours));
            if (rate.PerHourAmount.HasValue && rate.BaseAmount > 0)
                amount = rate.BaseAmount + rate.PerHourAmount.Value * (hours - 1);
            else if (rate.PerHourAmount.HasValue)
                amount = rate.PerHourAmount.Value * hours;
            else
                amount = rate.BaseAmount * hours;

            if (rate.MaxDailyAmount.HasValue && amount > rate.MaxDailyAmount.Value)
                amount = rate.MaxDailyAmount.Value;
        }

        return new PricingResult(amount, rate.Currency, rate.Id, rate.ProductId);
    }

    private async Task<ParkingRate?> FindActiveRateAsync(
        Guid organizationId, Guid facilityId, VehicleType vehicleType, Guid? productId, DateTimeOffset at, CancellationToken ct)
    {
        var hourlyProductIds = productId.HasValue
            ? [productId.Value]
            : await _db.ParkingProducts.AsNoTracking()
                .Where(p => p.OrganizationId == organizationId && p.IsActive && p.ProductType == ProductType.Hourly)
                .Select(p => p.Id)
                .ToListAsync(ct);

        if (hourlyProductIds.Count == 0 && productId.HasValue)
            hourlyProductIds = [productId.Value];

        var rates = await _db.ParkingRates.AsNoTracking()
            .Where(r => r.OrganizationId == organizationId && r.IsActive && r.VehicleType == vehicleType)
            .Where(r => hourlyProductIds.Contains(r.ProductId))
            .Where(r => r.EffectiveFrom <= at && (r.EffectiveTo == null || r.EffectiveTo >= at))
            .Where(r => r.FacilityId == facilityId || r.FacilityId == null)
            .ToListAsync(ct);

        return rates
            .OrderByDescending(r => r.FacilityId == facilityId)
            .ThenByDescending(r => r.EffectiveFrom)
            .FirstOrDefault();
    }

    private async Task EnsureNoOverlapAsync(
        Guid organizationId,
        Guid? facilityId,
        Guid productId,
        VehicleType vehicleType,
        DateTimeOffset effectiveFrom,
        DateTimeOffset? effectiveTo,
        Guid? excludeRateId,
        CancellationToken ct)
    {
        var end = effectiveTo ?? DateTimeOffset.MaxValue;
        var overlapping = await _db.ParkingRates
            .Where(r => r.IsActive && r.OrganizationId == organizationId && r.ProductId == productId && r.VehicleType == vehicleType)
            .Where(r => r.FacilityId == facilityId)
            .Where(r => excludeRateId == null || r.Id != excludeRateId)
            .Where(r => r.EffectiveFrom < end && (r.EffectiveTo == null || r.EffectiveTo > effectiveFrom))
            .AnyAsync(ct);

        if (overlapping)
            throw new InvalidOperationException("An active rate already exists for this facility, product, and vehicle type in the given period.");
    }
}
