# PersonaCore Identity Management

Platform identity and authorization service (Keycloak + management API).

## Contents

| Path | Purpose |
|------|---------|
| `IdentityService/` | .NET Identity API, Complaints sample API, Keycloak realm, tests |

> **UI:** The former `IdentityUI/` has been migrated into
> `../MetroLink Co. Urban Management Web App`
> (`/app/profile` and `/app/administration/*`).
> Do not recreate a standalone identity frontend.

## Quick start

```powershell
cd IdentityService
docker compose up -d
dotnet run --project src/IdentityPlatform.Service
# http://localhost:5265
```

Unified web app: `../MetroLink Co. Urban Management Web App` on port **5170**.
