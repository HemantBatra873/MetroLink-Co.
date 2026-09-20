using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Payment.Api.DTOs;
using Payment.Api.Domain;

namespace Payment.Tests;

public class PaymentFlowTests : IClassFixture<PaymentWebApplicationFactory>
{
    private readonly PaymentWebApplicationFactory _factory;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    public PaymentFlowTests(PaymentWebApplicationFactory factory) => _factory = factory;

    private HttpClient CreateClient()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User-Sub", "test-user-001");
        client.DefaultRequestHeaders.Add("X-Test-User-Roles", "PaymentAdmin");
        return client;
    }

    private static InitiatePaymentRequest NewInitiate(
        string key,
        Guid? payableId = null,
        string? callbackUrl = "https://example.test/callbacks/settlement") =>
        new(
            Guid.NewGuid(),
            "Enforcement",
            payableId ?? Guid.NewGuid(),
            100.50m,
            "INR",
            key,
            Guid.NewGuid(),
            "Mock",
            Description: "Test payment",
            SuccessCallbackUrl: callbackUrl);

    [Fact]
    public async Task Initiate_is_idempotent_on_same_idempotency_key()
    {
        var client = CreateClient();
        var key = $"idem-{Guid.NewGuid():N}";
        var request = NewInitiate(key);

        var first = await client.PostAsJsonAsync("/api/v1/payments/initiate", request);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        var firstBody = await first.Content.ReadFromJsonAsync<InitiatePaymentResponse>();
        Assert.NotNull(firstBody);

        var second = await client.PostAsJsonAsync("/api/v1/payments/initiate", request);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        var secondBody = await second.Content.ReadFromJsonAsync<InitiatePaymentResponse>();
        Assert.NotNull(secondBody);
        Assert.Equal(firstBody.PaymentId, secondBody.PaymentId);
        Assert.Equal(firstBody.ProviderOrderId, secondBody.ProviderOrderId);
    }

    [Fact]
    public async Task Complete_mock_marks_payment_succeeded_and_notifies_callback()
    {
        _factory.FakeSettlement.Reset();
        var client = CreateClient();
        var initiate = await client.PostAsJsonAsync(
            "/api/v1/payments/initiate",
            NewInitiate($"idem-{Guid.NewGuid():N}"));
        var initiated = await initiate.Content.ReadFromJsonAsync<InitiatePaymentResponse>();
        Assert.NotNull(initiated);

        var complete = await client.PostAsync($"/api/v1/payments/{initiated.PaymentId}/complete-mock", null);
        Assert.Equal(HttpStatusCode.OK, complete.StatusCode);
        var payment = await complete.Content.ReadFromJsonAsync<PaymentResponse>(JsonOptions);
        Assert.NotNull(payment);
        Assert.Equal(PaymentStatus.Succeeded, payment.Status);
        Assert.NotNull(payment.PaidAt);
        Assert.Equal(1, _factory.FakeSettlement.NotifyCallCount);
        Assert.Equal(payment.Id, _factory.FakeSettlement.LastPaymentId);
    }

    [Fact]
    public async Task Complete_mock_without_callback_does_not_notify()
    {
        _factory.FakeSettlement.Reset();
        var client = CreateClient();
        var initiate = await client.PostAsJsonAsync(
            "/api/v1/payments/initiate",
            NewInitiate($"idem-{Guid.NewGuid():N}", callbackUrl: null));
        var initiated = await initiate.Content.ReadFromJsonAsync<InitiatePaymentResponse>();
        Assert.NotNull(initiated);

        var complete = await client.PostAsync($"/api/v1/payments/{initiated.PaymentId}/complete-mock", null);
        Assert.Equal(HttpStatusCode.OK, complete.StatusCode);
        Assert.Equal(0, _factory.FakeSettlement.NotifyCallCount);
    }

    [Fact]
    public async Task Webhook_replay_does_not_double_notify()
    {
        _factory.FakeSettlement.Reset();
        var client = CreateClient();
        var initiate = await client.PostAsJsonAsync(
            "/api/v1/payments/initiate",
            NewInitiate($"idem-{Guid.NewGuid():N}"));
        var initiated = await initiate.Content.ReadFromJsonAsync<InitiatePaymentResponse>();
        Assert.NotNull(initiated);

        var payload = new PaymentWebhookPayload(initiated.ProviderOrderId, "mock_pay_replay");
        var first = await client.PostAsJsonAsync("/api/v1/payments/webhooks/Mock", payload);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(1, _factory.FakeSettlement.NotifyCallCount);

        var second = await client.PostAsJsonAsync("/api/v1/payments/webhooks/Mock", payload);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        Assert.Equal(1, _factory.FakeSettlement.NotifyCallCount);
    }

    [Fact]
    public async Task Admin_can_list_and_get_stats()
    {
        var client = CreateClient();
        await client.PostAsJsonAsync("/api/v1/payments/initiate", NewInitiate($"idem-{Guid.NewGuid():N}"));

        var list = await client.GetAsync("/api/v1/payments");
        Assert.Equal(HttpStatusCode.OK, list.StatusCode);

        var stats = await client.GetAsync("/api/v1/payments/stats");
        Assert.Equal(HttpStatusCode.OK, stats.StatusCode);
        var body = await stats.Content.ReadFromJsonAsync<PaymentStatsResponse>();
        Assert.NotNull(body);
        Assert.True(body.Total >= 1);
    }
}
