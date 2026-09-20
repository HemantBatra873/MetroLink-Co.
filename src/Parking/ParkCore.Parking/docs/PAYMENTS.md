# Parking → Payment integration

Parking does **not** own Razorpay/Stripe. CashCore Payment is the payment source of truth.

## Flow

```
Exit session
  → Parking calculates amount (ParkingRate)
  → Parking creates FinancialObligation (Outstanding)
  → Client/API: POST Payment /api/v1/payments/initiate
       sourceSystem: "Parking"
       payableReferenceId: <obligationId>
       correlationId: <sessionId>
       successCallbackUrl: {parkingApi}/api/v1/financial-obligations/{obligationId}/mark-paid
  → Provider / Mock completes
  → Payment POSTs settlement callback + X-Internal-Service-Key
  → Parking mark-paid → obligation Paid → session Completed → occupancy updated
```

## Initiate body (example)

```json
{
  "organizationId": "...",
  "sourceSystem": "Parking",
  "payableReferenceId": "<obligation-guid>",
  "correlationId": "<session-guid>",
  "amount": 50.00,
  "currency": "INR",
  "idempotencyKey": "<uuid>",
  "provider": "Mock",
  "description": "Parking session fee",
  "successCallbackUrl": "http://localhost:5212/api/v1/financial-obligations/<obligation-guid>/mark-paid"
}
```

## Service key

Parking `Internal:ServiceKey` defaults to `dev-enforcement-internal-key` so local CashCore callbacks work with the shared Payment `CallbackServiceKey`.

## Rules

- Never mark a session paid from frontend success alone
- Zero-amount exits complete without Payment
- Poll `GET /api/v1/payments/{id}` if needed; authoritative status is Payment + mark-paid
