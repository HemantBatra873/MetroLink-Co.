using System.Security.Claims;

namespace Payment.Api.Authorization;

/// <summary>
/// Allows X-Test-User-Sub / X-Test-User-Roles in Development and Testing when JWT is not present.
/// </summary>
public sealed class TestUserMiddleware
{
    private readonly RequestDelegate _next;

    public TestUserMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, IHostEnvironment env)
    {
        if ((env.IsDevelopment() || env.IsEnvironment("Testing"))
            && context.User.Identity?.IsAuthenticated != true)
        {
            var sub = context.Request.Headers["X-Test-User-Sub"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(sub))
            {
                var claims = new List<Claim>
                {
                    new("sub", sub),
                    new(ClaimTypes.NameIdentifier, sub)
                };

                var rolesHeader = context.Request.Headers["X-Test-User-Roles"].FirstOrDefault();
                var roles = string.IsNullOrWhiteSpace(rolesHeader)
                    ? new[] { PaymentRoles.Admin }
                    : rolesHeader.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                foreach (var role in roles)
                    claims.Add(new Claim(ClaimTypes.Role, role));

                var identity = new ClaimsIdentity(claims, authenticationType: "TestUser");
                context.User = new ClaimsPrincipal(identity);
            }
        }

        await _next(context);
    }
}

public static class TestUserMiddlewareExtensions
{
    public static IApplicationBuilder UseTestUserFallback(this IApplicationBuilder app) =>
        app.UseMiddleware<TestUserMiddleware>();
}
