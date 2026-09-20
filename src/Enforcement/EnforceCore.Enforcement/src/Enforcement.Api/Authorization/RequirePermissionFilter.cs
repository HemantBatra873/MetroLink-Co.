using System.Security.Claims;
using System.Text.Json;
using Enforcement.Api.Authorization;
using Enforcement.Api.Domain;
using Enforcement.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace Enforcement.Api.Authorization;

/// <summary>
/// Resolves [RequirePermission] against Identity, using OrganizationId / AreaId from route, body, or loaded case.
/// Controllers may also call IIdentityAuthorizationClient imperatively (Complaints.Api style).
/// </summary>
public sealed class RequirePermissionFilter : IAsyncActionFilter
{
    private readonly IIdentityAuthorizationClient _authClient;

    public RequirePermissionFilter(IIdentityAuthorizationClient authClient)
    {
        _authClient = authClient;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var attr = context.ActionDescriptor.EndpointMetadata.OfType<RequirePermissionAttribute>().FirstOrDefault();
        if (attr is null)
        {
            await next();
            return;
        }

        var userId = GetUserId(context.HttpContext);
        if (string.IsNullOrWhiteSpace(userId))
        {
            context.Result = new UnauthorizedObjectResult("User identity claim ('sub') missing from token.");
            return;
        }

        var (organizationId, areaId) = await ResolveScopeAsync(context);
        if (organizationId is null)
        {
            context.Result = new BadRequestObjectResult("OrganizationId is required for authorization.");
            return;
        }

        var result = await _authClient.EvaluateAsync(
            new AuthorizationRequest(userId, organizationId.Value, attr.PermissionCode, areaId),
            context.HttpContext.RequestAborted);

        if (!result.IsAllowed)
        {
            context.Result = new ObjectResult(new { Message = "Access Denied", Reason = result.Reason })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return;
        }

        await next();
    }

    private static string? GetUserId(HttpContext httpContext) =>
        httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? httpContext.User.FindFirstValue("sub")
        ?? httpContext.Request.Headers["X-Test-User-Sub"].FirstOrDefault();

    private static async Task<(Guid? OrganizationId, Guid? AreaId)> ResolveScopeAsync(ActionExecutingContext context)
    {
        Guid? organizationId = null;
        Guid? areaId = null;

        if (context.HttpContext.Request.Query.TryGetValue("organizationId", out var orgQ) && Guid.TryParse(orgQ, out var orgFromQuery))
            organizationId = orgFromQuery;
        if (context.HttpContext.Request.Query.TryGetValue("areaId", out var areaQ) && Guid.TryParse(areaQ, out var areaFromQuery))
            areaId = areaFromQuery;

        foreach (var arg in context.ActionArguments.Values)
        {
            if (arg is null) continue;
            var type = arg.GetType();
            var orgProp = type.GetProperty("OrganizationId");
            if (orgProp?.GetValue(arg) is Guid org && org != Guid.Empty)
                organizationId = org;
            var areaProp = type.GetProperty("AreaId");
            if (areaProp?.GetValue(arg) is Guid area && area != Guid.Empty)
                areaId = area;
        }

        if (context.ActionArguments.TryGetValue("id", out var idObj) && idObj is Guid caseId)
        {
            var db = context.HttpContext.RequestServices.GetService<EnforcementDbContext>();
            if (db is not null)
            {
                var c = await db.EnforcementCases.AsNoTracking()
                    .Where(x => x.Id == caseId)
                    .Select(x => new { x.OrganizationId, x.AreaId })
                    .FirstOrDefaultAsync(context.HttpContext.RequestAborted);
                if (c is not null)
                {
                    organizationId ??= c.OrganizationId;
                    areaId ??= c.AreaId;
                }
            }
        }

        if (organizationId is null)
        {
            Guid? domainId = null;
            foreach (var arg in context.ActionArguments.Values)
            {
                if (arg is null) continue;
                var prop = arg.GetType().GetProperty("EnforcementDomainId");
                if (prop?.GetValue(arg) is Guid d && d != Guid.Empty)
                    domainId = d;
            }

            if (domainId is not null)
            {
                var db = context.HttpContext.RequestServices.GetService<EnforcementDbContext>();
                if (db is not null)
                {
                    organizationId = await db.EnforcementDomains.AsNoTracking()
                        .Where(d => d.Id == domainId)
                        .Select(d => (Guid?)d.OrganizationId)
                        .FirstOrDefaultAsync(context.HttpContext.RequestAborted);
                }
            }
        }

        return (organizationId, areaId);
    }
}

public static class CurrentUser
{
    public static string? GetKeycloakUserId(HttpContext httpContext) =>
        httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? httpContext.User.FindFirstValue("sub")
        ?? httpContext.Request.Headers["X-Test-User-Sub"].FirstOrDefault();
}

public static class AuditWriter
{
    public static CaseAuditEvent Create(Guid caseId, string eventType, string actorId, string? reason = null, object? details = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            EnforcementCaseId = caseId,
            EventType = eventType,
            ActorKeycloakUserId = actorId,
            OccurredAt = DateTimeOffset.UtcNow,
            Reason = reason,
            DetailsJson = details is null ? null : JsonSerializer.Serialize(details)
        };
}
