# Local development

## Prerequisites

- .NET 10 SDK
- Node 22+ / npm
- Docker (Postgres for Enforcement/Payment; PersonaCore compose for Keycloak + Identity DB)

## Ports

| Service | Port |
|---------|------|
| Keycloak | 8080 |
| Identity API | 5265 |
| Identity Postgres | 5432 |
| Enforcement API | 5208 |
| Enforcement Postgres | 5433 |
| Payment API (CashCore) | 5210 |
| Payment Postgres | 5434 |
| Enforcement UI | 5174 |
| Payment UI (CashCore) | 5175 |

## Databases

```bash
docker compose up -d
```

APIs fall back to **EF InMemory** when connection strings are empty or `UseInMemoryDatabase=true` / `ASPNETCORE_ENVIRONMENT=Testing`.

## Settlement callback key

- CashCore `Payment:CallbackServiceKey`
- Enforcement `Internal:ServiceKey`

Use the same value locally (`dev-enforcement-internal-key`). Override in non-dev environments.

## Configuration data

Enforcement **does not** seed domains on startup. Create domains, subject types, violation types, and penalty rules via the Configuration API or Configuration UI page.

Integration tests use a test-only fixture (`TestConfigSeed`) that is not part of the running service.
