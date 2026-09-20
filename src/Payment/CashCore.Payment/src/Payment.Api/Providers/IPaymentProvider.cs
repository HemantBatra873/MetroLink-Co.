namespace Payment.Api.Providers;

public interface IPaymentProvider
{
    string ProviderCode { get; }

    Task<ProviderOrderResult> CreateOrderAsync(
        decimal amount,
        string currency,
        IReadOnlyDictionary<string, string> metadata,
        CancellationToken cancellationToken = default);

    Task<ProviderVerificationResult> VerifyPaymentAsync(
        string providerOrderId,
        string? providerPaymentId,
        CancellationToken cancellationToken = default);
}
