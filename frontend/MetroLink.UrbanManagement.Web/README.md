# MetroLink Urban Management Web App

Unified **Vite + React 19 + TypeScript** web application for the Urban Management Platform.

One login → one application → Parking, Enforcement, Payments, Profile, and Administration modules — all using **Niva** (`@enterprise/component-library`).

## Architecture

```text
                         Urban Management Platform
                                  │
                    MetroLink Urban Management Web (:5170)
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
     Persona (:5265)        ParkCore (:5212)     EnforceCore (:5208)
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
                         CashCore (:5210)
                                  │
                              Niva Design
```

Service repositories are **backend-only**. This app is the sole user-facing web client.

## Quick start

```bash
# 1. Build Niva (once)
cd "../NivaCore Design System"
pnpm install && pnpm build

# 2. Start backend APIs (as needed)
# Identity :5265 · Parking :5212 · Enforcement :5208 · Payment :5210

# 3. Run this app
cd "../MetroLink Co. Urban Management Web App"
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5170/login**, set a demo session, then continue to `/app`.

## Routes

| Path | Purpose |
|------|---------|
| `/login` | Dev identity (sessionStorage + test headers) |
| `/app` | Workspace home (live API stats by permission) |
| `/app/parking/*` | Facilities, sessions, occupancy, pricing, find parking |
| `/app/enforcement/*` | Cases, create, workflow, configuration |
| `/app/payments/*` | Transactions & payment detail |
| `/app/profile` | Account / session / permissions |
| `/app/administration/*` | Users, orgs, roles, memberships, areas |

## Authorization UX

Navigation and actions are driven by **permission codes** (e.g. `Parking.Facility.View`, `Enforcement.Case.Assign`), not hard-coded role name checks. The backend remains the authoritative authorization boundary.

Dev sessions use `X-Test-User-Sub` / `X-Test-User-Roles`. Production path: Keycloak JWT via Persona.

## Organization & area context

The shell context bar shows the active organization (from the session) and an optional **operational area** filter (from Persona areas). Enforcement case lists respect the selected area when the API supports `areaId`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite on port **5170** |
| `npm run build` | Typecheck + production build |
| `npm test` | Vitest (permissions, navigation, session) |
| `npm run preview` | Preview production build |

## Source layout

```text
src/
  api/           # persona | parking | enforcement | payments clients
  auth/          # session, permissions, AuthContext
  context/       # organization / area workspace
  shell/         # AppLayout, navigation, ContextBar
  modules/       # workspace, parking, enforcement, payments, identity
  shared/        # ApiAlert, Timeline, ModuleSubNav
```

## Related services

| Folder | Role |
|--------|------|
| `PersonaCore Identity Management` | Identity API + Keycloak |
| `ParkCore Parking Management` | Parking API |
| `EnforceCore Enforcement System` | Enforcement API |
| `CashCore Payment System` | Payment API |
| `NivaCore Design System` | Shared design system |
