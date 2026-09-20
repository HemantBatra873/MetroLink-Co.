using IdentityPlatform.Service.Domain.Entities;
using IdentityPlatform.Service.Infrastructure.Data;
using IdentityPlatform.Service.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace IdentityPlatform.Tests;

public class AuthorizationEngineTests
{
    private static readonly string RajSub = "3fa85f64-5717-4562-b3fc-2c963f66afa1";
    private static readonly string AmitSub = "3fa85f64-5717-4562-b3fc-2c963f66afa2";

    private static readonly Guid MuniAId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    private static readonly Guid OtherOrgId = Guid.Parse("99999999-9999-9999-9999-999999999999");

    private static readonly Guid Ward1Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567803"); // Gurgaon / Ward 1
    private static readonly Guid Ward3Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567806"); // Faridabad / Ward 3

    private static async Task<IdentityDbContext> CreateTestDbContextAsync(string dbName)
    {
        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var db = new IdentityDbContext(options);

        // 1. Organization
        var muniA = new Organization
        {
            Id = MuniAId,
            Name = "Municipality A",
            Code = "MUNI_A"
        };
        db.Organizations.Add(muniA);

        // 2. Hierarchical Areas
        var haryanaArea = new Area
        {
            Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567801"),
            OrganizationId = muniA.Id,
            Name = "Haryana",
            Code = "HARYANA"
        };
        var gurgaonArea = new Area
        {
            Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567802"),
            OrganizationId = muniA.Id,
            ParentAreaId = haryanaArea.Id,
            Name = "Gurgaon",
            Code = "GURGAON"
        };
        var ward1Area = new Area
        {
            Id = Ward1Id,
            OrganizationId = muniA.Id,
            ParentAreaId = gurgaonArea.Id,
            Name = "Ward 1",
            Code = "WARD_1"
        };

        var faridabadArea = new Area
        {
            Id = Guid.Parse("c1b2c3d4-e5f6-7890-abcd-ef1234567805"),
            OrganizationId = muniA.Id,
            ParentAreaId = haryanaArea.Id,
            Name = "Faridabad",
            Code = "FARIDABAD"
        };
        var ward3Area = new Area
        {
            Id = Ward3Id,
            OrganizationId = muniA.Id,
            ParentAreaId = faridabadArea.Id,
            Name = "Ward 3",
            Code = "WARD_3"
        };
        db.Areas.AddRange(haryanaArea, gurgaonArea, ward1Area, faridabadArea, ward3Area);

        // 3. Permissions
        var pView = new Permission { Id = Guid.NewGuid(), Code = "Complaint.View" };
        var pCreate = new Permission { Id = Guid.NewGuid(), Code = "Complaint.Create" };
        var pUpdate = new Permission { Id = Guid.NewGuid(), Code = "Complaint.Update" };
        var pClose = new Permission { Id = Guid.NewGuid(), Code = "Complaint.Close" };
        db.Permissions.AddRange(pView, pCreate, pUpdate, pClose);

        // 4. Roles
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

        // 5. Users
        var userRaj = new User { Id = Guid.NewGuid(), KeycloakUserId = RajSub, Email = "raj@test.com", DisplayName = "Raj" };
        var userAmit = new User { Id = Guid.NewGuid(), KeycloakUserId = AmitSub, Email = "amit@test.com", DisplayName = "Amit" };
        db.Users.AddRange(userRaj, userAmit);

        // 6. Memberships
        db.Memberships.AddRange(
            new Membership { Id = Guid.NewGuid(), UserId = userRaj.Id, OrganizationId = muniA.Id, RoleId = inspectorRole.Id, ScopeAreaId = gurgaonArea.Id },
            new Membership { Id = Guid.NewGuid(), UserId = userAmit.Id, OrganizationId = muniA.Id, RoleId = supervisorRole.Id, ScopeAreaId = haryanaArea.Id }
        );

        await db.SaveChangesAsync();
        return db;
    }

