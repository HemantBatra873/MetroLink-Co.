using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Parking.Api.Domain;
using Parking.Api.Domain.Facilities;
using Parking.Api.Domain.Obligations;
using Parking.Api.Domain.Sessions;
using Parking.Api.DTOs;
using Parking.Api.Infrastructure.Data;
using Xunit;

namespace Parking.Tests;

public class ParkingWebApplicationFactory : WebApplicationFactory<Program>
{
    private int _seeded;

    protected override void ConfigureWebHost(IWebHostBuilder builder) => builder.UseEnvironment("Testing");

    protected override void ConfigureClient(HttpClient client)
    {
        if (Interlocked.Exchange(ref _seeded, 1) == 0)
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ParkingDbContext>();
            TestConfigSeed.EnsureSeededAsync(db).GetAwaiter().GetResult();
        }

        base.ConfigureClient(client);
    }
}

public class FacilityApiIntegrationTests : IClassFixture<ParkingWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly ParkingWebApplicationFactory _factory;
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private static readonly Guid OrgId = TestConfigSeed.DemoOrganizationId;
    private static readonly string Actor = "3fa85f64-5717-4562-b3fc-2c963f66afa1";

    public FacilityApiIntegrationTests(ParkingWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Test-User-Sub", Actor);
    }

    [Fact]
    public async Task Facility_lifecycle_entry_exit_zero_amount_completes_immediately()
    {
        var facility = await CreateAndActivateFacilityAsync(capacity: 2, freeRate: true);

        var entry = new CreateSessionEntryRequest(
            OrgId, facility.Id, null, null, "HR26FREE1", null, VehicleType.Car, EntryExitMethod.Manual, TestConfigSeed.FreeHourlyProductId);
        var entryRes = await _client.PostAsJsonAsync("/api/v1/sessions", entry);
        Assert.Equal(HttpStatusCode.Created, entryRes.StatusCode);
        var session = await entryRes.Content.ReadFromJsonAsync<ParkingSession>(JsonOpts);
        Assert.NotNull(session);
        Assert.Equal(SessionStatus.Active, session.Status);

        var exitRes = await _client.PostAsJsonAsync($"/api/v1/sessions/{session.Id}/exit", new SessionExitRequest(EntryExitMethod.Manual, null));
        exitRes.EnsureSuccessStatusCode();
        var exitPayload = await exitRes.Content.ReadFromJsonAsync<SessionExitResultDto>(JsonOpts);
        Assert.NotNull(exitPayload);
        Assert.Equal(SessionStatus.Completed, exitPayload.Session.Status);
        Assert.Null(exitPayload.Obligation);
    }

    [Fact]
    public async Task Exit_with_rate_creates_obligation_and_mark_paid_completes_session()
    {
        var facility = await CreateAndActivateFacilityAsync(capacity: 5, freeRate: false);
        await SeedPaidRateAsync(facility.Id);

        var entry = new CreateSessionEntryRequest(
            OrgId, facility.Id, null, null, "HR26PAID1", null, VehicleType.Car, EntryExitMethod.Manual, TestConfigSeed.HourlyProductId);
        var session = (await (await _client.PostAsJsonAsync("/api/v1/sessions", entry)).Content.ReadFromJsonAsync<ParkingSession>(JsonOpts))!;

        var exitPayload = (await (await _client.PostAsJsonAsync($"/api/v1/sessions/{session.Id}/exit", new SessionExitRequest(EntryExitMethod.Manual, null)))
            .Content.ReadFromJsonAsync<SessionExitResultDto>(JsonOpts))!;
        Assert.Equal(SessionStatus.PaymentPending, exitPayload.Session.Status);
        Assert.NotNull(exitPayload.Obligation);
        Assert.True(exitPayload.Obligation!.Amount > 0);

        var payRes = await _client.PostAsJsonAsync(
            $"/api/v1/financial-obligations/{exitPayload.Obligation.Id}/mark-paid",
            new MarkObligationPaidRequest(exitPayload.Obligation.Amount, "pay_test_parking_1"));
        payRes.EnsureSuccessStatusCode();
        var paid = await payRes.Content.ReadFromJsonAsync<FinancialObligation>(JsonOpts);
        Assert.Equal(ObligationStatus.Paid, paid!.Status);

        var refreshed = await _client.GetFromJsonAsync<ParkingSession>($"/api/v1/sessions/{session.Id}", JsonOpts);
        Assert.Equal(SessionStatus.Completed, refreshed!.Status);
    }

    [Fact]
    public async Task Entry_rejected_when_at_capacity()
    {
        var facility = await CreateAndActivateFacilityAsync(capacity: 1, freeRate: true);
        var entry = new CreateSessionEntryRequest(
            OrgId, facility.Id, null, null, "HR26CAP1", null, VehicleType.Car, EntryExitMethod.Manual, TestConfigSeed.FreeHourlyProductId);
        Assert.Equal(HttpStatusCode.Created, (await _client.PostAsJsonAsync("/api/v1/sessions", entry)).StatusCode);

        var second = await _client.PostAsJsonAsync("/api/v1/sessions", entry with { VehiclePlate = "HR26CAP2" });
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
    }

    [Fact]
    public async Task Public_parking_lists_only_active_facilities()
    {
        var facility = await CreateAndActivateFacilityAsync(capacity: 3, freeRate: true);
        var list = await _client.GetFromJsonAsync<List<PublicFacilityDto>>("/api/v1/public/parking", JsonOpts);
        Assert.NotNull(list);
        Assert.Contains(list, f => f.Id == facility.Id);
    }

    private async Task<ParkingFacility> CreateAndActivateFacilityAsync(int capacity, bool freeRate)
    {
        var code = $"T-{Guid.NewGuid():N}"[..12];
        var create = new CreateFacilityRequest(
            OrgId, OrgId, OrgId, null, "Test Lot", code, null, FacilityType.Surface,
            "Test Address", 28.46, 77.03, capacity, OccupancyMode.Capacity, "Car", null);

        var created = (await (await _client.PostAsJsonAsync("/api/v1/facilities", create))
            .Content.ReadFromJsonAsync<ParkingFacility>(JsonOpts))!;

        await _client.PostAsync($"/api/v1/facilities/{created.Id}/submit", null);
        await _client.PostAsync($"/api/v1/facilities/{created.Id}/start-review", null);
        await _client.PostAsync($"/api/v1/facilities/{created.Id}/approve", null);
        var activated = (await (await _client.PostAsync($"/api/v1/facilities/{created.Id}/activate", null))
            .Content.ReadFromJsonAsync<ParkingFacility>(JsonOpts))!;
        Assert.Equal(FacilityStatus.Active, activated.Status);

        if (freeRate)
            await SeedFreeRateAsync(created.Id);
        return activated;
    }

    private async Task SeedFreeRateAsync(Guid facilityId)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ParkingDbContext>();
        await TestConfigSeed.SeedFreeRateForFacilityAsync(db, facilityId);
    }

    private async Task SeedPaidRateAsync(Guid facilityId)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ParkingDbContext>();
        await TestConfigSeed.SeedPaidRateForFacilityAsync(db, facilityId);
    }
}
