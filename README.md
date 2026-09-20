# MetroLink Co. Urban Management Platform

Unified monorepo for **MetroLink Co.** — the urban management platform covering identity, parking, enforcement, and payments.

This is a **monorepo, not a monolith**. Backend services remain independently bounded applications that share one repository, one local infrastructure stack, and one web frontend.

## Architecture

```
MetroLink.UrbanManagement.Web  (React)
        │
        ├── PersonaCore.Identity      → identity_db
        ├── EnforceCore.Enforcement   → enforcement_db
        ├── ParkCore.Parking          → parking_db
        └── CashCore.Payment          → payment_db

Keycloak (authN) ──JWT──▶ all APIs
PostgreSQL (one server, four logical databases)
```

| Service | Responsibility | Port |
|---------|----------------|------|
| **PersonaCore.Identity** | Organizations, memberships, roles, permissions, areas, authorization evaluation | 5265 |
| **EnforceCore.Enforcement** | Enforcement cases, violations, **financial obligations** | 5208 |
| **ParkCore.Parking** | Facilities, zones, sessions, tickets, parking obligations | 5212 |
| **CashCore.Payment** | Payment lifecycle and provider integration | 5210 |
| **Keycloak** | Authentication / identity provider | 8080 |
| **MetroLink Web** | Single shared operator UI | 5170 |

**Financial obligation vs payment:** Enforcement (and Parking where applicable) own the *obligation*. CashCore owns *payment initiation/processing/settlement* and callbacks into the owning service. Do not collapse these boundaries.

Services must not read each other's databases. Cross-service needs use HTTP APIs already present in the codebase.

## Repository structure

```
MetroLinkCo/
├── src/
│   ├── Identity/PersonaCore.Identity/
│   ├── Enforcement/EnforceCore.Enforcement/
│   ├── Parking/ParkCore.Parking/
│   └── Payment/CashCore.Payment/
├── frontend/MetroLink.UrbanManagement.Web/
├── design-system/NivaCore.DesignSystem/
├── infrastructure/          # Docker: PostgreSQL + Keycloak
├── scripts/start-local.ps1
├── UrbanManagementPlatform.sln
└── README.md
```

## Prerequisites

- .NET SDK 10
- Docker Desktop
- Node.js 20+ and npm
- pnpm 9+ (for the design system) — `corepack enable`
- Visual Studio 2022 (recommended for multi-API F5) or `dotnet` CLI

## Database ownership

One PostgreSQL container. Host port **15432** maps to container 5432 (avoids conflict with a local Windows PostgreSQL install commonly bound to 5432). Four logical databases:

| Database | Owner service |
|----------|---------------|
| `identity_db` | PersonaCore.Identity |
| `enforcement_db` | EnforceCore.Enforcement |
| `parking_db` | ParkCore.Parking |
| `payment_db` | CashCore.Payment |

Local connection example: `Host=localhost;Port=15432;Database=identity_db;Username=metrolink;Password=metrolink_dev` (shared Docker superuser for local only; database name enforces ownership). Override via environment variables / user secrets for non-local environments.

If you prefer host port 5432, stop the Windows `postgresql-x64-*` service and change the compose mapping back to `"5432:5432"`.

## EF Core migrations

Each service owns its migrations under its API project (`Infrastructure/Data/Migrations` or equivalent).

```powershell
# Examples
dotnet ef migrations add <Name> --project src\Identity\PersonaCore.Identity\src\IdentityPlatform.Service
dotnet ef database update --project src\Parking\ParkCore.Parking\src\Parking.Api
```

`scripts/start-local.ps1` applies all four migrations after infrastructure is up. In Development, each API also runs `MigrateAsync()` on startup.

## Local startup

### Option A — recommended script

```powershell
.\scripts\start-local.ps1
```

This checks prerequisites, starts Docker infrastructure, ensures the four databases exist, applies EF migrations, and prints URLs.

Then open `UrbanManagementPlatform.sln` in Visual Studio and use the **Platform APIs** multi-startup profile (`UrbanManagementPlatform.slnLaunch`) — or set multiple startup projects manually:

- IdentityPlatform.Service
- Enforcement.Api
- Parking.Api
- Payment.Api

### Option B — manual

```powershell
cd infrastructure
copy .env.example .env   # once
docker compose up -d
cd ..
.\scripts\start-local.ps1 -ApplyMigrationsOnly
# Open solution / F5
```

### Frontend

```powershell
cd design-system\NivaCore.DesignSystem
pnpm install
pnpm build

cd ..\..\frontend\MetroLink.UrbanManagement.Web
copy .env.example .env   # once
npm install
npm run dev
```

Open http://localhost:5170

### Design system

NivaCore is a pnpm workspace (`packages/design-tokens`, `packages/ui`, `apps/playground`). MetroLink consumes it via local `file:` package references. Rebuild Niva after design-system changes before restarting the web app.

Playground: `pnpm dev` in the design-system root (typically http://localhost:5173).

## Keycloak

Realm export: `infrastructure/keycloak/realm-export.json`  
Admin console: http://localhost:8080 (default admin / admin from `.env.example`)  
Realm: `platform-identity-realm`  
Audience used by APIs: `business-api-client`

PersonaCore.Identity holds **application-level** identity/authorization (orgs, roles, permissions, areas). Keycloak provides authentication. Domain services call Identity for authorization evaluation when configured; local Development often uses `Identity:AllowAll`.

## Docker strategy

Docker runs **infrastructure only** (PostgreSQL + Keycloak).

APIs run with Visual Studio / `dotnet run`. The frontend runs with Vite. This keeps debugging simple and avoids containerizing every .NET service during day-to-day development.

## Development workflow

1. `.\scripts\start-local.ps1`
2. F5 Platform APIs in Visual Studio
3. `npm run dev` in the frontend (after Niva build)
4. Change only the service you own; keep HTTP contracts stable
5. Add EF migrations inside the owning service — never a shared migration project

## Tests

```powershell
dotnet test UrbanManagementPlatform.sln
```

Frontend: `npm test` in `frontend/MetroLink.UrbanManagement.Web`  
Design system: `pnpm test` in `design-system/NivaCore.DesignSystem`

## Future ownership (CODEOWNERS-ready layout)

Directory boundaries are intentional for later team ownership:

| Path | Intended owner |
|------|----------------|
| `/src/Identity/**` | Identity |
| `/src/Enforcement/**` | Enforcement |
| `/src/Parking/**` | Parking |
| `/src/Payment/**` | Payment |
| `/frontend/**` | Frontend |
| `/design-system/**` | Design System |
| `/infrastructure/**`, `/scripts/**` | Platform |

Do not add a `CODEOWNERS` file until real GitHub usernames/teams exist.

## Product name

**Product / branding:** MetroLink Co.  
**Technical repo folder:** MetroLinkCo (no spaces in paths)
