# API

Base: `http://localhost:5208/api/v1`

Business-oriented routes (not table CRUD):

| Method | Path | Permission |
|--------|------|------------|
| GET | `/dashboard?organizationId=` | Enforcement.Case.View |
| GET | `/enforcement-cases?organizationId=&status=&domainId=&areaId=&search=&page=` | Enforcement.Case.View |
| GET | `/enforcement-cases/{id}` | Enforcement.Case.View |
| POST | `/enforcement-cases` | Enforcement.Case.Create |
| POST | `/enforcement-cases/{id}/assign` | Enforcement.Case.Assign |
| POST | `/enforcement-cases/{id}/issue` | Enforcement.Case.Issue |
| POST | `/enforcement-cases/{id}/cancel` | Enforcement.Case.Cancel |
| POST | `/enforcement-cases/{id}/dispute` | Enforcement.Case.Dispute |
| POST | `/enforcement-cases/{id}/review` | Enforcement.Case.Review |
| POST | `/enforcement-cases/{id}/evidence` | Enforcement.Case.Update |
| GET | `/configuration/domains?organizationId=` | Enforcement.Rule.View |
| POST | `/configuration/domains` | Enforcement.Rule.Manage |
| POST | `/configuration/subject-types` | Enforcement.Rule.Manage |
| POST | `/configuration/violation-types` | Enforcement.Rule.Manage |
| POST | `/configuration/action-types` | Enforcement.Rule.Manage |
| POST | `/configuration/penalty-rules` | Enforcement.Rule.Manage |
| GET | `/financial-obligations/{id}` | Enforcement.Payment.View |
| POST | `/financial-obligations/{id}/mark-paid` | Internal service key |

Payment API (`:5210`): `POST /payments/initiate`, `POST /payments/webhooks/{provider}`, `POST /payments/{id}/complete-mock`, `GET /payments/{id}`.

Local demo auth: header `X-Test-User-Sub` (Development/Testing).
