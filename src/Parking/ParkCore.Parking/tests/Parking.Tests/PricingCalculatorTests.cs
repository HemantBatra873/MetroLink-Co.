using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain;
using Parking.Api.Domain.Facilities;
using Parking.Api.Domain.Pricing;
using Parking.Api.Infrastructure.Data;
using Parking.Api.Services;
using Xunit;

namespace Parking.Tests;

public class PricingCalculatorTests
{
    [Fact]
    public async Task Hourly_rate_uses_base_plus_per_hour_with_minimum_one_hour()
    {
        await using var db = CreateDb();
        var orgId = Guid.NewGuid();
        var facilityId = Guid.NewGuid();
        db.ParkingFacilities.Add(new ParkingFacility
        {
            Id = facilityId,
            OrganizationId = orgId,
            OwnerOrganizationId = orgId,
            OperatorOrganizationId = orgId,
            Name = "F",
            Code = "F1",
            FacilityType = FacilityType.Surface,
            Status = FacilityStatus.Active,
            TotalCapacity = 10,
            OccupancyMode = OccupancyMode.Capacity,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            CreatedByKeycloakUserId = "test"
        });
        var productId = Guid.NewGuid();
        db.ParkingProducts.Add(new ParkingProduct
        {
            Id = productId,
            OrganizationId = orgId,
            Code = "HOURLY",
            Name = "Hourly",
            ProductType = ProductType.Hourly,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        });
        db.ParkingRates.Add(new ParkingRate
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            FacilityId = facilityId,
            ProductId = productId,
            VehicleType = VehicleType.Car,
            BaseAmount = 50,
            PerHourAmount = 30,
            EffectiveFrom = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByKeycloakUserId = "test"
        });
        await db.SaveChangesAsync();

        var svc = new PricingService(db);
        var entry = new DateTimeOffset(2026, 1, 1, 10, 0, 0, TimeSpan.Zero);
        var exit = new DateTimeOffset(2026, 1, 1, 12, 0, 0, TimeSpan.Zero);
        var result = await svc.CalculateAmountAsync(facilityId, VehicleType.Car, entry, exit, null, CancellationToken.None);

        Assert.Equal(80m, result.Amount);
    }

    [Fact]
    public async Task Daily_product_uses_base_amount_only()
    {
        await using var db = CreateDb();
        var orgId = Guid.NewGuid();
        var facilityId = Guid.NewGuid();
        db.ParkingFacilities.Add(new ParkingFacility
        {
            Id = facilityId,
            OrganizationId = orgId,
            OwnerOrganizationId = orgId,
            OperatorOrganizationId = orgId,
            Name = "F",
            Code = "F1",
            FacilityType = FacilityType.Surface,
            Status = FacilityStatus.Active,
            TotalCapacity = 10,
            OccupancyMode = OccupancyMode.Capacity,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            CreatedByKeycloakUserId = "test"
        });
        var productId = Guid.NewGuid();
        db.ParkingProducts.Add(new ParkingProduct
        {
            Id = productId,
            OrganizationId = orgId,
            Code = "DAILY",
            Name = "Daily",
            ProductType = ProductType.Daily,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        });
        db.ParkingRates.Add(new ParkingRate
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            FacilityId = facilityId,
            ProductId = productId,
            VehicleType = VehicleType.Car,
            BaseAmount = 200,
            EffectiveFrom = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByKeycloakUserId = "test"
        });
        await db.SaveChangesAsync();

        var svc = new PricingService(db);
        var result = await svc.CalculateAmountAsync(facilityId, VehicleType.Car, DateTimeOffset.UtcNow.AddHours(-5), DateTimeOffset.UtcNow, productId, CancellationToken.None);
        Assert.Equal(200m, result.Amount);
    }

    private static ParkingDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ParkingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ParkingDbContext(options);
    }
}
