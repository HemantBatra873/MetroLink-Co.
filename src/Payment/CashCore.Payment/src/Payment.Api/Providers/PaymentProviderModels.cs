namespace Payment.Api.Providers;

public record ProviderOrderResult(
    string ProviderOrderId,
    string? CheckoutUrl,
    string? ClientPayloadJson);

public record ProviderVerificationResult(
    bool IsSuccessful,
    string? ProviderPaymentId,
    decimal? AmountPaid,
    string? Currency,
    string? FailureReason);

public class PaymentProviderConfigurationException : InvalidOperationException
{
    public PaymentProviderConfigurationException(string message) : base(message) { }
}
