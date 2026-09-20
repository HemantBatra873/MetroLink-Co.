# Domain model

## Aggregate: Enforcement Case

```text
EnforcementCase
├── CaseNumber, Status, OrganizationId, AreaId
├── EnforcementDomain (config)
├── CaseSubject (type code + external id + display label)
├── CaseViolation(s) → ViolationType + offence tier applied
├── EvidenceItem(s)
├── EnforcementAction(s) → ActionType (+ optional FinancialObligation)
├── FinancialObligation(s)  // money owed — not “the fine object” alone
└── CaseAuditEvent(s)
```

## Configuration (per organization)

- **EnforcementDomain** — e.g. PARKING, MARKET
- **SubjectTypeDefinition** — VEHICLE, VENDOR, …
- **ViolationType** — NO_PARKING, NO_LICENSE, …
- **ActionTypeDefinition** — WARNING / FINE / TOW / SUSPENSION with `OutcomeKind`
- **PenaltyRule** — offence number → amount + currency + effective dates (+ optional AreaId)

## Lifecycle (code invariants)

`Draft → Issued → Payable|Disputed|Cancelled → … → Paid|Cancelled`

See `CaseLifecycle` in the API. Illegal transitions throw.

## Financial boundary

```text
Action (Fine) → FinancialObligation → Payment (Payment Service) → Provider
```

Obligation status: Outstanding → PartiallyPaid → Paid (or Waived/Cancelled).
