# Seed Parking permissions into PersonaCore Identity
# Prerequisites: Identity API running at http://localhost:5265

param(
    [string]$IdentityBaseUrl = "http://localhost:5265/api/v1"
)

$permissions = @(
    @{ Code = "Parking.Facility.View"; Name = "View parking facilities" },
    @{ Code = "Parking.Facility.Create"; Name = "Create parking facilities" },
    @{ Code = "Parking.Facility.Update"; Name = "Update parking facilities" },
    @{ Code = "Parking.Facility.Submit"; Name = "Submit parking facilities for review" },
    @{ Code = "Parking.Facility.Verify"; Name = "Verify and approve parking facilities" },
    @{ Code = "Parking.Facility.Activate"; Name = "Activate parking facilities" },
    @{ Code = "Parking.Facility.Suspend"; Name = "Suspend parking facilities" },
    @{ Code = "Parking.Zone.View"; Name = "View parking zones" },
    @{ Code = "Parking.Zone.Manage"; Name = "Manage parking zones" },
    @{ Code = "Parking.Space.View"; Name = "View parking spaces" },
    @{ Code = "Parking.Space.Manage"; Name = "Manage parking spaces" },
    @{ Code = "Parking.Session.View"; Name = "View parking sessions" },
    @{ Code = "Parking.Session.Create"; Name = "Create parking sessions (entry)" },
    @{ Code = "Parking.Session.Close"; Name = "Close parking sessions (exit)" },
    @{ Code = "Parking.Ticket.View"; Name = "View parking tickets" },
    @{ Code = "Parking.Ticket.Issue"; Name = "Issue parking tickets" },
    @{ Code = "Parking.Ticket.Cancel"; Name = "Cancel parking tickets" },
    @{ Code = "Parking.Occupancy.View"; Name = "View occupancy" },
    @{ Code = "Parking.Occupancy.Update"; Name = "Update occupancy manually" },
    @{ Code = "Parking.Pricing.View"; Name = "View parking pricing" },
    @{ Code = "Parking.Pricing.Manage"; Name = "Manage parking pricing" },
    @{ Code = "Parking.Subscription.View"; Name = "View parking subscriptions" },
    @{ Code = "Parking.Subscription.Manage"; Name = "Manage parking subscriptions" },
    @{ Code = "Parking.Report.View"; Name = "View parking reports and dashboard" },
    @{ Code = "Parking.Operator.Manage"; Name = "Manage parking operator settings" }
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
