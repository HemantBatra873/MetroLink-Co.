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
import { CheckCircle2, CreditCard, AlertTriangle, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatMoney, getStats, isAdmin } from '@/api/payments'
import { ApiAlert } from '@/shared/components/ApiAlert'

export function DashboardPage() {
  const query = useQuery({ queryKey: ['payment-stats'], queryFn: () => getStats() })

  const stats = [
    { label: 'Total payments', value: query.data?.total, icon: CreditCard },
    { label: 'Succeeded', value: query.data?.succeeded, icon: CheckCircle2 },
    {
      label: 'Open / pending',
      value: (query.data?.pending ?? 0) + (query.data?.requiresAction ?? 0),
      icon: Wallet,
    },
    { label: 'Failed', value: query.data?.failed, icon: AlertTriangle },
  ]

  return (
    <>
      <PageHeader
        title="Payment dashboard"
        description={
          isAdmin()
            ? 'Platform-wide payment status across all source systems.'
            : 'Payment status for your organization.'
        }
        actions={
          <Link to="/app/payments" className="text-sm font-medium text-primary hover:underline">
            View payments →
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
              <CardTitle>Collected</CardTitle>
              <CardDescription>Sum of succeeded payment amounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">
                {formatMoney(query.data?.succeededAmount ?? 0)}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
