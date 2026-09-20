import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  NativeSelect,
  PageHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@enterprise/component-library'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listFacilities, listSessions } from '@/api/parking'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { RecordEntryDialog } from '@/modules/parking/components/RecordEntryDialog'
import { SessionStatusBadge } from '@/modules/parking/components/StatusBadge'
import type { SessionStatus } from '@/api/parking/types'

const statuses: Array<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'PaymentPending', label: 'Payment pending' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

export function SessionsPage() {
  const [status, setStatus] = useState('Active')
  const [facilityId, setFacilityId] = useState('')
  const [page, setPage] = useState(1)
  const [entryOpen, setEntryOpen] = useState(false)
  const [entryFacilityId, setEntryFacilityId] = useState('')
  const pageSize = 15

  const facilitiesQuery = useQuery({
    queryKey: ['facilities', 'all'],
    queryFn: () => listFacilities({ page: 1, pageSize: 100 }),
  })

  const query = useQuery({
    queryKey: ['sessions', status, facilityId, page],
    queryFn: () =>
      listSessions({
        status: status || undefined,
        facilityId: facilityId || undefined,
        page,
        pageSize,
      }),
  })

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / pageSize)) : 1
  const activeFacilities = (facilitiesQuery.data?.items ?? []).filter((f) => f.status === 'Active')

  return (
    <>
      <PageHeader
        title="Parking sessions"
        description="Active vehicles, exits, and payment pending sessions."
        actions={
          <Button
            type="button"
            disabled={activeFacilities.length === 0}
            onClick={() => {
              setEntryFacilityId(activeFacilities[0]?.id ?? '')
              setEntryOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Record entry
          </Button>
        }
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <label className="space-y-1 text-sm md:w-56">
          <span className="text-muted-foreground">Facility</span>
          <NativeSelect
            value={facilityId}
            onChange={(e) => {
              setPage(1)
              setFacilityId(e.target.value)
            }}
          >
            <option value="">All facilities</option>
            {(facilitiesQuery.data?.items ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </NativeSelect>
        </label>
        <label className="space-y-1 text-sm md:w-44">
          <span className="text-muted-foreground">Status</span>
          <NativeSelect
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value)
            }}
          >
            {statuses.map((s) => (
              <option key={s.value || 'all'} value={s.value}>
                {s.label}
              </option>
            ))}
          </NativeSelect>
        </label>
      </div>
      {query.isError && <ApiAlert message={query.error instanceof Error ? query.error.message : undefined} />}
      <div className="rounded-lg border border-border bg-card">
        {query.isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link to={`/app/parking/sessions/${row.id}`} className="font-medium text-primary hover:underline">
                      {row.vehiclePlate}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <SessionStatusBadge status={row.status as SessionStatus} />
                  </TableCell>
                  <TableCell>{new Date(row.entryTime).toLocaleString()}</TableCell>
                  <TableCell>
                    {row.exitTime ? new Date(row.exitTime).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.calculatedAmount != null ? `₹${row.calculatedAmount}` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {page} of {totalPages}
          {query.data ? ` · ${query.data.total} total` : ''}
        </span>
        <div className="flex gap-2">
          <Button variant="tertiary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="tertiary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      {entryFacilityId && (
        <RecordEntryDialog open={entryOpen} onOpenChange={setEntryOpen} facilityId={entryFacilityId} />
      )}
    </>
  )
}
