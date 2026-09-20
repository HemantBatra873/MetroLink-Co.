using Payment.Api.DTOs;

namespace Payment.Api.Services;

/// <summary>
/// Notifies the calling product when a payment settles.
/// Uses the callback URL registered at initiate time — Payment never hard-codes other services.
/// </summary>
public interface IPaymentSettlementNotifier
{
    Task NotifySucceededAsync(Domain.Payment payment, string externalPaymentReference, CancellationToken ct);
}

public sealed class HttpPaymentSettlementNotifier : IPaymentSettlementNotifier
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<HttpPaymentSettlementNotifier> _logger;

    public HttpPaymentSettlementNotifier(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<HttpPaymentSettlementNotifier> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task NotifySucceededAsync(
        Domain.Payment payment,
        string externalPaymentReference,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(payment.SuccessCallbackUrl))
            return;

        var payload = new PaymentSettlementCallback(
            payment.Id,
            payment.OrganizationId,
            payment.SourceSystem,
            payment.PayableReferenceId,
            payment.CorrelationId,
            payment.Amount,
            payment.Currency,
            externalPaymentReference,
            payment.Status.ToString());

        var client = _httpClientFactory.CreateClient("PaymentSettlement");
        using var request = new HttpRequestMessage(HttpMethod.Post, payment.SuccessCallbackUrl);
        request.Content = JsonContent.Create(payload);

        var serviceKey = _configuration["Payment:CallbackServiceKey"];
        if (!string.IsNullOrEmpty(serviceKey))
            request.Headers.TryAddWithoutValidation("X-Internal-Service-Key", serviceKey);

        var response = await client.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError(
                "Settlement callback failed for payment {PaymentId} → {Url} ({Status}): {Body}",
                payment.Id,
                payment.SuccessCallbackUrl,
                (int)response.StatusCode,
                body);
            throw new InvalidOperationException(
                $"Settlement callback failed ({(int)response.StatusCode}): {body}");
        }
    }
}
