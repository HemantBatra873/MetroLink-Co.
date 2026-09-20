import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Button,
  Input,
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
import { Plus, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { listFacilities } from '@/api/parking'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { FacilityStatusBadge } from '@/modules/parking/components/StatusBadge'
import type { FacilityStatus } from '@/api/parking/types'

const statuses: Array<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'UnderReview', label: 'Under review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Rejected', label: 'Rejected' },
]

export function FacilitiesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 15

  const query = useQuery({
    queryKey: ['facilities', status, page],
    queryFn: () =>
      listFacilities({
        status: status || undefined,
        page,
        pageSize,
      }),
  })

  const filtered =
    query.data?.items.filter((f) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)
    }) ?? []

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / pageSize)) : 1

  return (
    <>
      <PageHeader
        title="Parking facilities"
        description="Manage facility lifecycle, capacity, and verification."
        actions={
          <Button type="button" onClick={() => navigate('/app/parking/facilities/new')}>
            <Plus className="h-4 w-4" />
            New facility
          </Button>
        }
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <label className="flex-1 space-y-1 text-sm">
          <span className="text-muted-foreground">Search</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </label>
        <label className="space-y-1 text-sm md:w-48">
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
                <TableHead>Facility</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link to={`/app/parking/facilities/${row.id}`} className="font-medium text-primary hover:underline">
                      {row.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{row.code}</p>
                  </TableCell>
                  <TableCell>{row.facilityType}</TableCell>
                  <TableCell>
                    <FacilityStatusBadge status={row.status as FacilityStatus} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.totalCapacity}</TableCell>
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
    </>
  )
}
