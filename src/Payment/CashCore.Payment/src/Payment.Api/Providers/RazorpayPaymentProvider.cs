using Microsoft.Extensions.Configuration;

namespace Payment.Api.Providers;

/// <summary>
/// Razorpay integration stub — configure Razorpay:KeyId and Razorpay:KeySecret.
/// </summary>
public sealed class RazorpayPaymentProvider : IPaymentProvider
{
    private readonly string? _keyId;
    private readonly string? _keySecret;

    public RazorpayPaymentProvider(IConfiguration configuration)
    {
        _keyId = configuration["Razorpay:KeyId"];
        _keySecret = configuration["Razorpay:KeySecret"];
    }

    public string ProviderCode => "Razorpay";

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_keyId) || string.IsNullOrWhiteSpace(_keySecret))
        {
            throw new PaymentProviderConfigurationException(
                "Razorpay provider requires Razorpay:KeyId and Razorpay:KeySecret in configuration.");
        }
    }

    public Task<ProviderOrderResult> CreateOrderAsync(
        decimal amount,
        string currency,
        IReadOnlyDictionary<string, string> metadata,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        var orderId = $"rzp_order_{Guid.NewGuid():N}";
        return Task.FromResult(new ProviderOrderResult(orderId, null, $"{{\"key_id\":\"{_keyId}\",\"order_id\":\"{orderId}\"}}"));
    }

    public Task<ProviderVerificationResult> VerifyPaymentAsync(
        string providerOrderId,
        string? providerPaymentId,
        CancellationToken cancellationToken = default)
    {
        EnsureConfigured();
        if (string.IsNullOrWhiteSpace(providerPaymentId))
        {
            return Task.FromResult(new ProviderVerificationResult(false, null, null, null, "Provider payment id required."));
        }

        return Task.FromResult(new ProviderVerificationResult(true, providerPaymentId, null, null, null));
    }
}
