# Payments

CashCore Payment is the **central** payment service. Enforcement (and other products) call into it; Payment does **not** hard-code Enforcement.

## Flow

```text
UI "Pay" → CashCore Payment.Api initiate
  (sourceSystem, payableReferenceId, optional successCallbackUrl)
  → IPaymentProvider.CreateOrder (Mock | Razorpay | Stripe)
  → User completes payment
  → Webhook / complete-mock
  → Provider verification (never trust UI alone)
  → Optional POST to SuccessCallbackUrl (generic settlement payload)
  → Enforcement mark-paid applies obligation + case status + audit
```

Enforcement registers its own callback when initiating:

`POST {enforcement}/api/v1/financial-obligations/{id}/mark-paid`

Payment attaches `X-Internal-Service-Key` from `Payment:CallbackServiceKey` (same value as Enforcement `Internal:ServiceKey` in local dev).

## Initiate fields (generic)

| Field | Meaning |
|-------|---------|
| `sourceSystem` | e.g. `Enforcement` |
| `payableReferenceId` | Financial obligation id |
| `correlationId` | Optional case id |
| `successCallbackUrl` | Optional settlement webhook for the caller |

## Providers

| Provider | Config | Notes |
|----------|--------|-------|
| Mock | `Payment:DefaultProvider=Mock` | Local/dev; `POST .../complete-mock` |
| Razorpay | `Razorpay:KeyId`, `Razorpay:KeySecret` | Stubbed adapter |
| Stripe | `Stripe:SecretKey` | Stubbed adapter |

Never commit real secrets. Use env vars / user secrets.

## Source of truth

- **Payment** rows live in CashCore (`payment_db`)
- **Obligation / case paid state** lives in Enforcement
- Providers are external

## Idempotency

- Payment initiate: unique `IdempotencyKey`
- Webhooks: safe to replay (Payment status + Enforcement external payment reference)
