# Parking → Enforcement integration

Parking does **not** implement fines. EnforceCore owns cases, violations, evidence, and fine obligations.

## Flow

```
Parking detects / operator reports violation
  → POST Enforcement /api/v1/enforcement-cases
  → Store returned case Id on ParkingSession.EnforcementCaseId (reference only)
```

## Configuration (one-time per org)

Follow EnforceCore `docs/ADDING_A_DOMAIN.md`:

1. Domain `PARKING`
2. Subject type `VEHICLE` (`externalSystemHint`: ParkCore / VehicleService)
3. Violation types (e.g. `NO_PARKING`, `WRONG_ZONE`)
4. Financial action type + penalty rules
5. Set Parking appsettings:

```json
"Enforcement": {
  "BaseUrl": "http://localhost:5208/",
  "Enabled": true,
  "ParkingDomainId": "<guid>",
  "DefaultViolationTypeId": "<guid>"
}
```

When `Enabled` is `false` (default), Parking uses a stub client that returns a new Guid (local/dev without Enforcement).

## Create case payload (conceptual)

- `organizationId`, `enforcementDomainId`, `areaId` (facility area)
- Subject: plate as display label, optional session/vehicle external id
- `subjectMetadataJson`: `{ "parkingFacilityId", "parkingSessionId" }`
- `violationTypeId`, location fields

Enforcement remains fully usable without Parking.
