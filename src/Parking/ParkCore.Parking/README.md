# Parking Management (Urban Platform module)

Parking is a **business domain** inside the Urban Management Platform — not a standalone product.

Engineering name: ParkCore. Product UX: **Urban Management Web → Parking**.

## Contents

| Path | Purpose |
|------|---------|
| `ParkingService/` | .NET 10 Parking API + tests |
| `docs/` | Architecture assessment & integration notes |
| `scripts/seed-parking-permissions.ps1` | Seeds Identity permission codes |
| `docker-compose.yml` | Postgres `parking_db` on port **5435** |

> **UI:** The former `ParkingUI/` has been migrated into
> `../MetroLink Co. Urban Management Web App` (unified React application).
> Do not recreate a standalone parking frontend.

## Prerequisites

Sibling services under `Bill/`:

| Service | Port |
|---------|------|
| PersonaCore Identity | 5265 (+ Keycloak 8080) |
| EnforceCore Enforcement | 5208 |
| CashCore Payment | 5210 |
| NivaCore Design System | build tokens + UI packages |
| MetroLink Urban Management Web | 5170 |

## Quick start

### 1. Database

```powershell
cd "ParkCore Parking Management"
docker compose up -d
```

### 2. API

```powershell
cd ParkingService
dotnet run --project src/Parking.Api
# http://localhost:5212  Swagger in Development
```

Dev uses `Identity:AllowAll=true` and accepts `X-Test-User-Sub` (same as Enforcement).

### 3. Permissions (when Identity is running)

```powershell
.\scripts\seed-parking-permissions.ps1
```

### 4. Unified Web UI

```powershell
cd "../MetroLink Co. Urban Management Web App"
npm install
cp .env.example .env
npm run dev
# http://localhost:5170 → /app/parking
```

## Local ports

| Component | Port |
|-----------|------|
| Parking API | 5212 |
| Unified Web App | 5170 |
| Parking Postgres | 5435 |

## MVP capabilities

- Facility registration + verification lifecycle (Draft → Active)
- Zones, capacity occupancy, sessions (entry/exit), tickets
- Configured pricing (not hard-coded)
- Parking-owned financial obligations → CashCore Payment settlement
- Enforcement case creation via HTTP (optional; stub when disabled)
- Audit events, org/area-scoped permission checks
- Public discovery API (no internal owner/revenue data)
- EF Core migration `InitialCreate`

## Boundaries (do not break)

- **Identity** owns users, orgs, roles, permissions, areas
- **Enforcement** owns cases, violations, fines
- **Payment** owns payment transactions / providers
- **Parking** owns facilities, sessions, tickets, parking rates, parking obligations

See `docs/ARCHITECTURE_ASSESSMENT.md`, `docs/PAYMENTS.md`, `docs/ENFORCEMENT.md`.

## Tests

```powershell
cd ParkingService
dotnet test ParkingPlatform.slnx
```
