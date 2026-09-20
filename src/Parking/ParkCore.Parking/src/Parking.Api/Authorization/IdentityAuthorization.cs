namespace Parking.Api.Authorization;

public record AuthorizationRequest(
    string KeycloakUserId,
    Guid OrganizationId,
    string PermissionCode,
    Guid? ResourceAreaId = null);

public record AuthorizationResult(bool IsAllowed, string Reason);

public interface IIdentityAuthorizationClient
{
    Task<AuthorizationResult> EvaluateAsync(AuthorizationRequest request, CancellationToken cancellationToken = default);
}

public class HttpIdentityAuthorizationClient : IIdentityAuthorizationClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HttpIdentityAuthorizationClient> _logger;

    public HttpIdentityAuthorizationClient(HttpClient httpClient, ILogger<HttpIdentityAuthorizationClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<AuthorizationResult> EvaluateAsync(AuthorizationRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            using var response = await _httpClient.PostAsJsonAsync("api/v1/authorization/evaluate", request, cancellationToken);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<AuthorizationResult>(cancellationToken: cancellationToken);
            return result ?? new AuthorizationResult(false, "Empty authorization response.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Identity authorization evaluate failed for permission {Permission}", request.PermissionCode);
            return new AuthorizationResult(false, "Authorization service unavailable.");
        }
    }
}

public class DevAllowAllAuthorizationClient : IIdentityAuthorizationClient
{
    public Task<AuthorizationResult> EvaluateAsync(AuthorizationRequest request, CancellationToken cancellationToken = default)
        => Task.FromResult(new AuthorizationResult(true, "Dev allow-all authorization client."));
}

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public sealed class RequirePermissionAttribute : Attribute
{
    public RequirePermissionAttribute(string permissionCode) => PermissionCode = permissionCode;
    public string PermissionCode { get; }
}

public static class ParkingPermissions
{
    public const string FacilityView = "Parking.Facility.View";
    public const string FacilityCreate = "Parking.Facility.Create";
    public const string FacilityUpdate = "Parking.Facility.Update";
    public const string FacilitySubmit = "Parking.Facility.Submit";
    public const string FacilityVerify = "Parking.Facility.Verify";
    public const string FacilityActivate = "Parking.Facility.Activate";
    public const string FacilitySuspend = "Parking.Facility.Suspend";

    public const string ZoneView = "Parking.Zone.View";
    public const string ZoneManage = "Parking.Zone.Manage";
    public const string SpaceView = "Parking.Space.View";
    public const string SpaceManage = "Parking.Space.Manage";

    public const string SessionView = "Parking.Session.View";
    public const string SessionCreate = "Parking.Session.Create";
    public const string SessionClose = "Parking.Session.Close";

    public const string TicketView = "Parking.Ticket.View";
    public const string TicketIssue = "Parking.Ticket.Issue";
    public const string TicketCancel = "Parking.Ticket.Cancel";

    public const string OccupancyView = "Parking.Occupancy.View";
    public const string OccupancyUpdate = "Parking.Occupancy.Update";

    public const string PricingView = "Parking.Pricing.View";
    public const string PricingManage = "Parking.Pricing.Manage";

    public const string SubscriptionView = "Parking.Subscription.View";
    public const string SubscriptionManage = "Parking.Subscription.Manage";

    public const string ReportView = "Parking.Report.View";
    public const string OperatorManage = "Parking.Operator.Manage";

    public static IReadOnlyList<string> All { get; } =
    [
        FacilityView, FacilityCreate, FacilityUpdate, FacilitySubmit, FacilityVerify, FacilityActivate, FacilitySuspend,
        ZoneView, ZoneManage, SpaceView, SpaceManage,
        SessionView, SessionCreate, SessionClose,
        TicketView, TicketIssue, TicketCancel,
        OccupancyView, OccupancyUpdate,
        PricingView, PricingManage,
        SubscriptionView, SubscriptionManage,
        ReportView, OperatorManage
    ];
}
