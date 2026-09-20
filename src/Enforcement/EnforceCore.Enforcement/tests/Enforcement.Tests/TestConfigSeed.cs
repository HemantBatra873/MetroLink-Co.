using Enforcement.Api.Domain;
using Enforcement.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Enforcement.Tests;

/// <summary>
/// Test-only configuration fixture. Production/API startup does not seed data.
/// </summary>
public static class TestConfigSeed
{
    public static readonly Guid DemoOrganizationId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    public static readonly Guid ParkingDomainId = Guid.Parse("11111111-1111-1111-1111-111111111101");
    public static readonly Guid MarketDomainId = Guid.Parse("11111111-1111-1111-1111-111111111102");

    public static async Task EnsureSeededAsync(EnforcementDbContext db, CancellationToken ct = default)
    {
        if (await db.EnforcementDomains.AnyAsync(ct))
            return;

        var now = DateTimeOffset.UtcNow;

        var parking = new EnforcementDomain
        {
            Id = ParkingDomainId,
            OrganizationId = DemoOrganizationId,
            Code = "PARKING",
            Name = "Parking Enforcement",
            Description = "Municipal parking violations"
        };
        parking.SubjectTypes.Add(new SubjectTypeDefinition
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222201"),
            Code = "VEHICLE",
            Name = "Vehicle",
            ExternalSystemHint = "VehicleService"
        });

        var noParking = NewViolation(parking, "22222222-2222-2222-2222-222222222211", "NO_PARKING", "No Parking");
        var wrongParking = NewViolation(parking, "22222222-2222-2222-2222-222222222212", "WRONG_PARKING", "Wrong Parking");
        var expiredParking = NewViolation(parking, "22222222-2222-2222-2222-222222222213", "EXPIRED_PARKING", "Expired Parking");

        AddTieredPenalties(noParking, now, 500, 1000, 2000);
        AddTieredPenalties(wrongParking, now, 300, 600, 1200);
        AddTieredPenalties(expiredParking, now, 200, 400, 800);

        parking.ActionTypes.Add(NewAction(parking, "22222222-2222-2222-2222-222222222221", "WARNING", "Warning", ActionOutcomeKind.Informational));
        parking.ActionTypes.Add(NewAction(parking, "22222222-2222-2222-2222-222222222222", "FINE", "Fine", ActionOutcomeKind.Financial));
        parking.ActionTypes.Add(NewAction(parking, "22222222-2222-2222-2222-222222222223", "TOW", "Tow", ActionOutcomeKind.Restrictive));

        var market = new EnforcementDomain
        {
            Id = MarketDomainId,
            OrganizationId = DemoOrganizationId,
            Code = "MARKET",
            Name = "Market Enforcement",
            Description = "Street vendor and market stall enforcement"
        };
        market.SubjectTypes.Add(new SubjectTypeDefinition
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333301"),
            Code = "VENDOR",
            Name = "Vendor",
            ExternalSystemHint = "VendorRegistry"
        });
        market.SubjectTypes.Add(new SubjectTypeDefinition
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333302"),
            Code = "BUSINESS",
            Name = "Business",
            ExternalSystemHint = "BusinessRegistry"
        });

        var noLicense = NewViolation(market, "33333333-3333-3333-3333-333333333311", "NO_LICENSE", "No License");
        var unauthorizedStall = NewViolation(market, "33333333-3333-3333-3333-333333333312", "UNAUTHORIZED_STALL", "Unauthorized Stall");
        AddTieredPenalties(noLicense, now, 1000, 2500, 5000);
        AddTieredPenalties(unauthorizedStall, now, 750, 1500, 3000);

        market.ActionTypes.Add(NewAction(market, "33333333-3333-3333-3333-333333333321", "WARNING", "Warning", ActionOutcomeKind.Informational));
        market.ActionTypes.Add(NewAction(market, "33333333-3333-3333-3333-333333333322", "FINE", "Fine", ActionOutcomeKind.Financial));
        market.ActionTypes.Add(NewAction(market, "33333333-3333-3333-3333-333333333323", "SUSPENSION", "License Suspension", ActionOutcomeKind.Restrictive));

        db.EnforcementDomains.AddRange(parking, market);
        await db.SaveChangesAsync(ct);
    }

    private static ViolationType NewViolation(EnforcementDomain domain, string id, string code, string name)
    {
        var v = new ViolationType
        {
            Id = Guid.Parse(id),
            Code = code,
            Name = name,
            IsActive = true
        };
        domain.ViolationTypes.Add(v);
        return v;
    }

    private static ActionTypeDefinition NewAction(EnforcementDomain domain, string id, string code, string name, ActionOutcomeKind kind) =>
        new()
        {
            Id = Guid.Parse(id),
            EnforcementDomainId = domain.Id,
            Code = code,
            Name = name,
            OutcomeKind = kind,
            IsActive = true
        };

    private static void AddTieredPenalties(ViolationType violation, DateTimeOffset from, decimal first, decimal second, decimal third)
    {
        violation.PenaltyRules.Add(new PenaltyRule { Id = Guid.NewGuid(), OffenceNumber = 1, Amount = first, Currency = "INR", EffectiveFrom = from, IsActive = true });
        violation.PenaltyRules.Add(new PenaltyRule { Id = Guid.NewGuid(), OffenceNumber = 2, Amount = second, Currency = "INR", EffectiveFrom = from, IsActive = true });
        violation.PenaltyRules.Add(new PenaltyRule { Id = Guid.NewGuid(), OffenceNumber = 3, Amount = third, Currency = "INR", EffectiveFrom = from, IsActive = true });
    }
}
