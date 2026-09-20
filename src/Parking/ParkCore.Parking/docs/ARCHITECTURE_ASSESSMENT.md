# Parking Management — Architecture Assessment (Pre-Implementation)

Produced after inspecting sibling projects under `Bill/`. No existing ParkCore code was present.

---

## A. Repository assessment

| Folder | Role | Maturity |
|--------|------|----------|
| PersonaCore Identity Management | Keycloak authN + org/role/area authZ | Working (Identity API + IdentityUI) |
| EnforceCore Enforcement System | Generic enforcement cases / fines | Working (API + Niva UI) |
| CashCore Payment System | Payment orchestration + settlement callbacks | Working Mock; Razorpay/Stripe stubs |
| NivaCore Design System | `@enterprise/component-library` + tokens | Working (pnpm monorepo) |
| ParkCore Parking Management | Parking domain | **Empty — greenfield** |

There is **no unified Urban Platform shell** yet. Each domain ships its own Vite UI. Parking will follow EnforcementUI/PaymentUI as a **module-branded** console (`Urban Platform` / `Parking`), not a separate product named ParkCore.

---

## B. Existing services discovered

| Service | Port | DB Port | Stack |
|---------|------|---------|-------|
| Identity API | 5265 | 5432 | .NET 10, EF Core 10, Postgres |
| Enforcement API | 5208 | 5433 | .NET 10, single-project, folder layers |
| Payment API | 5210 | 5434 | .NET 10, single-project |
| Parking API (planned) | **5212** | **5435** | Mirror Enforcement |

**Convention (not multi-project Clean Architecture):** Single `*.Api` project with `Domain/`, `Services/`, `Infrastructure/`, `Controllers/`, `Authorization/`. No MediatR/CQRS. `EnsureCreated` in Dev (no migrations folders today in siblings). Parking will add **EF migrations** as requested for MVP.

---

## C. Existing Identity integration

- JWT from Keycloak realm `platform-identity-realm`, audience `business-api-client` (audience validation currently off).
- Local `User` linked by `KeycloakUserId` (`sub`).
- Authorization via `POST /api/v1/authorization/evaluate` with `(KeycloakUserId, OrganizationId, PermissionCode, ResourceAreaId?)`.
- Permission codes: `{Domain}.{Resource}.{Action}` e.g. `Enforcement.Case.View`.
- Scope: org membership + hierarchical Area (null scope = org-wide).
- Dev: `Identity:AllowAll` + `X-Test-User-Sub` header (Enforcement pattern).

**Parking will:** HTTP Identity client + `[RequirePermission]` filter (same as Enforcement). No shared IdentityDbContext.

---

## D. Existing Enforcement integration

- Domain-agnostic case engine. Parking is configuration (`PARKING` domain), not a fork.
- Create: `POST /api/v1/enforcement-cases` with vehicle subject + `areaId` + metadata (facility/session IDs).
- Enforcement owns Case, Violation, Evidence, Action, Fine obligation lifecycle.
- Payment settlement: CashCore → Enforcement `mark-paid`.

**Parking will:** HTTP client to create cases; store `EnforcementCaseId` references only. No `ParkingFine` entity.

---

## E. Existing Payment integration

- Payment does **not** own obligations. Caller owns payable; Payment stores `SourceSystem` + `PayableReferenceId`.
- Initiate: `POST /api/v1/payments/initiate` with `sourceSystem`, amount, `successCallbackUrl`, idempotency key.
- Settlement: Payment POSTs callback + `X-Internal-Service-Key`.
- Mock complete for local: `POST .../complete-mock`.

**Parking will:** Own parking `FinancialObligation` (session/subscription fees) + `mark-paid` callback. `sourceSystem: "Parking"`.

---

## F. Existing Niva / design-system integration

- Consume via `file:` deps: `@enterprise/component-library`, `@enterprise/design-tokens`.
- Patterns: `AppShell`, `PageHeader`, `Button`, `Table`, `Card`, `Dialog`, `Tabs`, `StatusBadge`, `Spinner`, `Alert`.
- EnforcementUI is the reference consumer (React 19, Vite 6, TanStack Query, react-router-dom 7).

**Parking will:** ParkingUI mirroring EnforcementUI. Brand title **Urban Platform**, sidebar **Parking**. No second component library.

---

## G. Proposed Parking service structure

```
ParkCore Parking Management/
├── docs/
├── scripts/
├── docker-compose.yml
├── README.md
├── ParkingService/
│   ├── ParkingPlatform.slnx
│   ├── src/Parking.Api/          # single deployable (EnforceCore convention)
│   │   ├── Domain/{Facilities,Zones,Spaces,Sessions,Tickets,Pricing,Subscriptions,Occupancy,Obligations,Audit}
│   │   ├── Services/
│   │   ├── Controllers/
│   │   ├── Authorization/
│   │   ├── Integrations/         # Payment + Enforcement HTTP clients
│   │   ├── Infrastructure/Data/
│   │   └── DTOs/
│   └── tests/Parking.Tests/
└── ParkingUI/                    # Vite React module
```

Not creating separate deployable microservices per feature.

---

## H. Parking domain model (MVP)

| Aggregate | Purpose |
|-----------|---------|
| `ParkingFacility` | Facility master + lifecycle (Draft→…→Active/Suspended/Closed) |
| `ParkingZone` | Optional zones within facility |
| `ParkingSpace` | Optional individual spaces (CAPACITY mode primary for MVP) |
| `OccupancySnapshot` | Capacity/occupied/available + source + timestamp |
| `ParkingSession` | Entry→Active→PaymentPending→Completed |
| `ParkingTicket` | User-facing ticket document for a session |
| `ParkingProduct` | Hourly/Daily/Monthly (MVP subset) |
| `ParkingRate` | Configured pricing (not hard-coded) |
| `ParkingSubscription` | Recurring products |
| `FinancialObligation` | Parking-owned payable for session/subscription fees |
| `ParkingAuditEvent` | Facility/session/pricing audit trail |

