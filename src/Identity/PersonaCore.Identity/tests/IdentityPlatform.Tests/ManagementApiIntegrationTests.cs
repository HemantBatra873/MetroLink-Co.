using System.Net;
using System.Net.Http.Json;
using IdentityPlatform.Service.Domain.Entities;
using IdentityPlatform.Service.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace IdentityPlatform.Tests;

public class ManagementApiIntegrationTests : IClassFixture<WebApplicationFactory<IdentityPlatform.Service.Program>>
{
    private readonly WebApplicationFactory<IdentityPlatform.Service.Program> _factory;

    public ManagementApiIntegrationTests()
    {
        _factory = new WebApplicationFactory<IdentityPlatform.Service.Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
            });
    }

    [Fact]
    public async Task CreateOrganization_And_Area_ReturnsSuccess()
    {
        var client = _factory.CreateClient();

        // 1. Create Organization
        var orgRequest = new CreateOrganizationRequest("Delhi Municipal Corp", "DMC");
        var orgResponse = await client.PostAsJsonAsync("/api/v1/organizations", orgRequest);
        Assert.Equal(HttpStatusCode.Created, orgResponse.StatusCode);

        var createdOrg = await orgResponse.Content.ReadFromJsonAsync<Organization>();
        Assert.NotNull(createdOrg);
        Assert.Equal("DMC", createdOrg.Code);

        // 2. Create Area under DMC
        var areaRequest = new CreateAreaRequest(createdOrg.Id, null, "North Delhi", "NORTH_DELHI");
        var areaResponse = await client.PostAsJsonAsync("/api/v1/areas", areaRequest);
        Assert.Equal(HttpStatusCode.OK, areaResponse.StatusCode);

        var createdArea = await areaResponse.Content.ReadFromJsonAsync<Area>();
        Assert.NotNull(createdArea);
        Assert.Equal("NORTH_DELHI", createdArea.Code);
    }

    [Fact]
    public async Task SyncUser_CreatesOrUpdatesUser()
    {
        var client = _factory.CreateClient();

        var syncRequest = new SyncUserRequest("keycloak-user-sub-999", "newuser@gov.in", "New User");
        var response = await client.PostAsJsonAsync("/api/v1/users/sync", syncRequest);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var user = await response.Content.ReadFromJsonAsync<User>();
        Assert.NotNull(user);
        Assert.Equal("keycloak-user-sub-999", user.KeycloakUserId);
        Assert.Equal("newuser@gov.in", user.Email);
    }

    [Fact]
    public async Task CreateRole_AssignPermission_And_CreateMembership()
    {
        var client = _factory.CreateClient();

        // 1. Create Permission
        var permReq = new CreatePermissionRequest("Asset.Maintain", "Maintain physical assets");
        var permResp = await client.PostAsJsonAsync("/api/v1/permissions", permReq);
        var perm = await permResp.Content.ReadFromJsonAsync<Permission>();
        Assert.NotNull(perm);

        // 2. Create Role with permission
        var roleReq = new CreateRoleRequest(null, "Technician", "TECHNICIAN", new List<Guid> { perm.Id });
        var roleResp = await client.PostAsJsonAsync("/api/v1/roles", roleReq);
        var role = await roleResp.Content.ReadFromJsonAsync<Role>();
        Assert.NotNull(role);

        // 3. Sync User
        var userReq = new SyncUserRequest("keycloak-tech-1", "tech@muni.gov", "Tech User");
        var userResp = await client.PostAsJsonAsync("/api/v1/users/sync", userReq);
        var user = await userResp.Content.ReadFromJsonAsync<User>();
        Assert.NotNull(user);

        // 4. Create Organization & Membership
        var orgReq = new CreateOrganizationRequest("Tech Org", "TECH_ORG");
        var orgCreatedResp = await client.PostAsJsonAsync("/api/v1/organizations", orgReq);
        var org = await orgCreatedResp.Content.ReadFromJsonAsync<Organization>();
        Assert.NotNull(org);

        var membReq = new CreateMembershipRequest(user.Id, org.Id, null, role.Id, null);
        var membResp = await client.PostAsJsonAsync("/api/v1/memberships", membReq);

        Assert.Equal(HttpStatusCode.OK, membResp.StatusCode);
    }
}
