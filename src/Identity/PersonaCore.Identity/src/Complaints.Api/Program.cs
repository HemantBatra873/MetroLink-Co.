using IdentityPlatform.Service.Infrastructure.Data;
using IdentityPlatform.Service.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var useInMemory = builder.Environment.IsEnvironment("Testing") || 
                  builder.Configuration.GetValue<bool>("UseInMemoryDatabase") ||
                  string.IsNullOrEmpty(connectionString);

builder.Services.AddDbContext<IdentityDbContext>(options =>
{
    if (useInMemory)
    {
        options.UseInMemoryDatabase("IdentityTestDb");
    }
    else
    {
        options.UseNpgsql(connectionString);
    }
});

builder.Services.AddScoped<IAuthorizationEngine, AuthorizationEngine>();

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
    var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
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
        app.Logger.LogWarning(ex, "Database schema check skipped or deferred.");
    }
}

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("QA") || app.Environment.IsEnvironment("Sandbox"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

namespace Complaints.Api
{
    public partial class Program { }
}
