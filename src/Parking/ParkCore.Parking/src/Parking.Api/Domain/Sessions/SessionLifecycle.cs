namespace Parking.Api.Domain.Sessions;

public static class SessionLifecycle
{
    private static readonly Dictionary<SessionStatus, HashSet<SessionStatus>> Allowed = new()
    {
        [SessionStatus.Created] = [SessionStatus.Active, SessionStatus.Cancelled],
        [SessionStatus.Active] = [SessionStatus.PaymentPending, SessionStatus.Completed, SessionStatus.Cancelled],
        [SessionStatus.PaymentPending] = [SessionStatus.Completed, SessionStatus.Cancelled],
        [SessionStatus.Completed] = [],
        [SessionStatus.Cancelled] = []
    };

    public static bool CanTransition(SessionStatus from, SessionStatus to) =>
        Allowed.TryGetValue(from, out var next) && next.Contains(to);

    public static void EnsureTransition(SessionStatus from, SessionStatus to)
    {
        if (!CanTransition(from, to))
            throw new InvalidOperationException($"Cannot transition session from {from} to {to}.");
    }
}
