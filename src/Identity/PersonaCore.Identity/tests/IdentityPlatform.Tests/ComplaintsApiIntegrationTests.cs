using System.Net;
using System.Net.Http.Json;
using IdentityPlatform.Service.Domain.Entities;
using IdentityPlatform.Service.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace IdentityPlatform.Tests;

public class ComplaintsApiIntegrationTests : IClassFixture<WebApplicationFactory<Complaints.Api.Program>>
{
    private readonly WebApplicationFactory<Complaints.Api.Program> _factory;

    private static readonly string RajSub = "3fa85f64-5717-4562-b3fc-2c963f66afa1";
    private static readonly string AmitSub = "3fa85f64-5717-4562-b3fc-2c963f66afa2";

    private static readonly Guid MuniAId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    private static readonly Guid Ward1Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567803");
    private static readonly Guid Ward3Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567806");

    public ComplaintsApiIntegrationTests(WebApplicationFactory<Complaints.Api.Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
        });

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        db.Database.EnsureCreated();

        if (!db.Organizations.Any())
        {
            var muniA = new Organization { Id = MuniAId, Name = "Municipality A", Code = "MUNI_A" };
            db.Organizations.Add(muniA);

            var haryanaArea = new Area { Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567801"), OrganizationId = muniA.Id, Name = "Haryana", Code = "HARYANA" };
            var gurgaonArea = new Area { Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567802"), OrganizationId = muniA.Id, ParentAreaId = haryanaArea.Id, Name = "Gurgaon", Code = "GURGAON" };
            var ward1Area = new Area { Id = Ward1Id, OrganizationId = muniA.Id, ParentAreaId = gurgaonArea.Id, Name = "Ward 1", Code = "WARD_1" };
            var faridabadArea = new Area { Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567805"), OrganizationId = muniA.Id, ParentAreaId = haryanaArea.Id, Name = "Faridabad", Code = "FARIDABAD" };
            var ward3Area = new Area { Id = Ward3Id, OrganizationId = muniA.Id, ParentAreaId = faridabadArea.Id, Name = "Ward 3", Code = "WARD_3" };
            db.Areas.AddRange(haryanaArea, gurgaonArea, ward1Area, faridabadArea, ward3Area);

            var pView = new Permission { Id = Guid.NewGuid(), Code = "Complaint.View" };
            var pUpdate = new Permission { Id = Guid.NewGuid(), Code = "Complaint.Update" };
            var pClose = new Permission { Id = Guid.NewGuid(), Code = "Complaint.Close" };
            db.Permissions.AddRange(pView, pUpdate, pClose);

            var inspectorRole = new Role { Id = Guid.NewGuid(), OrganizationId = muniA.Id, Name = "Inspector", Code = "INSPECTOR" };
            var supervisorRole = new Role { Id = Guid.NewGuid(), OrganizationId = muniA.Id, Name = "Supervisor", Code = "SUPERVISOR" };
            db.Roles.AddRange(inspectorRole, supervisorRole);

            db.RolePermissions.AddRange(
                new RolePermission { RoleId = inspectorRole.Id, PermissionId = pView.Id },
                new RolePermission { RoleId = inspectorRole.Id, PermissionId = pUpdate.Id },

                new RolePermission { RoleId = supervisorRole.Id, PermissionId = pView.Id },
                new RolePermission { RoleId = supervisorRole.Id, PermissionId = pUpdate.Id },
                new RolePermission { RoleId = supervisorRole.Id, PermissionId = pClose.Id }
            );

            var userRaj = new User { Id = Guid.NewGuid(), KeycloakUserId = RajSub, Email = "raj@test.com", DisplayName = "Raj" };
            var userAmit = new User { Id = Guid.NewGuid(), KeycloakUserId = AmitSub, Email = "amit@test.com", DisplayName = "Amit" };
            db.Users.AddRange(userRaj, userAmit);

            db.Memberships.AddRange(
                new Membership { Id = Guid.NewGuid(), UserId = userRaj.Id, OrganizationId = muniA.Id, RoleId = inspectorRole.Id, ScopeAreaId = gurgaonArea.Id },
                new Membership { Id = Guid.NewGuid(), UserId = userAmit.Id, OrganizationId = muniA.Id, RoleId = supervisorRole.Id, ScopeAreaId = haryanaArea.Id }
            );

            db.SaveChanges();
        }
    }

    [Fact]
    public async Task Raj_UpdateComplaint101_Returns200OK()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User-Sub", RajSub);

        var response = await client.PostAsJsonAsync("/api/v1/complaints/101/update", "Water leak repaired");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Raj_UpdateComplaint201_Returns403Forbidden()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User-Sub", RajSub);

        var response = await client.PostAsJsonAsync("/api/v1/complaints/201/update", "Trying to update Faridabad complaint");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Amit_UpdateComplaint101_Returns200OK()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User-Sub", AmitSub);

        var response = await client.PostAsJsonAsync("/api/v1/complaints/101/update", "Supervisor update");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Amit_CloseComplaint101_Returns200OK()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User-Sub", AmitSub);

        var response = await client.PostAsJsonAsync("/api/v1/complaints/101/close", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Raj_CloseComplaint101_Returns403Forbidden()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User-Sub", RajSub);

        var response = await client.PostAsJsonAsync("/api/v1/complaints/101/close", new { });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
