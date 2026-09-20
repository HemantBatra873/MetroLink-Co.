using Enforcement.Api.Domain;
using Xunit;

namespace Enforcement.Tests;

public class CaseLifecycleTests
{
    [Theory]
    [InlineData(CaseStatus.Draft, CaseStatus.Issued, true)]
    [InlineData(CaseStatus.Draft, CaseStatus.Cancelled, true)]
    [InlineData(CaseStatus.Issued, CaseStatus.Payable, true)]
    [InlineData(CaseStatus.Issued, CaseStatus.Disputed, true)]
    [InlineData(CaseStatus.Payable, CaseStatus.Paid, true)]
    [InlineData(CaseStatus.Disputed, CaseStatus.UnderReview, true)]
    [InlineData(CaseStatus.UnderReview, CaseStatus.Upheld, true)]
    [InlineData(CaseStatus.Upheld, CaseStatus.Payable, true)]
    [InlineData(CaseStatus.Paid, CaseStatus.Cancelled, false)]
    [InlineData(CaseStatus.Draft, CaseStatus.Paid, false)]
    [InlineData(CaseStatus.Cancelled, CaseStatus.Issued, false)]
    public void Transition_rules(CaseStatus from, CaseStatus to, bool expected)
    {
        Assert.Equal(expected, CaseLifecycle.CanTransition(from, to));
    }

    [Fact]
    public void EnsureTransition_throws_on_illegal()
    {
        Assert.Throws<InvalidOperationException>(() => CaseLifecycle.EnsureTransition(CaseStatus.Paid, CaseStatus.Draft));
    }
}
