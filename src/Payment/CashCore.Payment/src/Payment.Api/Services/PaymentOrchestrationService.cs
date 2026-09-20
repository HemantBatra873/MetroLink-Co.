using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Payment.Api.Domain;
using Payment.Api.DTOs;
using Payment.Api.Infrastructure.Data;
using Payment.Api.Providers;

namespace Payment.Api.Services;

public interface IPaymentOrchestrationService
{
    Task<InitiatePaymentResponse> InitiateAsync(InitiatePaymentRequest request, CancellationToken ct);
    Task<PaymentResponse> GetByIdAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyList<PaymentEventResponse>> GetEventsAsync(Guid paymentId, CancellationToken ct);
    Task<IReadOnlyList<PaymentResponse>> ListAsync(
        Guid? organizationId,
        Guid? payableReferenceId,
        string? sourceSystem,
        PaymentStatus? status,
        CancellationToken ct);
    Task<PaymentStatsResponse> GetStatsAsync(Guid? organizationId, string? sourceSystem, CancellationToken ct);
    Task<PaymentResponse> CompleteMockAsync(Guid paymentId, CancellationToken ct);
    Task<PaymentResponse> ProcessWebhookAsync(string providerCode, PaymentWebhookPayload payload, CancellationToken ct);
}

public sealed class PaymentOrchestrationService : IPaymentOrchestrationService
{
    private readonly PaymentDbContext _db;
    private readonly IPaymentProviderResolver _providerResolver;
    private readonly IPaymentSettlementNotifier _settlementNotifier;

    public PaymentOrchestrationService(
        PaymentDbContext db,
        IPaymentProviderResolver providerResolver,
        IPaymentSettlementNotifier settlementNotifier)
    {
        _db = db;
        _providerResolver = providerResolver;
        _settlementNotifier = settlementNotifier;
    }

