using Parking.Api.Domain;
using Parking.Api.Domain.Facilities;
using Xunit;

namespace Parking.Tests;

public class FacilityLifecycleTests
{
    [Theory]
    [InlineData(FacilityStatus.Draft, FacilityStatus.Submitted, true)]
    [InlineData(FacilityStatus.Submitted, FacilityStatus.UnderReview, true)]
    [InlineData(FacilityStatus.UnderReview, FacilityStatus.Approved, true)]
    [InlineData(FacilityStatus.UnderReview, FacilityStatus.Rejected, true)]
    [InlineData(FacilityStatus.Approved, FacilityStatus.Active, true)]
    [InlineData(FacilityStatus.Active, FacilityStatus.Suspended, true)]
    [InlineData(FacilityStatus.Active, FacilityStatus.Closed, true)]
    [InlineData(FacilityStatus.Suspended, FacilityStatus.Active, true)]
    [InlineData(FacilityStatus.Rejected, FacilityStatus.Draft, true)]
    [InlineData(FacilityStatus.Draft, FacilityStatus.Active, false)]
    [InlineData(FacilityStatus.Closed, FacilityStatus.Active, false)]
    public void Transition_rules(FacilityStatus from, FacilityStatus to, bool expected) =>
        Assert.Equal(expected, FacilityLifecycle.CanTransition(from, to));

    [Fact]
    public void EnsureTransition_throws_on_illegal() =>
        Assert.Throws<InvalidOperationException>(() => FacilityLifecycle.EnsureTransition(FacilityStatus.Closed, FacilityStatus.Draft));
}
