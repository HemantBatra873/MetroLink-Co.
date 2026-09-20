using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Parking.Api.Domain.Audit;
using Parking.Api.Infrastructure.Data;

namespace Parking.Api.Authorization;

public sealed class RequirePermissionFilter : IAsyncActionFilter
{
    private readonly IIdentityAuthorizationClient _authClient;

    public RequirePermissionFilter(IIdentityAuthorizationClient authClient) => _authClient = authClient;

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

        var db = context.HttpContext.RequestServices.GetService<ParkingDbContext>();
        if (db is null)
            return (organizationId, areaId);

        if (context.ActionArguments.TryGetValue("facilityId", out var facilityIdObj) && facilityIdObj is Guid facilityId)
        {
            var f = await db.ParkingFacilities.AsNoTracking()
                .Where(x => x.Id == facilityId)
                .Select(x => new { x.OrganizationId, x.AreaId })
                .FirstOrDefaultAsync(context.HttpContext.RequestAborted);
            if (f is not null)
            {
                organizationId ??= f.OrganizationId;
                areaId ??= f.AreaId;
            }
        }

        if (context.ActionArguments.TryGetValue("id", out var idObj) && idObj is Guid entityId)
        {
            var facility = await db.ParkingFacilities.AsNoTracking()
                .Where(x => x.Id == entityId)
                .Select(x => new { x.OrganizationId, x.AreaId })
                .FirstOrDefaultAsync(context.HttpContext.RequestAborted);
            if (facility is not null)
            {
                organizationId ??= facility.OrganizationId;
                areaId ??= facility.AreaId;
            }
            else
            {
                var session = await db.ParkingSessions.AsNoTracking()
                    .Where(x => x.Id == entityId)
                    .Select(x => new { x.OrganizationId, x.AreaId })
                    .FirstOrDefaultAsync(context.HttpContext.RequestAborted);
                if (session is not null)
                {
                    organizationId ??= session.OrganizationId;
                    areaId ??= session.AreaId;
                }
                else
                {
                    var obligation = await db.FinancialObligations.AsNoTracking()
                        .Where(x => x.Id == entityId)
                        .Select(x => new { x.OrganizationId, AreaId = (Guid?)null })
                        .FirstOrDefaultAsync(context.HttpContext.RequestAborted);
                    if (obligation is not null)
                        organizationId ??= obligation.OrganizationId;
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
    public static ParkingAuditEvent Create(
        Guid organizationId,
        string eventType,
        string actorId,
        Guid? facilityId = null,
        Guid? sessionId = null,
        string? reason = null,
        object? details = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            FacilityId = facilityId,
            SessionId = sessionId,
            EventType = eventType,
            ActorKeycloakUserId = actorId,
            OccurredAt = DateTimeOffset.UtcNow,
            Reason = reason,
            DetailsJson = details is null ? null : JsonSerializer.Serialize(details)
        };
}
