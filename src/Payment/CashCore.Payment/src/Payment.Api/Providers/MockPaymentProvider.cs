using Microsoft.Extensions.Configuration;

namespace Payment.Api.Providers;

public sealed class MockPaymentProvider : IPaymentProvider
{
    private readonly IConfiguration _configuration;

    public MockPaymentProvider(IConfiguration configuration) => _configuration = configuration;

    public string ProviderCode => "Mock";

    public Task<ProviderOrderResult> CreateOrderAsync(
        decimal amount,
        string currency,
        IReadOnlyDictionary<string, string> metadata,
        CancellationToken cancellationToken = default)
    {
        var orderId = $"mock_order_{Guid.NewGuid():N}";
        var baseUrl = _configuration["Payment:MockCheckoutBaseUrl"] ?? "http://localhost:5210";
        var checkoutUrl = $"{baseUrl.TrimEnd('/')}/mock-checkout/{orderId}";
        return Task.FromResult(new ProviderOrderResult(orderId, checkoutUrl, null));
    }

    public Task<ProviderVerificationResult> VerifyPaymentAsync(
        string providerOrderId,
        string? providerPaymentId,
        CancellationToken cancellationToken = default)
    {
        var paymentId = providerPaymentId ?? $"mock_pay_{providerOrderId}";
        return Task.FromResult(new ProviderVerificationResult(true, paymentId, null, null, null));
    }
}