    [Fact]
    public async Task OrganizationIsolation_UserAccessingOtherOrganization_ReturnsDenied()
    {
        using var db = await CreateTestDbContextAsync(nameof(OrganizationIsolation_UserAccessingOtherOrganization_ReturnsDenied));
        var engine = new AuthorizationEngine(db, NullLogger<AuthorizationEngine>.Instance);

        var request = new AuthorizationRequest(RajSub, OtherOrgId, "Complaint.Update", Ward1Id);
        var result = await engine.EvaluateAsync(request);

        Assert.False(result.IsAllowed);
        Assert.Contains("does not belong to organization", result.Reason);
    }

    [Fact]
    public async Task SubOrganizationIsolation_RajUpdatingGurgaonResource_ReturnsAllowed()
    {
        using var db = await CreateTestDbContextAsync(nameof(SubOrganizationIsolation_RajUpdatingGurgaonResource_ReturnsAllowed));
        var engine = new AuthorizationEngine(db, NullLogger<AuthorizationEngine>.Instance);

        var request = new AuthorizationRequest(RajSub, MuniAId, "Complaint.Update", Ward1Id);
        var result = await engine.EvaluateAsync(request);

        Assert.True(result.IsAllowed);
    }

    [Fact]
    public async Task SubOrganizationIsolation_RajUpdatingFaridabadResource_ReturnsDenied()
    {
        using var db = await CreateTestDbContextAsync(nameof(SubOrganizationIsolation_RajUpdatingFaridabadResource_ReturnsDenied));
        var engine = new AuthorizationEngine(db, NullLogger<AuthorizationEngine>.Instance);

        var request = new AuthorizationRequest(RajSub, MuniAId, "Complaint.Update", Ward3Id);
        var result = await engine.EvaluateAsync(request);

        Assert.False(result.IsAllowed);
        Assert.Contains("outside user's assigned scope", result.Reason);
    }

    [Fact]
    public async Task HierarchicalScope_AmitUpdatingGurgaonResource_ReturnsAllowed()
    {
        using var db = await CreateTestDbContextAsync(nameof(HierarchicalScope_AmitUpdatingGurgaonResource_ReturnsAllowed));
        var engine = new AuthorizationEngine(db, NullLogger<AuthorizationEngine>.Instance);

        var request = new AuthorizationRequest(AmitSub, MuniAId, "Complaint.Update", Ward1Id);
        var result = await engine.EvaluateAsync(request);

        Assert.True(result.IsAllowed);
    }

    [Fact]
    public async Task HierarchicalScope_AmitClosingGurgaonResource_ReturnsAllowed()
    {
        using var db = await CreateTestDbContextAsync(nameof(HierarchicalScope_AmitClosingGurgaonResource_ReturnsAllowed));
        var engine = new AuthorizationEngine(db, NullLogger<AuthorizationEngine>.Instance);

        var request = new AuthorizationRequest(AmitSub, MuniAId, "Complaint.Close", Ward1Id);
        var result = await engine.EvaluateAsync(request);

        Assert.True(result.IsAllowed);
    }

    [Fact]
    public async Task PermissionCheck_RajClosingGurgaonResource_ReturnsDenied()
    {
        using var db = await CreateTestDbContextAsync(nameof(PermissionCheck_RajClosingGurgaonResource_ReturnsDenied));
        var engine = new AuthorizationEngine(db, NullLogger<AuthorizationEngine>.Instance);

        var request = new AuthorizationRequest(RajSub, MuniAId, "Complaint.Close", Ward1Id);
        var result = await engine.EvaluateAsync(request);

        Assert.False(result.IsAllowed);
        Assert.Contains("lacks permission 'Complaint.Close'", result.Reason);
    }

    [Fact]
    public async Task UnregisteredUser_ReturnsDenied()
    {
        using var db = await CreateTestDbContextAsync(nameof(UnregisteredUser_ReturnsDenied));
        var engine = new AuthorizationEngine(db, NullLogger<AuthorizationEngine>.Instance);

        var request = new AuthorizationRequest("unknown-user-id", MuniAId, "Complaint.View", Ward1Id);
        var result = await engine.EvaluateAsync(request);

        Assert.False(result.IsAllowed);
        Assert.Contains("not registered", result.Reason);
    }
}
