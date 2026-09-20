namespace IdentityPlatform.Service.Services;

public record AuthorizationRequest(
    string KeycloakUserId,
    Guid OrganizationId,
    string PermissionCode,
    Guid? ResourceAreaId = null
);

public record AuthorizationResult(
    bool IsAllowed,
    string Reason
);

public interface IAuthorizationEngine
{
    Task<AuthorizationResult> EvaluateAsync(AuthorizationRequest request, CancellationToken cancellationToken = default);
}
