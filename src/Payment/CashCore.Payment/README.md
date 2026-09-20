# CashCore Payment System

Central payment platform. Other products (Enforcement, Parking, …) initiate payments and optionally register a settlement callback — Payment never hard-codes those services.

## Structure

| Path | Purpose |
|------|---------|
| `src/Payment.Api` | .NET 10 payment API (`http://localhost:5210`) |
| `tests/Payment.Tests` | Integration tests |

> **UI:** The former `PaymentUI/` has been migrated into
> `../MetroLink Co. Urban Management Web App` (unified React application).
> Do not recreate a standalone payment frontend.

## Roles

| Role | Capabilities |
|------|----------------|
| `PaymentAdmin` | List/stats across all orgs, initiate |
| `PaymentOperator` | Initiate + view (org-scoped) |
| `PaymentViewer` | View only (org-scoped) |

Local demo auth: headers `X-Test-User-Sub` and `X-Test-User-Roles` (default Admin in Development).

## Quick start

```bash
# API
dotnet run --project src/Payment.Api

# Unified Web UI (build NivaCore packages first if needed)
cd "../NivaCore Design System" && pnpm install && pnpm build
cd "../MetroLink Co. Urban Management Web App"
cp .env.example .env
npm install
npm run dev   # http://localhost:5170 → /app/payments
```

## Initiate contract

Callers send generic references:

- `sourceSystem` — e.g. `Enforcement`, `Parking`
- `payableReferenceId` — obligation / invoice id
- `correlationId` — optional case / order id
- `successCallbackUrl` — optional; Payment POSTs settlement payload on success
