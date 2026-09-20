namespace Enforcement.Api.Authorization;

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

/// <summary>
/// Calls PersonaCore Identity POST /api/v1/authorization/evaluate.
/// Preserves service DB boundaries (no shared IdentityDbContext).
/// </summary>
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

/// <summary>
/// Development / test double. Allows all when Identity:AllowAll=true or when actor is "test-allow-all".
/// </summary>
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

public static class EnforcementPermissions
{
    public const string CaseView = "Enforcement.Case.View";
    public const string CaseCreate = "Enforcement.Case.Create";
    public const string CaseUpdate = "Enforcement.Case.Update";
    public const string CaseAssign = "Enforcement.Case.Assign";
    public const string CaseIssue = "Enforcement.Case.Issue";
    public const string CaseCancel = "Enforcement.Case.Cancel";
    public const string CaseDispute = "Enforcement.Case.Dispute";
    public const string CaseReview = "Enforcement.Case.Review";
    public const string RuleView = "Enforcement.Rule.View";
    public const string RuleManage = "Enforcement.Rule.Manage";
    public const string PaymentView = "Enforcement.Payment.View";
    public const string PaymentInitiate = "Enforcement.Payment.Initiate";

    public static IReadOnlyList<string> All { get; } =
    [
        CaseView, CaseCreate, CaseUpdate, CaseAssign, CaseIssue, CaseCancel, CaseDispute, CaseReview,
        RuleView, RuleManage, PaymentView, PaymentInitiate
    ];
}
