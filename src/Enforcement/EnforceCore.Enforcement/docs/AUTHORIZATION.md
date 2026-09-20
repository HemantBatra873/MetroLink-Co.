# Authorization

## Model

Permissions are durable business codes registered in **PersonaCore Identity**. Roles and membership scopes are configured there — not hardcoded in Enforcement.

```text
[RequirePermission("Enforcement.Case.Issue")]
  → Resolve user sub + OrganizationId + AreaId
  → Identity AuthorizationEngine / HTTP evaluate
```

## Permission catalog

| Code | Use |
|------|-----|
| Enforcement.Case.View | List/detail/dashboard |
| Enforcement.Case.Create | Create case |
| Enforcement.Case.Update | Add evidence |
| Enforcement.Case.Assign | Assign officer |
| Enforcement.Case.Issue | Issue action / fine |
| Enforcement.Case.Cancel | Cancel |
| Enforcement.Case.Dispute | Dispute |
| Enforcement.Case.Review | Uphold / dismiss dispute |
| Enforcement.Rule.View | Read configuration |
| Enforcement.Rule.Manage | Manage domains/rules |
| Enforcement.Payment.View | View obligations |
| Enforcement.Payment.Initiate | (UI/Payment initiate — enforce at Payment or gateway) |

## Scope

Cases store `OrganizationId` and optional `AreaId`. Authorization evaluates permission **plus** hierarchical area scope exactly as PersonaCore does for Complaints.

## Local development

`Identity:AllowAll=true` (default in Development) uses `DevAllowAllAuthorizationClient`. For real checks:

```json
"Identity": { "AllowAll": false, "UseHttpClient": true, "BaseUrl": "http://localhost:5265/" }
```

Then seed permissions and attach them to roles/memberships (see `scripts/seed-enforcement-permissions.ps1`).
