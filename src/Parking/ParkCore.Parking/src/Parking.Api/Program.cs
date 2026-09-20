using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Parking.Api.Authorization;
using Parking.Api.Infrastructure.Data;
using Parking.Api.Integrations;
using Parking.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.Filters.Add<RequirePermissionFilter>();
}).AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var useInMemory = builder.Environment.IsEnvironment("Testing")
    || builder.Configuration.GetValue<bool>("UseInMemoryDatabase")
    || string.IsNullOrEmpty(connectionString);

var inMemoryName = builder.Configuration["Testing:DatabaseName"] ?? "ParkingTestDb";

builder.Services.AddDbContext<ParkingDbContext>(options =>
{
    if (useInMemory)
        options.UseInMemoryDatabase(inMemoryName);
    else
        options.UseNpgsql(connectionString);
});

builder.Services.AddScoped<IFacilityService, FacilityService>();
builder.Services.AddScoped<IOccupancyService, OccupancyService>();
builder.Services.AddScoped<IPricingService, PricingService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<RequirePermissionFilter>();

var identityBaseUrl = builder.Configuration["Identity:BaseUrl"] ?? "http://localhost:5265/";
var allowAllAuth = builder.Configuration.GetValue<bool>("Identity:AllowAll")
    || builder.Environment.IsEnvironment("Testing")
    || builder.Environment.IsDevelopment();

if (allowAllAuth && builder.Configuration.GetValue("Identity:UseHttpClient", false) == false)
{
    builder.Services.AddSingleton<IIdentityAuthorizationClient, DevAllowAllAuthorizationClient>();
}
else
{
    builder.Services.AddHttpClient<IIdentityAuthorizationClient, HttpIdentityAuthorizationClient>(client =>
    {
        client.BaseAddress = new Uri(identityBaseUrl);
    });
}

var enforcementEnabled = builder.Configuration.GetValue<bool>("Enforcement:Enabled");
if (enforcementEnabled)
{
    var enforcementBaseUrl = builder.Configuration["Enforcement:BaseUrl"] ?? "http://localhost:5208/";
    builder.Services.AddHttpClient<IEnforcementClient, HttpEnforcementClient>(client =>
    {
        client.BaseAddress = new Uri(enforcementBaseUrl);
    });
}
else
{
    builder.Services.AddSingleton<IEnforcementClient, DevStubEnforcementClient>();
}

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
            ValidateLifetime = true
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ParkingDbContext>();
    try
    {
        if (db.Database.IsInMemory())
        {
            await db.Database.EnsureCreatedAsync();
        }
        else if (app.Environment.IsDevelopment())
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
app.UseAuthorization();
app.MapControllers();
app.Run();

namespace Parking.Api
{
    public partial class Program { }
}
