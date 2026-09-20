using Payment.Api.Domain;

namespace Payment.Api.DTOs;

public record InitiatePaymentRequest(
    Guid OrganizationId,
    string SourceSystem,
    Guid PayableReferenceId,
    decimal Amount,
    string Currency,
    string IdempotencyKey,
    Guid? CorrelationId = null,
    string? Provider = null,
    string? Description = null,
    string? MetadataJson = null,
    string? SuccessCallbackUrl = null);

public record InitiatePaymentResponse(
    Guid PaymentId,
    string Status,
    string ProviderCode,
    string ProviderOrderId,
    string? CheckoutUrl,
    decimal Amount,
    string Currency);

public record PaymentResponse(
    Guid Id,
    Guid OrganizationId,
    string SourceSystem,
    Guid PayableReferenceId,
    Guid? CorrelationId,
    decimal Amount,
    string Currency,
    PaymentStatus Status,
    string ProviderCode,
    string? ProviderOrderId,
    string? ProviderPaymentId,
    string IdempotencyKey,
    string? Description,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? PaidAt,
    string? FailureReason);

public record PaymentEventResponse(
    Guid Id,
    string EventType,
    DateTimeOffset OccurredAt,
    string? PayloadJson);

public record PaymentStatsResponse(
    int Total,
    int Pending,
    int RequiresAction,
    int Succeeded,
    int Failed,
    int Cancelled,
    decimal SucceededAmount);

public record PaymentWebhookPayload(string? ProviderOrderId, string? ProviderPaymentId);

/// <summary>Generic settlement payload posted to SuccessCallbackUrl.</summary>
public record PaymentSettlementCallback(
    Guid PaymentId,
    Guid OrganizationId,
    string SourceSystem,
    Guid PayableReferenceId,
    Guid? CorrelationId,
    decimal AmountPaid,
    string Currency,
    string ExternalPaymentReference,
    string Status);

public static class PaymentMapping
{
    public static PaymentResponse ToResponse(this Domain.Payment payment) => new(
        payment.Id,
        payment.OrganizationId,
        payment.SourceSystem,
        payment.PayableReferenceId,
        payment.CorrelationId,
        payment.Amount,
        payment.Currency,
        payment.Status,
        payment.ProviderCode,
        payment.ProviderOrderId,
        payment.ProviderPaymentId,
        payment.IdempotencyKey,
        payment.Description,
        payment.CreatedAt,
        payment.UpdatedAt,
        payment.PaidAt,
        payment.FailureReason);

    public static PaymentEventResponse ToResponse(this PaymentEvent evt) => new(
        evt.Id,
        evt.EventType,
        evt.OccurredAt,
        evt.PayloadJson);
}
