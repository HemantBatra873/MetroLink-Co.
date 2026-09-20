using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Payment.Api.Authorization;
using Payment.Api.Infrastructure.Data;
using Payment.Api.Providers;
using Payment.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var useInMemory = builder.Environment.IsEnvironment("Testing")
    || builder.Configuration.GetValue<bool>("UseInMemoryDatabase")
    || string.IsNullOrEmpty(connectionString);

builder.Services.AddDbContext<PaymentDbContext>(options =>
{
    if (useInMemory)
        options.UseInMemoryDatabase("PaymentTestDb");
    else
        options.UseNpgsql(connectionString);
});

builder.Services.AddSingleton<IPaymentProvider, MockPaymentProvider>();
builder.Services.AddSingleton<IPaymentProvider, RazorpayPaymentProvider>();
builder.Services.AddSingleton<IPaymentProvider, StripePaymentProvider>();
builder.Services.AddSingleton<IPaymentProviderResolver, PaymentProviderResolver>();
builder.Services.AddScoped<IPaymentOrchestrationService, PaymentOrchestrationService>();
builder.Services.AddHttpClient("PaymentSettlement");
builder.Services.AddSingleton<IPaymentSettlementNotifier, HttpPaymentSettlementNotifier>();

var keycloakAuthority = builder.Configuration["Jwt:Authority"] ?? "http://localhost:8080/realms/platform-identity-realm";
var keycloakAudience = builder.Configuration["Jwt:Audience"] ?? "business-api-client";
var requireHttpsMetadata = builder.Configuration.GetValue<bool>("Jwt:RequireHttpsMetadata");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = keycloakAuthority;
        options.Audience = keycloakAudience;
        options.RequireHttpsMetadata = requireHttpsMetadata;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = keycloakAuthority,
            ValidateAudience = false,
            ValidateLifetime = true,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(PaymentPolicies.ViewPayments, p =>
        p.RequireRole(PaymentRoles.Admin, PaymentRoles.Operator, PaymentRoles.Viewer));
    options.AddPolicy(PaymentPolicies.InitiatePayments, p =>
        p.RequireRole(PaymentRoles.Admin, PaymentRoles.Operator));
    options.AddPolicy(PaymentPolicies.AdministerPayments, p =>
        p.RequireRole(PaymentRoles.Admin));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
    try
    {
        if (db.Database.IsInMemory())
        {
            await db.Database.EnsureCreatedAsync();
        }
        else if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Testing"))
        {
            await db.Database.MigrateAsync();
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Database schema deferred.");
    }
}

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("QA") || app.Environment.IsEnvironment("Sandbox"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseTestUserFallback();
app.UseAuthorization();
app.MapControllers();
app.Run();

namespace Payment.Api
{
    public partial class Program { }
}
