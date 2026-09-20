<#
.SYNOPSIS
  MetroLink Co. local development bootstrap.

.DESCRIPTION
  Starts Docker infrastructure (PostgreSQL + Keycloak), verifies the four
  logical databases exist, applies EF Core migrations, and prints startup
  guidance for Visual Studio / frontend.

.EXAMPLE
  .\scripts\start-local.ps1
  .\scripts\start-local.ps1 -SkipMigrations
  .\scripts\start-local.ps1 -ApplyMigrationsOnly
#>
[CmdletBinding()]
param(
  [switch]$SkipMigrations,
  [switch]$ApplyMigrationsOnly,
  [switch]$SkipDocker
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "  OK: $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  WARN: $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "  FAIL: $msg" -ForegroundColor Red }

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

Write-Host "MetroLink Co. — local startup" -ForegroundColor White
Write-Host "Root: $Root"

# --- Prerequisites ---
Write-Step "Checking prerequisites"
$missing = @()
if (-not (Test-Command 'docker')) { $missing += 'docker' }
if (-not (Test-Command 'dotnet')) { $missing += 'dotnet' }
if ($missing.Count -gt 0) {
  Write-Fail ("Missing required tools: " + ($missing -join ', '))
  exit 1
}
Write-Ok "docker + dotnet found"
$dotnetVersion = (dotnet --version)
Write-Ok "dotnet $dotnetVersion"

if (-not $ApplyMigrationsOnly) {
  if (-not $SkipDocker) {
    Write-Step "Starting Docker infrastructure"
    $composeFile = Join-Path $Root 'infrastructure\docker-compose.yml'
    if (-not (Test-Path $composeFile)) {
      Write-Fail "Missing $composeFile"
      exit 1
    }

    $envExample = Join-Path $Root 'infrastructure\.env.example'
    $envFile = Join-Path $Root 'infrastructure\.env'
    if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
      Copy-Item $envExample $envFile
      Write-Ok "Created infrastructure\.env from .env.example"
    }

    Push-Location (Join-Path $Root 'infrastructure')
    try {
      docker compose up -d
      if ($LASTEXITCODE -ne 0) { throw "docker compose up failed with exit $LASTEXITCODE" }
      Write-Ok "docker compose up -d"
    }
    finally {
      Pop-Location
    }

    Write-Step "Waiting for PostgreSQL"
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
      docker exec metrolink-postgres pg_isready -U metrolink -d postgres 2>$null | Out-Null
      if ($LASTEXITCODE -eq 0) { $ready = $true; break }
      Start-Sleep -Seconds 2
    }
    if (-not $ready) {
      Write-Fail "PostgreSQL did not become ready"
      exit 1
    }
    Write-Ok "PostgreSQL is ready on localhost:15432"
  }
}

# --- Ensure logical databases (idempotent for existing volumes) ---
Write-Step "Ensuring logical databases exist"
# Local Docker uses the shared POSTGRES_USER (metrolink). Service ownership
# is enforced by separate logical databases, not separate host users.
$dbChecks = @(
  @{ Name = 'identity_db' },
  @{ Name = 'enforcement_db' },
  @{ Name = 'parking_db' },
  @{ Name = 'payment_db' }
)

$ensureSql = @'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '{0}') THEN
    PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE {0}');
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
'@

# Prefer simple CREATE DATABASE IF pattern via shell inside container
foreach ($db in $dbChecks) {
  $name = $db.Name
  $exists = docker exec metrolink-postgres psql -U metrolink -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$name'"
  if ($exists.Trim() -ne '1') {
    Write-Warn "Creating database $name (volume may predate init script)"
    docker exec metrolink-postgres psql -U metrolink -d postgres -c "CREATE DATABASE $name;"
  }
  else {
    Write-Ok "$name exists"
  }
}

# --- EF Core migrations ---
if (-not $SkipMigrations) {
  Write-Step "Applying EF Core migrations"
  $migrations = @(
    @{
      Name = 'Identity'
      Project = 'src\Identity\PersonaCore.Identity\src\IdentityPlatform.Service\IdentityPlatform.Service.csproj'
      Context = 'IdentityDbContext'
    },
    @{
      Name = 'Enforcement'
      Project = 'src\Enforcement\EnforceCore.Enforcement\src\Enforcement.Api\Enforcement.Api.csproj'
      Context = 'EnforcementDbContext'
    },
    @{
      Name = 'Parking'
      Project = 'src\Parking\ParkCore.Parking\src\Parking.Api\Parking.Api.csproj'
      Context = 'ParkingDbContext'
    },
    @{
      Name = 'Payment'
      Project = 'src\Payment\CashCore.Payment\src\Payment.Api\Payment.Api.csproj'
      Context = 'PaymentDbContext'
    }
  )

  foreach ($m in $migrations) {
    Write-Host "  Migrating $($m.Name)..."
    dotnet ef database update --project $m.Project --context $m.Context
    if ($LASTEXITCODE -ne 0) {
      Write-Fail "Migration failed for $($m.Name)"
      exit 1
    }
    Write-Ok "$($m.Name) migrated"
  }
}

# --- Summary ---
Write-Step "Local endpoints"
Write-Host @"

  Infrastructure
    PostgreSQL     localhost:15432
                   identity_db | enforcement_db | parking_db | payment_db
                   (host port 15432 → container 5432; avoids local Windows PostgreSQL on 5432)
    Keycloak       http://localhost:8080  (admin / admin)

  Backend APIs (launch via Visual Studio F5 — use 'Platform APIs' startup profile)
    Identity       http://localhost:5265
    Enforcement    http://localhost:5208
    Parking        http://localhost:5212
    Payment        http://localhost:5210

  Frontend
    cd frontend\MetroLink.UrbanManagement.Web
    npm install
    npm run dev
    http://localhost:5170

  Design system (build before frontend if packages changed)
    cd design-system\NivaCore.DesignSystem
    pnpm install
    pnpm build

  Solution
    UrbanManagementPlatform.sln

"@

Write-Ok "Infrastructure ready. Open UrbanManagementPlatform.sln and start the Platform APIs profile."
