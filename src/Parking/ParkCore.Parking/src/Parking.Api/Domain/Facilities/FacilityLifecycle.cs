namespace Parking.Api.Domain.Facilities;

public static class FacilityLifecycle
{
    private static readonly Dictionary<FacilityStatus, HashSet<FacilityStatus>> Allowed = new()
    {
        [FacilityStatus.Draft] = [FacilityStatus.Submitted],
        [FacilityStatus.Submitted] = [FacilityStatus.UnderReview],
        [FacilityStatus.UnderReview] = [FacilityStatus.Approved, FacilityStatus.Rejected],
        [FacilityStatus.Approved] = [FacilityStatus.Active],
        [FacilityStatus.Active] = [FacilityStatus.Suspended, FacilityStatus.Closed],
        [FacilityStatus.Suspended] = [FacilityStatus.Active, FacilityStatus.Closed],
        [FacilityStatus.Rejected] = [FacilityStatus.Draft],
        [FacilityStatus.Closed] = []
    };

    public static bool CanTransition(FacilityStatus from, FacilityStatus to) =>
        Allowed.TryGetValue(from, out var next) && next.Contains(to);

    public static void EnsureTransition(FacilityStatus from, FacilityStatus to)
    {
        if (!CanTransition(from, to))
            throw new InvalidOperationException($"Cannot transition facility from {from} to {to}.");
    }
}
