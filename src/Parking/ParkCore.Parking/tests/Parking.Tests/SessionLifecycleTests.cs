using Parking.Api.Domain;
using Parking.Api.Domain.Sessions;
using Xunit;

namespace Parking.Tests;

public class SessionLifecycleTests
{
    [Theory]
    [InlineData(SessionStatus.Created, SessionStatus.Active, true)]
    [InlineData(SessionStatus.Active, SessionStatus.PaymentPending, true)]
    [InlineData(SessionStatus.Active, SessionStatus.Completed, true)]
    [InlineData(SessionStatus.PaymentPending, SessionStatus.Completed, true)]
    [InlineData(SessionStatus.Active, SessionStatus.Cancelled, true)]
    [InlineData(SessionStatus.Completed, SessionStatus.Cancelled, false)]
    public void Transition_rules(SessionStatus from, SessionStatus to, bool expected) =>
        Assert.Equal(expected, SessionLifecycle.CanTransition(from, to));
}
