using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain;
using Parking.Api.Domain.Pricing;
using Parking.Api.Infrastructure.Data;

namespace Parking.Tests;

public static class TestConfigSeed
{
    public static readonly Guid DemoOrganizationId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    public static readonly Guid HourlyProductId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    public static readonly Guid FreeHourlyProductId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
    public static readonly Guid PaidRateProductId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");

    public static async Task EnsureSeededAsync(ParkingDbContext db)
    {
        if (await db.ParkingProducts.AnyAsync(p => p.OrganizationId == DemoOrganizationId))
            return;

        var now = DateTimeOffset.UtcNow;
        db.ParkingProducts.AddRange(
            new ParkingProduct
            {
                Id = HourlyProductId,
                OrganizationId = DemoOrganizationId,
                Code = "HOURLY-PAID",
                Name = "Hourly Paid",
                ProductType = ProductType.Hourly,
                IsActive = true,
                CreatedAt = now
            },
            new ParkingProduct
            {
                Id = FreeHourlyProductId,
                OrganizationId = DemoOrganizationId,
                Code = "HOURLY-FREE",
                Name = "Hourly Free",
                ProductType = ProductType.Hourly,
                IsActive = true,
                CreatedAt = now
            });

        await db.SaveChangesAsync();
    }

    public static async Task<Guid> SeedPaidRateForFacilityAsync(ParkingDbContext db, Guid facilityId)
    {
        var rate = new ParkingRate
        {
            Id = Guid.NewGuid(),
            OrganizationId = DemoOrganizationId,
            FacilityId = facilityId,
            ProductId = HourlyProductId,
            VehicleType = VehicleType.Car,
            BaseAmount = 100,
            PerHourAmount = 50,
            EffectiveFrom = DateTimeOffset.UtcNow.AddDays(-1),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByKeycloakUserId = "seed"
        };
        db.ParkingRates.Add(rate);
        await db.SaveChangesAsync();
        return rate.Id;
    }

    public static async Task SeedFreeRateForFacilityAsync(ParkingDbContext db, Guid facilityId)
    {
        db.ParkingRates.Add(new ParkingRate
        {
            Id = Guid.NewGuid(),
            OrganizationId = DemoOrganizationId,
            FacilityId = facilityId,
            ProductId = FreeHourlyProductId,
            VehicleType = VehicleType.Car,
            BaseAmount = 0,
            PerHourAmount = 0,
            EffectiveFrom = DateTimeOffset.UtcNow.AddDays(-1),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByKeycloakUserId = "seed"
        });
        await db.SaveChangesAsync();
    }
}
