# Seed Enforcement permissions into PersonaCore Identity
# Prerequisites: Identity API running at http://localhost:5265

param(
    [string]$IdentityBaseUrl = "http://localhost:5265/api/v1"
)

$permissions = @(
    @{ Code = "Enforcement.Case.View"; Name = "View enforcement cases" },
    @{ Code = "Enforcement.Case.Create"; Name = "Create enforcement cases" },
    @{ Code = "Enforcement.Case.Update"; Name = "Update enforcement cases" },
    @{ Code = "Enforcement.Case.Assign"; Name = "Assign enforcement cases" },
    @{ Code = "Enforcement.Case.Issue"; Name = "Issue enforcement actions" },
    @{ Code = "Enforcement.Case.Cancel"; Name = "Cancel enforcement cases" },
    @{ Code = "Enforcement.Case.Dispute"; Name = "Dispute enforcement cases" },
    @{ Code = "Enforcement.Case.Review"; Name = "Review disputed cases" },
    @{ Code = "Enforcement.Rule.View"; Name = "View enforcement rules" },
    @{ Code = "Enforcement.Rule.Manage"; Name = "Manage enforcement rules" },
    @{ Code = "Enforcement.Payment.View"; Name = "View enforcement payments" },
    @{ Code = "Enforcement.Payment.Initiate"; Name = "Initiate enforcement payments" }
)

foreach ($p in $permissions) {
    try {
        $body = @{ Code = $p.Code; Name = $p.Name; Description = $p.Name } | ConvertTo-Json
        Invoke-RestMethod -Method Post -Uri "$IdentityBaseUrl/permissions" -ContentType "application/json" -Body $body | Out-Null
        Write-Host "Created $($p.Code)"
    }
    catch {
        Write-Host "Skip/fail $($p.Code): $($_.Exception.Message)"
    }
}

Write-Host "Done. Attach these permissions to roles via Identity UI or POST /roles/{id}/permissions."
