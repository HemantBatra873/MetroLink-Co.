using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Enforcement.Api.Domain;
using Enforcement.Api.DTOs;
using Enforcement.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Enforcement.Tests;

public class EnforcementWebApplicationFactory : WebApplicationFactory<Program>
{
    private int _seeded;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
    }

    protected override void ConfigureClient(HttpClient client)
    {
        if (Interlocked.Exchange(ref _seeded, 1) == 0)
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<EnforcementDbContext>();
            TestConfigSeed.EnsureSeededAsync(db).GetAwaiter().GetResult();
        }

        base.ConfigureClient(client);
    }
}

public class EnforcementApiIntegrationTests : IClassFixture<EnforcementWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private static readonly Guid OrgId = TestConfigSeed.DemoOrganizationId;
    private static readonly string Actor = "3fa85f64-5717-4562-b3fc-2c963f66afa1";

    public EnforcementApiIntegrationTests(EnforcementWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Test-User-Sub", Actor);
    }

    [Fact]
    public async Task Test_fixture_includes_parking_and_market_domains()
    {
        var domains = await _client.GetFromJsonAsync<List<EnforcementDomain>>(
            $"/api/v1/configuration/domains?organizationId={OrgId}", JsonOpts);

        Assert.NotNull(domains);
        Assert.Contains(domains, d => d.Code == "PARKING");
        Assert.Contains(domains, d => d.Code == "MARKET");
        Assert.DoesNotContain(domains, d => d.Code.Contains("if") || d.Description?.Contains("parking-only") == true);

        var parking = domains.First(d => d.Code == "PARKING");
        var market = domains.First(d => d.Code == "MARKET");
        Assert.Contains(parking.SubjectTypes, s => s.Code == "VEHICLE");
        Assert.Contains(market.SubjectTypes, s => s.Code == "VENDOR");
    }

    [Fact]
    public async Task Create_issue_and_pay_parking_case()
    {
        var create = new CreateCaseRequest(
            OrganizationId: OrgId,
            EnforcementDomainId: TestConfigSeed.ParkingDomainId,
            AreaId: null,
            SubjectTypeCode: "VEHICLE",
            SubjectDisplayLabel: "HR26AB1234",
            SubjectExternalId: "VEH-HR26AB1234",
            SubjectMetadataJson: null,
            ViolationTypeId: Guid.Parse("22222222-2222-2222-2222-222222222211"),
            LocationLabel: "Sector 14, Gurgaon",
            Latitude: 28.46,
            Longitude: 77.03,
            Notes: "Parked in no-parking zone",
            OffenceNumber: 1);

        var createRes = await _client.PostAsJsonAsync("/api/v1/enforcement-cases", create);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var created = await createRes.Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts);
        Assert.NotNull(created);
        Assert.Equal(CaseStatus.Draft, created.Status);
        Assert.StartsWith("PARKING-", created.CaseNumber);

        var issueRes = await _client.PostAsJsonAsync($"/api/v1/enforcement-cases/{created.Id}/issue",
            new IssueCaseRequest(Guid.Parse("22222222-2222-2222-2222-222222222222"), "Issued fine", 14));
        Assert.Equal(HttpStatusCode.OK, issueRes.StatusCode);
        var issued = await issueRes.Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts);
        Assert.NotNull(issued);
        Assert.Equal(CaseStatus.Payable, issued.Status);
        Assert.Single(issued.FinancialObligations);
        Assert.Equal(500m, issued.FinancialObligations.First().Amount);

        var obligationId = issued.FinancialObligations.First().Id;
        var payRes = await _client.PostAsJsonAsync($"/api/v1/financial-obligations/{obligationId}/mark-paid",
            new MarkObligationPaidRequest(500m, "pay_test_1"));
        Assert.Equal(HttpStatusCode.OK, payRes.StatusCode);

        var paidCase = await _client.GetFromJsonAsync<EnforcementCase>($"/api/v1/enforcement-cases/{created.Id}", JsonOpts);
        Assert.NotNull(paidCase);
        Assert.Equal(CaseStatus.Paid, paidCase.Status);
        Assert.Contains(paidCase.AuditEvents, e => e.EventType == "PaymentReceived");
    }

    [Fact]
    public async Task Create_and_issue_market_case_same_engine()
    {
        var create = new CreateCaseRequest(
            OrganizationId: OrgId,
            EnforcementDomainId: TestConfigSeed.MarketDomainId,
            AreaId: null,
            SubjectTypeCode: "VENDOR",
            SubjectDisplayLabel: "Vendor Stall 42",
            SubjectExternalId: "VEN-42",
            SubjectMetadataJson: null,
            ViolationTypeId: Guid.Parse("33333333-3333-3333-3333-333333333311"),
            LocationLabel: "Old Market",
            Latitude: null,
            Longitude: null,
            Notes: null,
            OffenceNumber: 1);

        var createRes = await _client.PostAsJsonAsync("/api/v1/enforcement-cases", create);
        createRes.EnsureSuccessStatusCode();
        var created = await createRes.Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts);
        Assert.NotNull(created);
        Assert.StartsWith("MARKET-", created.CaseNumber);

        var issueRes = await _client.PostAsJsonAsync($"/api/v1/enforcement-cases/{created.Id}/issue",
            new IssueCaseRequest(Guid.Parse("33333333-3333-3333-3333-333333333322"), null, 7));
        issueRes.EnsureSuccessStatusCode();
        var issued = await issueRes.Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts);
        Assert.NotNull(issued);
        Assert.Equal(CaseStatus.Payable, issued.Status);
        Assert.Equal(1000m, issued.FinancialObligations.First().Amount);
    }

    [Fact]
    public async Task Penalty_escalates_on_repeat_offence()
    {
        var subject = "VEH-REPEAT-1";
        var violationId = Guid.Parse("22222222-2222-2222-2222-222222222211");

        async Task<EnforcementCase> CreateAndIssue()
        {
            var create = new CreateCaseRequest(OrgId, TestConfigSeed.ParkingDomainId, null, "VEHICLE", "HR26REPEAT", subject,
                null, violationId, "Loc", null, null, null, null);
            var created = (await (await _client.PostAsJsonAsync("/api/v1/enforcement-cases", create))
                .Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts))!;
            var issued = (await (await _client.PostAsJsonAsync($"/api/v1/enforcement-cases/{created.Id}/issue",
                new IssueCaseRequest(Guid.Parse("22222222-2222-2222-2222-222222222222"), null, 14)))
                .Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts))!;
            return issued;
        }

        var first = await CreateAndIssue();
        var second = await CreateAndIssue();

        Assert.Equal(500m, first.FinancialObligations.First().Amount);
        Assert.Equal(1000m, second.FinancialObligations.First().Amount);
        Assert.Equal(2, second.Violations.First().OffenceNumberApplied);
    }

    [Fact]
    public async Task Mark_paid_is_idempotent_for_same_reference()
    {
        var create = new CreateCaseRequest(OrgId, TestConfigSeed.ParkingDomainId, null, "VEHICLE", "HR26IDEM", "VEH-IDEM",
            null, Guid.Parse("22222222-2222-2222-2222-222222222211"), "Loc", null, null, null, 1);
        var created = (await (await _client.PostAsJsonAsync("/api/v1/enforcement-cases", create))
            .Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts))!;
        var issued = (await (await _client.PostAsJsonAsync($"/api/v1/enforcement-cases/{created.Id}/issue",
            new IssueCaseRequest(Guid.Parse("22222222-2222-2222-2222-222222222222"), null, 14)))
            .Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts))!;
        var oid = issued.FinancialObligations.First().Id;

        var body = new MarkObligationPaidRequest(500m, "idem-ref-9");
        var r1 = await _client.PostAsJsonAsync($"/api/v1/financial-obligations/{oid}/mark-paid", body);
        var r2 = await _client.PostAsJsonAsync($"/api/v1/financial-obligations/{oid}/mark-paid", body);
        r1.EnsureSuccessStatusCode();
        r2.EnsureSuccessStatusCode();

        var o1 = await r1.Content.ReadFromJsonAsync<FinancialObligation>(JsonOpts);
        var o2 = await r2.Content.ReadFromJsonAsync<FinancialObligation>(JsonOpts);
        Assert.Equal(ObligationStatus.Paid, o1!.Status);
        Assert.Equal(ObligationStatus.Paid, o2!.Status);
        Assert.Equal(500m, o2.AmountPaid);
    }

    [Fact]
    public async Task Dispute_and_uphold_returns_to_payable()
    {
        var create = new CreateCaseRequest(OrgId, TestConfigSeed.ParkingDomainId, null, "VEHICLE", "HR26DISP", "VEH-DISP",
            null, Guid.Parse("22222222-2222-2222-2222-222222222211"), "Loc", null, null, null, 1);
        var created = (await (await _client.PostAsJsonAsync("/api/v1/enforcement-cases", create))
            .Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts))!;
        await _client.PostAsJsonAsync($"/api/v1/enforcement-cases/{created.Id}/issue",
            new IssueCaseRequest(Guid.Parse("22222222-2222-2222-2222-222222222222"), null, 14));

        var disputed = (await (await _client.PostAsJsonAsync($"/api/v1/enforcement-cases/{created.Id}/dispute",
            new DisputeCaseRequest("Wrong vehicle")))
            .Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts))!;
        Assert.Equal(CaseStatus.UnderReview, disputed.Status);

        var reviewed = (await (await _client.PostAsJsonAsync($"/api/v1/enforcement-cases/{created.Id}/review",
            new ReviewCaseRequest(true, "Evidence clear")))
            .Content.ReadFromJsonAsync<EnforcementCase>(JsonOpts))!;
        Assert.Equal(CaseStatus.Payable, reviewed.Status);
    }

    [Fact]
    public async Task Dashboard_returns_counts()
    {
        var stats = await _client.GetFromJsonAsync<DashboardStatsDto>($"/api/v1/dashboard?organizationId={OrgId}", JsonOpts);
        Assert.NotNull(stats);
        Assert.True(stats.TotalCases >= 0);
    }
}
