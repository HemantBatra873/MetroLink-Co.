using IdentityPlatform.Service.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IdentityPlatform.Service.Services;

public class AuthorizationEngine : IAuthorizationEngine
{
    private readonly IdentityDbContext _db;
    private readonly ILogger<AuthorizationEngine> _logger;

    public AuthorizationEngine(IdentityDbContext db, ILogger<AuthorizationEngine> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<AuthorizationResult> EvaluateAsync(AuthorizationRequest request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        // 1. Authenticated User check in Identity DB
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.KeycloakUserId == request.KeycloakUserId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("Authorization DENIED: User {KeycloakUserId} not found in Identity database.", request.KeycloakUserId);
            return new AuthorizationResult(false, $"User '{request.KeycloakUserId}' is not registered in the system.");
        }

        // 2. Fetch User's Memberships for requested Organization
        var memberships = await _db.Memberships
            .AsNoTracking()
            .Include(m => m.Role)
                .ThenInclude(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .Include(m => m.ScopeArea)
            .Where(m => m.UserId == user.Id && m.OrganizationId == request.OrganizationId)
            .ToListAsync(cancellationToken);

        if (!memberships.Any())
        {
            _logger.LogWarning("Authorization DENIED: User {KeycloakUserId} has no membership in Organization {OrgId}.", request.KeycloakUserId, request.OrganizationId);
            return new AuthorizationResult(false, $"User does not belong to organization '{request.OrganizationId}'.");
        }

        // 3. Filter Memberships that possess the requested PermissionCode
        var matchingMemberships = memberships.Where(m => 
            m.Role.RolePermissions.Any(rp => string.Equals(rp.Permission.Code, request.PermissionCode, StringComparison.OrdinalIgnoreCase))
        ).ToList();

        if (!matchingMemberships.Any())
        {
            _logger.LogWarning("Authorization DENIED: User {KeycloakUserId} lacks permission '{Permission}' in Organization {OrgId}.", request.KeycloakUserId, request.PermissionCode, request.OrganizationId);
            return new AuthorizationResult(false, $"User lacks permission '{request.PermissionCode}' in organization '{request.OrganizationId}'.");
        }

        // 4. Resource Scope Area Check
        if (!request.ResourceAreaId.HasValue)
        {
            // Non-geographical resource: Granted by permission match in Organization
            return new AuthorizationResult(true, $"Permission '{request.PermissionCode}' granted within organization scope.");
        }

        var resourceAreaId = request.ResourceAreaId.Value;

        // Check if any matching membership has a scope covering the resource area
        foreach (var membership in matchingMemberships)
        {
            if (!membership.ScopeAreaId.HasValue)
            {
                // Membership has NULL ScopeAreaId => Granted Organization-wide scope
                return new AuthorizationResult(true, $"Permission '{request.PermissionCode}' granted with organization-wide scope.");
            }

            var userScopeAreaId = membership.ScopeAreaId.Value;

            if (await IsAreaInScopeAsync(resourceAreaId, userScopeAreaId, cancellationToken))
            {
                return new AuthorizationResult(true, $"Permission '{request.PermissionCode}' granted under scope area '{membership.ScopeArea?.Name ?? userScopeAreaId.ToString()}'.");
            }
        }

        _logger.LogWarning("Authorization DENIED: User {KeycloakUserId} with permission '{Permission}' has scope that does not include resource area {AreaId}.", request.KeycloakUserId, request.PermissionCode, resourceAreaId);
        return new AuthorizationResult(false, $"Resource area '{resourceAreaId}' is outside user's assigned scope.");
    }

    private async Task<bool> IsAreaInScopeAsync(Guid resourceAreaId, Guid userScopeAreaId, CancellationToken cancellationToken)
    {
        if (resourceAreaId == userScopeAreaId)
        {
            return true;
        }

        var currentAreaId = (Guid?)resourceAreaId;
        while (currentAreaId.HasValue)
        {
            if (currentAreaId.Value == userScopeAreaId)
            {
                return true;
            }

            var area = await _db.Areas
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == currentAreaId.Value, cancellationToken);

            currentAreaId = area?.ParentAreaId;
        }

        return false;
    }
}
