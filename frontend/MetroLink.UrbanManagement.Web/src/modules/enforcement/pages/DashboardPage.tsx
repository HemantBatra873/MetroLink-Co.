import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  Spinner,
} from '@enterprise/component-library'
import { FileText, Gavel, CreditCard, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDashboard } from '@/api/enforcement'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { Timeline } from '@/shared/components/Timeline'

export function DashboardPage() {
  const query = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })

  const stats = [
    { label: 'Total cases', value: query.data?.totalCases, icon: FileText },
    { label: 'Open / draft', value: query.data?.openCases, icon: Gavel },
    { label: 'Pending payment', value: query.data?.pendingPayment, icon: CreditCard },
    { label: 'Disputed', value: query.data?.disputed, icon: AlertTriangle },
  ]

  return (
    <>
      <PageHeader
        title="Operations dashboard"
        description="Live enforcement workload for your organization."
        actions={
          <Link to="/app/enforcement/cases/new" className="text-sm font-medium text-primary hover:underline">
            New case →
          </Link>
        }
      />
      {query.isError && <ApiAlert message={query.error instanceof Error ? query.error.message : undefined} />}
      {query.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription>{label}</CardDescription>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-3xl tabular-nums">{value ?? '—'}</CardTitle>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest case events across the fleet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline
                entries={(query.data?.recentActivity ?? []).map((a) => ({
                  id: `${a.caseId}-${a.occurredAt}`,
                  title: `${a.caseNumber} — ${a.eventType}`,
                  timestamp: a.occurredAt,
                }))}
              />
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
