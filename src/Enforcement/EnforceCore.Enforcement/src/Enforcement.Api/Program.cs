using Enforcement.Api.Authorization;
using Enforcement.Api.Infrastructure.Data;
using Enforcement.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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

var inMemoryName = builder.Configuration["Testing:DatabaseName"] ?? "EnforcementTestDb";

builder.Services.AddDbContext<EnforcementDbContext>(options =>
{
    if (useInMemory)
        options.UseInMemoryDatabase(inMemoryName);
    else
        options.UseNpgsql(connectionString);
});

builder.Services.AddScoped<IPenaltyCalculator, PenaltyCalculator>();
builder.Services.AddScoped<ICaseService, CaseService>();
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
    var db = scope.ServiceProvider.GetRequiredService<EnforcementDbContext>();
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

namespace Enforcement.Api
{
    public partial class Program { }
}
