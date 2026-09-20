# Adding a new enforcement domain

No engine code changes required for a typical domain.

## 1. Create domain

`POST /api/v1/configuration/domains`

```json
{ "organizationId": "...", "code": "CONSTRUCTION", "name": "Construction Enforcement" }
```

## 2. Subject types

`POST /api/v1/configuration/subject-types`

```json
{ "enforcementDomainId": "...", "code": "PROPERTY", "name": "Property", "externalSystemHint": "PropertyService" }
```

## 3. Violations

`POST /api/v1/configuration/violation-types`

```json
{ "enforcementDomainId": "...", "code": "NO_PERMIT", "name": "No Permit" }
```

## 4. Actions

`POST /api/v1/configuration/action-types`

```json
{ "enforcementDomainId": "...", "code": "STOP_WORK", "name": "Stop Work", "outcomeKind": "Restrictive" }
```

`outcomeKind`: `Informational` | `Financial` | `Restrictive`

## 5. Penalties

`POST /api/v1/configuration/penalty-rules`

```json
{
  "violationTypeId": "...",
  "offenceNumber": 1,
  "amount": 5000,
  "currency": "INR",
  "effectiveFrom": "2026-01-01T00:00:00Z"
}
```

## 6. Permissions

Add any new capability codes to Identity (see `scripts/seed-enforcement-permissions.ps1` pattern), assign to roles, scope memberships by Area.

## 7. UI

Create Case wizard loads domains dynamically — new domains appear automatically once configured.
