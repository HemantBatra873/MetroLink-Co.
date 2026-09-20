import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@enterprise/component-library'
import { Building2, Car, CreditCard, ClipboardList, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDashboard, listFacilities } from '@/api/parking'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { FacilityStatusBadge } from '@/modules/parking/components/StatusBadge'
import { Timeline } from '@/shared/components/Timeline'
import type { FacilityStatus } from '@/api/parking/types'

export function DashboardPage() {
  const query = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })

  const verificationQuery = useQuery({
    queryKey: ['facilities', 'verification'],
    queryFn: async () => {
      const [submitted, underReview] = await Promise.all([
        listFacilities({ status: 'Submitted', page: 1, pageSize: 10 }),
        listFacilities({ status: 'UnderReview', page: 1, pageSize: 10 }),
      ])
      return [...submitted.items, ...underReview.items]
    },
  })

  const stats = [
    { label: 'Facilities', value: query.data?.totalFacilities, icon: Building2 },
    { label: 'Active facilities', value: query.data?.activeFacilities, icon: Building2 },
    { label: 'Total capacity', value: query.data?.totalCapacity, icon: Layers },
    { label: 'Occupied', value: query.data?.occupied, icon: Car },
    { label: 'Available', value: query.data?.available, icon: Layers },
    { label: "Today's entries", value: query.data?.todayEntries, icon: Car },
    { label: "Today's exits", value: query.data?.todayExits, icon: Car },
    { label: 'Active sessions', value: query.data?.activeSessions, icon: Car },
    {
      label: 'Outstanding',
      value:
        query.data?.outstandingAmount != null
          ? `₹${query.data.outstandingAmount.toLocaleString()}`
          : undefined,
      icon: CreditCard,
    },
  ]

  return (
    <>
      <PageHeader
        title="Parking dashboard"
        description="Urban Platform parking operations for your organization."
        actions={
          <Link to="/app/parking/facilities/new" className="text-sm font-medium text-primary hover:underline">
            New facility →
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
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

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Verification queue
                </CardTitle>
                <CardDescription>Facilities awaiting review or approval.</CardDescription>
              </CardHeader>
              <CardContent>
                {verificationQuery.isLoading ? (
                  <Spinner />
                ) : verificationQuery.isError ? (
                  <ApiAlert
                    message={
                      verificationQuery.error instanceof Error
                        ? verificationQuery.error.message
                        : undefined
                    }
                  />
                ) : (verificationQuery.data?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">No facilities in verification.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Facility</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationQuery.data!.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>
                            <Link
                              to={`/app/parking/facilities/${f.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {f.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">{f.code}</p>
                          </TableCell>
                          <TableCell>
                            <FacilityStatusBadge status={f.status as FacilityStatus} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Latest parking events across facilities.</CardDescription>
              </CardHeader>
              <CardContent>
                <Timeline
                  entries={(query.data?.recentActivity ?? []).map((a, i) => ({
                    id: `${a.eventType}-${a.occurredAt}-${i}`,
                    title: a.eventType,
                    subtitle: a.facilityId ? `Facility ${a.facilityId.slice(0, 8)}…` : undefined,
                    timestamp: a.occurredAt,
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