    public async Task<InitiatePaymentResponse> InitiateAsync(InitiatePaymentRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.IdempotencyKey))
            throw new InvalidOperationException("IdempotencyKey is required.");
        if (string.IsNullOrWhiteSpace(request.SourceSystem))
            throw new InvalidOperationException("SourceSystem is required.");
        if (request.Amount <= 0)
            throw new InvalidOperationException("Amount must be greater than zero.");

        var existing = await _db.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.IdempotencyKey == request.IdempotencyKey, ct);
        if (existing is not null)
            return ToInitiateResponse(existing);

        var provider = _providerResolver.Resolve(request.Provider);
        var now = DateTimeOffset.UtcNow;

        var payment = new Domain.Payment
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            SourceSystem = request.SourceSystem.Trim(),
            PayableReferenceId = request.PayableReferenceId,
            CorrelationId = request.CorrelationId,
            Amount = request.Amount,
            Currency = string.IsNullOrWhiteSpace(request.Currency) ? "INR" : request.Currency.Trim().ToUpperInvariant(),
            Status = PaymentStatus.Pending,
            ProviderCode = provider.ProviderCode,
            IdempotencyKey = request.IdempotencyKey.Trim(),
            Description = request.Description,
            MetadataJson = request.MetadataJson,
            SuccessCallbackUrl = string.IsNullOrWhiteSpace(request.SuccessCallbackUrl)
                ? null
                : request.SuccessCallbackUrl.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        var metadata = new Dictionary<string, string>
        {
            ["paymentId"] = payment.Id.ToString(),
            ["organizationId"] = request.OrganizationId.ToString(),
            ["sourceSystem"] = payment.SourceSystem,
            ["payableReferenceId"] = request.PayableReferenceId.ToString()
        };

        ProviderOrderResult order;
        try
        {
            order = await provider.CreateOrderAsync(request.Amount, request.Currency, metadata, ct);
        }
        catch (PaymentProviderConfigurationException)
        {
            throw;
        }

        payment.ProviderOrderId = order.ProviderOrderId;
        if (!string.IsNullOrEmpty(order.CheckoutUrl))
            payment.Status = PaymentStatus.RequiresAction;

        _db.Payments.Add(payment);
        _db.PaymentEvents.Add(CreateEvent(payment.Id, "PaymentInitiated", new
        {
            payment.ProviderCode,
            order.ProviderOrderId,
            order.CheckoutUrl,
            payment.SourceSystem,
            payment.PayableReferenceId
        }));
        await _db.SaveChangesAsync(ct);

        return ToInitiateResponse(payment, order.CheckoutUrl);
    }

    public async Task<PaymentResponse> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var payment = await _db.Payments.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new InvalidOperationException("Payment not found.");
        return payment.ToResponse();
    }

    public async Task<IReadOnlyList<PaymentEventResponse>> GetEventsAsync(Guid paymentId, CancellationToken ct)
    {
        var exists = await _db.Payments.AsNoTracking().AnyAsync(p => p.Id == paymentId, ct);
        if (!exists)
            throw new InvalidOperationException("Payment not found.");

        var events = await _db.PaymentEvents
            .AsNoTracking()
            .Where(e => e.PaymentId == paymentId)
            .OrderBy(e => e.OccurredAt)
            .ToListAsync(ct);

        return events.Select(e => e.ToResponse()).ToList();
    }

    public async Task<IReadOnlyList<PaymentResponse>> ListAsync(
        Guid? organizationId,
        Guid? payableReferenceId,
        string? sourceSystem,
        PaymentStatus? status,
        CancellationToken ct)
    {
        var query = _db.Payments.AsNoTracking().AsQueryable();
        if (organizationId is not null)
            query = query.Where(p => p.OrganizationId == organizationId);
        if (payableReferenceId is not null)
            query = query.Where(p => p.PayableReferenceId == payableReferenceId);
        if (!string.IsNullOrWhiteSpace(sourceSystem))
            query = query.Where(p => p.SourceSystem == sourceSystem);
        if (status is not null)
            query = query.Where(p => p.Status == status);

        var items = await query.OrderByDescending(p => p.CreatedAt).Take(500).ToListAsync(ct);
        return items.Select(p => p.ToResponse()).ToList();
    }

    public async Task<PaymentStatsResponse> GetStatsAsync(
        Guid? organizationId,
        string? sourceSystem,
        CancellationToken ct)
    {
        var query = _db.Payments.AsNoTracking().AsQueryable();
        if (organizationId is not null)
            query = query.Where(p => p.OrganizationId == organizationId);
        if (!string.IsNullOrWhiteSpace(sourceSystem))
            query = query.Where(p => p.SourceSystem == sourceSystem);

        var items = await query.ToListAsync(ct);
        return new PaymentStatsResponse(
            items.Count,
            items.Count(p => p.Status == PaymentStatus.Pending),
            items.Count(p => p.Status == PaymentStatus.RequiresAction),
            items.Count(p => p.Status == PaymentStatus.Succeeded),
            items.Count(p => p.Status == PaymentStatus.Failed),
            items.Count(p => p.Status == PaymentStatus.Cancelled),
            items.Where(p => p.Status == PaymentStatus.Succeeded).Sum(p => p.Amount));
    }

    public Task<PaymentResponse> CompleteMockAsync(Guid paymentId, CancellationToken ct) =>
        ApplyVerifiedPaymentAsync(paymentId, providerCode: "Mock", simulateVerification: true, ct);

    public async Task<PaymentResponse> ProcessWebhookAsync(
        string providerCode,
        PaymentWebhookPayload payload,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(payload.ProviderOrderId))
            throw new InvalidOperationException("ProviderOrderId is required.");

        var payment = await _db.Payments
            .FirstOrDefaultAsync(p => p.ProviderOrderId == payload.ProviderOrderId, ct)
            ?? throw new InvalidOperationException("Payment not found for provider order.");

        if (!string.Equals(payment.ProviderCode, providerCode, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Provider mismatch for payment.");

        if (payment.Status == PaymentStatus.Succeeded)
            return payment.ToResponse();

        var provider = _providerResolver.Resolve(providerCode);
        var verification = await provider.VerifyPaymentAsync(payload.ProviderOrderId, payload.ProviderPaymentId, ct);
        if (!verification.IsSuccessful)
        {
            payment.Status = PaymentStatus.Failed;
            payment.FailureReason = verification.FailureReason ?? "Verification failed.";
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            _db.PaymentEvents.Add(CreateEvent(payment.Id, "PaymentFailed", verification));
            await _db.SaveChangesAsync(ct);
            throw new InvalidOperationException(payment.FailureReason);
        }

        return await MarkSucceededAsync(payment, verification.ProviderPaymentId, ct);
    }

    private async Task<PaymentResponse> ApplyVerifiedPaymentAsync(
        Guid paymentId,
        string providerCode,
        bool simulateVerification,
        CancellationToken ct)
    {
        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.Id == paymentId, ct)
            ?? throw new InvalidOperationException("Payment not found.");

        if (!string.Equals(payment.ProviderCode, providerCode, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Payment is not using {providerCode} provider.");

        if (payment.Status == PaymentStatus.Succeeded)
            return payment.ToResponse();

        string? providerPaymentId = payment.ProviderPaymentId;
        if (simulateVerification)
        {
            if (string.IsNullOrEmpty(payment.ProviderOrderId))
                throw new InvalidOperationException("Payment has no provider order.");
            var provider = _providerResolver.Resolve(providerCode);
            var verification = await provider.VerifyPaymentAsync(payment.ProviderOrderId, payment.ProviderPaymentId, ct);
            if (!verification.IsSuccessful)
                throw new InvalidOperationException(verification.FailureReason ?? "Verification failed.");
            providerPaymentId = verification.ProviderPaymentId;
        }

        return await MarkSucceededAsync(payment, providerPaymentId, ct);
    }

    private async Task<PaymentResponse> MarkSucceededAsync(
        Domain.Payment payment,
        string? providerPaymentId,
        CancellationToken ct)
    {
        if (payment.Status == PaymentStatus.Succeeded)
            return payment.ToResponse();

        var reference = providerPaymentId ?? payment.ProviderPaymentId ?? payment.ProviderOrderId ?? payment.Id.ToString();
        payment.Status = PaymentStatus.Succeeded;
        payment.ProviderPaymentId = reference;
        payment.PaidAt = DateTimeOffset.UtcNow;
        payment.UpdatedAt = payment.PaidAt.Value;
        _db.PaymentEvents.Add(CreateEvent(payment.Id, "PaymentSucceeded", new { reference }));
        await _db.SaveChangesAsync(ct);

        if (!string.IsNullOrWhiteSpace(payment.SuccessCallbackUrl))
        {
            await _settlementNotifier.NotifySucceededAsync(payment, reference, ct);
            _db.PaymentEvents.Add(CreateEvent(payment.Id, "SettlementCallbackSent", new
            {
                payment.SuccessCallbackUrl,
                payment.PayableReferenceId,
                reference
            }));
            await _db.SaveChangesAsync(ct);
        }

        return payment.ToResponse();
    }

    private static InitiatePaymentResponse ToInitiateResponse(Domain.Payment payment, string? checkoutUrl = null) =>
        new(
            payment.Id,
            payment.Status.ToString(),
            payment.ProviderCode,
            payment.ProviderOrderId ?? string.Empty,
            checkoutUrl,
            payment.Amount,
            payment.Currency);

    private static PaymentEvent CreateEvent(Guid paymentId, string eventType, object payload) =>
        new()
        {
            Id = Guid.NewGuid(),
            PaymentId = paymentId,
            EventType = eventType,
            OccurredAt = DateTimeOffset.UtcNow,
            PayloadJson = JsonSerializer.Serialize(payload)
        };
}
