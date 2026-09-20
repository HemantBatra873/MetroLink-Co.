# Architecture

## Boundaries

```text
Keycloak  →  Authentication (who are you?)
PersonaCore Identity  →  Authorization (what can you do? + scope)
CashCore Payment  →  Central payment lifecycle + provider adapters
EnforceCore Enforcement  →  Cases, violations, actions, obligations, audit (builds on Payment)
NivaCore Design System  →  UI look & behavior
```

## Services

| Service | Port | Database | Owns |
|---------|------|----------|------|
| Enforcement.Api | 5208 | `enforcement_db` (:5433) | Domains, cases, evidence, actions, financial obligations, audit |
| Payment.Api (CashCore) | 5210 | `payment_db` (:5434) | Payments, provider orders, payment events |
| IdentityPlatform.Service | 5265 | `identity_db` (:5432) | Users, orgs, areas, roles, permissions, memberships |

Enforcement does **not** share Identity’s EF context. It calls `POST /api/v1/authorization/evaluate` (or a Dev AllowAll client locally).

Payment is **source-agnostic**. Callers initiate with `sourceSystem` + `payableReferenceId` and may register a `successCallbackUrl`. On success Payment POSTs a generic settlement payload to that URL (with `Payment:CallbackServiceKey`). Enforcement’s `mark-paid` endpoint is one such callback target — Payment does not hard-code Enforcement.

## Frontend

- `EnforcementUI` — cases and obligations; initiates payments against CashCore
- `PaymentUI` (CashCore) — admin/operator payment list, stats, and detail
- Both consume `@enterprise/component-library` + design tokens

## Extensibility

New municipal domains are **configuration** (domain, subject types, violation types, action types, penalty rules), not `if (domain == "Parking")` branches in the engine.
