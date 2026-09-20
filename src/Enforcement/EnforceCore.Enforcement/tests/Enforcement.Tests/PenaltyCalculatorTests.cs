using Enforcement.Api.Domain;
using Enforcement.Api.Infrastructure.Data;
using Enforcement.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Enforcement.Tests;

public class PenaltyCalculatorTests
{
    private static EnforcementDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<EnforcementDbContext>()
            .UseInMemoryDatabase($"EnforcementTestDb-{Guid.NewGuid()}")
            .Options;
        return new EnforcementDbContext(options);
    }

    [Fact]
    public async Task Uses_configured_tier_not_hardcoded_amount()
    {
        await using var db = CreateDb();
        var violationId = Guid.NewGuid();
        db.ViolationTypes.Add(new ViolationType { Id = violationId, EnforcementDomainId = Guid.NewGuid(), Code = "X", Name = "X" });
        db.PenaltyRules.Add(new PenaltyRule
        {
            Id = Guid.NewGuid(),
            ViolationTypeId = violationId,
            OffenceNumber = 1,
            Amount = 777,
            Currency = "INR",
            EffectiveFrom = DateTimeOffset.UtcNow.AddDays(-1),
            IsActive = true
        });
        await db.SaveChangesAsync();

        var calc = new PenaltyCalculator(db);
        var (amount, currency, offence) = await calc.ResolveAsync(violationId, null, 1, null);
        Assert.Equal(777m, amount);
        Assert.Equal("INR", currency);
        Assert.Equal(1, offence);
    }
}