Vehicle: lightweight fields on session (`VehiclePlate`, optional `VehicleExternalId`) — no Vehicle microservice.

---

## I. Entity relationships

```
OrganizationId / AreaId (external Identity refs)
        │
ParkingFacility ──┬── ParkingZone ── ParkingSpace (optional)
                  ├── OccupancySnapshot
                  ├── ParkingRate (via product + facility)
                  ├── ParkingSubscription
                  └── ParkingSession ── ParkingTicket
                                      └── FinancialObligationId (ref)
```

Owner vs Operator: `OwnerOrganizationId` + `OperatorOrganizationId` (both Guid refs). Governing area: `AreaId`.

---

## J. Database schema

- Own Postgres DB `parking_db` (port **5435**).
- Snake_case tables via EF fluent config.
- No FKs to Identity/Enforcement/Payment DBs.
- EF Core migrations under `Infrastructure/Data/Migrations`.
- Dev fallback: InMemory / EnsureCreated when Testing.

---

## K. API surface (aligned with `/api/v1`)

Private (authz):

- Facilities CRUD + submit/review/approve/reject/activate/suspend
- Zones, occupancy, sessions (entry/exit), tickets, pricing, subscriptions
- Dashboard stats
- `POST /api/v1/financial-obligations/{id}/mark-paid` (internal key)
- `POST /api/v1/sessions/{id}/report-violation` → Enforcement

Public:

- `GET /api/v1/public/parking` + `/{id}` — discovery only (no owner/revenue/staff)

---

## L. Permission catalog

```
Parking.Facility.View|Create|Update|Submit|Verify|Activate|Suspend
Parking.Zone.View|Manage
Parking.Space.View|Manage
Parking.Session.View|Create|Close
Parking.Ticket.View|Issue|Cancel
Parking.Occupancy.View|Update
Parking.Pricing.View|Manage
Parking.Subscription.View|Manage
Parking.Report.View
Parking.Operator.Manage
```

Seeded via `scripts/seed-parking-permissions.ps1` → Identity `POST /api/v1/permissions`.

---

## M. Authorization / scope behavior

- `[RequirePermission]` + Identity evaluate with `OrganizationId` + facility `AreaId`.
- Operator sees facilities where `OperatorOrganizationId` or `OwnerOrganizationId` matches request org (application filter after authz).
- Backend is authoritative; UI only hides navigation.

---

## N. Parking → Payment

1. Exit calculates amount via `ParkingRate`.
2. Create parking `FinancialObligation` (Outstanding).
3. Client/API initiates CashCore payment (`sourceSystem: "Parking"`, `payableReferenceId: obligationId`, `correlationId: sessionId`).
4. CashCore settles → Parking `mark-paid`.
5. On Paid → complete session exit + decrement occupancy.

Never trust frontend payment success alone.

---

## O. Parking → Enforcement

1. Ensure PARKING domain configured in Enforcement (docs/script).
2. `IEnforcementClient.CreateCaseAsync` with subject plate, metadata `{ facilityId, sessionId }`, `areaId`.
3. Store returned `EnforcementCaseId` on session/audit only.

Enforcement remains usable without Parking.

---

## P. Frontend route / module structure

```
ParkingUI/src/
  App.tsx                 # AppShell: Urban Platform / Parking
  api.ts, types.ts
  pages/
    DashboardPage
    FacilitiesPage, FacilityDetailPage, FacilityCreatePage, FacilityVerifyPage
    SessionsPage, SessionDetailPage
    OccupancyPage
    PricingPage
    SubscriptionsPage
    PublicDiscoveryPage
```

Port **5176**.

---

## Q. Actor-specific UI behavior

Permission-driven nav (same shell):

| Actor | Emphasis |
|-------|----------|
| Platform / Gov admin | Facilities list, verification queue, reports |
| Owner | Facilities, pricing, subscriptions, revenue (if permitted) |
| Operator | Occupancy, entry/exit, active sessions |
| Attendant | Entry, Exit, Find session, Occupancy |
| Citizen | Public discovery, session/pay (limited) |

No separate apps per role.

---

## R. Implementation plan

1. Domain + lifecycles + DbContext + migrations
2. Authz filter + permissions seed
3. Facility APIs + verification lifecycle
4. Zones + occupancy
5. Sessions + tickets + pricing calculator
6. Payment obligation + mark-paid
7. Enforcement client
8. Subscriptions (basic)
9. Audit events
10. ParkingUI (Niva)
11. Tests (lifecycle, pricing, authz boundaries, exit/payment)
12. README + integration docs

---

## What must NOT change

- Identity, Enforcement, Payment, Niva internals
- Permission evaluation model
- Payment initiate/settlement contract
- Separate DBs per service

## Assumptions requiring confirmation

1. **Separate ParkingUI** (like EnforcementUI) until a unified shell exists — branded as Urban Platform module.
2. **OwnerOrganizationId ≠ OperatorOrganizationId** both stored; request `organizationId` used for Identity scope (typically operator or owner org membership).
3. **CAPACITY occupancy mode** primary for MVP; individual spaces optional.
4. **Monthly subscription** included at basic level.
5. Sibling services use `EnsureCreated`; Parking adds **migrations** and still supports Dev EnsureCreated for parity.

## Compatibility issues

- No shared Urban shell → deep-linking between Parking ↔ Enforcement UIs is URL-based for now.
- Payment org isolation is weak (existing) — Parking still scopes its own APIs by org/area.
- Identity management APIs lack `[Authorize]` today (existing gap) — Parking will not “fix” this.
