namespace Enforcement.Api.Domain;

/// <summary>
/// Explicit, code-owned lifecycle invariants. Configurable policies live in data;
/// illegal transitions belong here.
/// </summary>
public static class CaseLifecycle
{
    private static readonly Dictionary<CaseStatus, HashSet<CaseStatus>> Allowed = new()
    {
        [CaseStatus.Draft] = [CaseStatus.Issued, CaseStatus.Cancelled],
        [CaseStatus.Issued] = [CaseStatus.Payable, CaseStatus.Disputed, CaseStatus.Cancelled],
        [CaseStatus.Payable] = [CaseStatus.Paid, CaseStatus.Disputed, CaseStatus.Cancelled],
        [CaseStatus.Disputed] = [CaseStatus.UnderReview, CaseStatus.Cancelled],
        [CaseStatus.UnderReview] = [CaseStatus.Upheld, CaseStatus.Cancelled],
        [CaseStatus.Upheld] = [CaseStatus.Payable],
        [CaseStatus.Paid] = [],
        [CaseStatus.Cancelled] = []
    };

    public static bool CanTransition(CaseStatus from, CaseStatus to) =>
        Allowed.TryGetValue(from, out var next) && next.Contains(to);

    public static void EnsureTransition(CaseStatus from, CaseStatus to)
    {
        if (!CanTransition(from, to))
        {
            throw new InvalidOperationException($"Cannot transition case from {from} to {to}.");
        }
    }
}
