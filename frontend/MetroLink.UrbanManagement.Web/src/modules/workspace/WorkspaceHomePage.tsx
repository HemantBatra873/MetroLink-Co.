import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader, Spinner } from '@enterprise/component-library'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { EnforcementPermissions, ParkingPermissions } from '@/auth/permissions'
import { getDashboard as getEnforcementDashboard } from '@/api/enforcement'
import { getDashboard as getParkingDashboard } from '@/api/parking'
import { getStats as getPaymentStats, isAdmin } from '@/api/payments'
import { ApiAlert } from '@/shared/components/ApiAlert'

export function WorkspaceHomePage() {
  const { can, session, hasAnyPermission } = useAuth()

  const parkingEnabled = can(ParkingPermissions.ReportView) || can(ParkingPermissions.FacilityView)
  const enforcementEnabled = can(EnforcementPermissions.CaseView)
  const paymentsEnabled =
    hasAnyPermission(EnforcementPermissions.PaymentView) || Boolean(session?.paymentRoles.length)

  const parking = useQuery({
    queryKey: ['workspace', 'parking-dashboard'],
    queryFn: getParkingDashboard,
    enabled: parkingEnabled,
  })
  const enforcement = useQuery({
    queryKey: ['workspace', 'enforcement-dashboard'],
    queryFn: getEnforcementDashboard,
    enabled: enforcementEnabled,
  })
  const payments = useQuery({
    queryKey: ['workspace', 'payment-stats'],
    queryFn: () => getPaymentStats(),
    enabled: paymentsEnabled,
  })

  const anyError = parking.isError || enforcement.isError || payments.isError
  const anyLoading =
    (parkingEnabled && parking.isLoading) ||
    (enforcementEnabled && enforcement.isLoading) ||
    (paymentsEnabled && payments.isLoading)

  return (
    <>
      <PageHeader
        title="Workspace"
        description={`Unified operator home · ${session?.displayName ?? 'Guest'}`}
      />
      {anyError && (
        <ApiAlert message="One or more backend services could not be reached. Modules you lack permission for are hidden." />
      )}
      {anyLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {parkingEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>Parking</CardTitle>
                <CardDescription>Live stats from Parking API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {parking.isError ? (
                  <p className="text-destructive">Parking API unavailable</p>
                ) : parking.data ? (
                  <>
                    <p>
                      Active facilities:{' '}
                      <strong>{parking.data.activeFacilities}</strong> / {parking.data.totalFacilities}
                    </p>
                    <p>
                      Active sessions: <strong>{parking.data.activeSessions}</strong>
                    </p>
                    <p>
                      Open obligations: <strong>{parking.data.openObligations}</strong>
                    </p>
                  </>
                ) : null}
                <Link to="/app/parking" className="text-sm font-medium text-primary hover:underline">
                  Open parking →
                </Link>
              </CardContent>
            </Card>
          )}
          {enforcementEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>Enforcement</CardTitle>
                <CardDescription>Live stats from Enforcement API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {enforcement.isError ? (
                  <p className="text-destructive">Enforcement API unavailable</p>
                ) : enforcement.data ? (
                  <>
                    <p>
                      Open cases: <strong>{enforcement.data.openCases}</strong>
                    </p>
                    <p>
                      Pending payment: <strong>{enforcement.data.pendingPayment}</strong>
                    </p>
                    <p>
                      Total cases: <strong>{enforcement.data.totalCases}</strong>
                    </p>
                  </>
                ) : null}
                <Link to="/app/enforcement" className="text-sm font-medium text-primary hover:underline">
                  Open enforcement →
                </Link>
              </CardContent>
            </Card>
          )}
          {paymentsEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>{isAdmin() ? 'Org-wide stats' : 'Organization stats'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {payments.isError ? (
                  <p className="text-destructive">Payment API unavailable</p>
                ) : payments.data ? (
                  <>
                    <p>
                      Succeeded: <strong>{payments.data.succeeded}</strong> (
                      {payments.data.succeededAmount.toLocaleString()} collected)
                    </p>
                    <p>
                      Pending: <strong>{payments.data.pending}</strong>
                    </p>
                    <p>
                      Total payments: <strong>{payments.data.total}</strong>
                    </p>
                  </>
                ) : null}
                <Link to="/app/payments" className="text-sm font-medium text-primary hover:underline">
                  Open payments →
                </Link>
              </CardContent>
            </Card>
          )}
          {!parkingEnabled && !enforcementEnabled && !paymentsEnabled && (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">
                No module permissions in this session. Sign in with a broader permission set via{' '}
                <Link to="/login" className="text-primary hover:underline">
                  /login
                </Link>
                .
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  )
}
