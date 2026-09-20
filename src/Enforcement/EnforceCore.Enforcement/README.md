# EnforceCore — Enforcement Platform

Flexible **Urban Enforcement / Fine Management** platform capability. Fines are one possible outcome of an **Enforcement Case**, not the central object.

Payments are handled by the separate **CashCore Payment System** — Enforcement builds on top of it.

## Repository layout

```text
EnforceCore Enforcement System/
├── EnforcementService/     # .NET 10 Enforcement API + PostgreSQL
├── docker-compose.yml      # Local enforcement_db (5433) + payment_db (5434)
├── docs/                   # Architecture & guides
└── scripts/                # Identity permission seeding helpers
```

> **UI:** The former `EnforcementUI/` has been migrated into
> `../MetroLink Co. Urban Management Web App` (unified React application).
> Do not recreate a standalone enforcement frontend.

## Related platform repos

| Repo | Role |
|------|------|
| `CashCore Payment System` | Central payment API |
| `PersonaCore Identity Management` | Keycloak authN + org/role/permission/area authZ |
| `NivaCore Design System` | `@enterprise/design-tokens` + `@enterprise/component-library` |
| `ParkCore Parking Management` | Parking master data (facilities/zones/sessions) |
| `MetroLink Co. Urban Management Web App` | Unified operator / citizen web UI |

## Quick start

### 1. Identity infra (Keycloak + identity Postgres)

```bash
cd "../PersonaCore Identity Management/IdentityService"
docker compose up -d
dotnet run --project src/IdentityPlatform.Service
```

### 2. Databases

```bash
cd "EnforceCore Enforcement System"
docker compose up -d
```

### 3. APIs

```bash
dotnet run --project EnforcementService/src/Enforcement.Api   # http://localhost:5208
dotnet run --project "../CashCore Payment System/src/Payment.Api"  # http://localhost:5210
```

No seed data is loaded on startup. Create domains via Configuration API / unified Web UI as needed.

Development defaults use **AllowAll authorization** when Identity HTTP is not required. Set `Identity:AllowAll=false` and `Identity:UseHttpClient=true` to call PersonaCore `POST /api/v1/authorization/evaluate`.

### 4. Unified Web UI

```bash
cd "../MetroLink Co. Urban Management Web App"
npm install
cp .env.example .env
npm run dev   # http://localhost:5170 → /app/enforcement
```

### 5. Seed Enforcement permissions into Identity (optional)

```bash
# With Identity API running on :5265
pwsh ./scripts/seed-enforcement-permissions.ps1
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Domain model](docs/DOMAIN.md)
- [API](docs/API.md)
- [Authorization](docs/AUTHORIZATION.md)
- [Payments](docs/PAYMENTS.md)
- [Local development](docs/LOCAL_DEVELOPMENT.md)
- [Adding a new enforcement domain](docs/ADDING_A_DOMAIN.md)

## Tests

```bash
dotnet test EnforcementService/EnforcementPlatform.slnx
dotnet test "../CashCore Payment System/PaymentPlatform.slnx"
```
