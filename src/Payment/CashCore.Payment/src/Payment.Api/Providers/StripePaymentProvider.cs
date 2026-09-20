using Microsoft.Extensions.Configuration;

namespace Payment.Api.Providers;

/// <summary>
/// Stripe integration stub — configure Stripe:SecretKey and Stripe:PublishableKey.
/// </summary>
public sealed class StripePaymentProvider : IPaymentProvider
{
    private readonly string? _secretKey;
    private readonly string? _publishableKey;

    public StripePaymentProvider(IConfiguration configuration)
    {
        _secretKey = configuration["Stripe:SecretKey"];
        _publishableKey = configuration["Stripe:PublishableKey"];
    }

    public string ProviderCode => "Stripe";

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_secretKey) || string.IsNullOrWhiteSpace(_publishableKey))
        {
            throw new PaymentProviderConfigurationException(
                "Stripe provider requires Stripe:SecretKey and Stripe:PublishableKey in configuration.");
        }
    }

    public Task<ProviderOrderResult> CreateOrderAsync(
        decimal amount,
        string currency,
        IReadOnlyDictionary<string, string> metadata,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        var orderId = $"pi_{Guid.NewGuid():N}";
        return Task.FromResult(new ProviderOrderResult(orderId, null, $"{{\"client_secret\":\"stub_secret_{orderId}\"}}"));
    }

    public Task<ProviderVerificationResult> VerifyPaymentAsync(
        string providerOrderId,
        string? providerPaymentId,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        var paymentId = providerPaymentId ?? providerOrderId;
        return Task.FromResult(new ProviderVerificationResult(true, paymentId, null, null, null));
    }
}
