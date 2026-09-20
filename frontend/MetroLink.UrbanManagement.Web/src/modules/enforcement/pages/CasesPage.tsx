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
import { getConfigurationDomains, listCases } from '@/api/enforcement'
import { useWorkspace } from '@/context/WorkspaceContext'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { CaseStatusBadge } from '@/modules/enforcement/components/StatusBadge'
import type { CaseStatus } from '@/api/enforcement/types'

const statuses: Array<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Issued', label: 'Issued' },
  { value: 'Payable', label: 'Payable' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Disputed', label: 'Disputed' },
  { value: 'UnderReview', label: 'Under review' },
  { value: 'Upheld', label: 'Upheld' },
  { value: 'Cancelled', label: 'Cancelled' },
]

export function CasesPage() {
  const navigate = useNavigate()
  const { areaId } = useWorkspace()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [domainId, setDomainId] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 15

  const domainsQuery = useQuery({
    queryKey: ['configuration-domains'],
    queryFn: getConfigurationDomains,
  })

  const query = useQuery({
    queryKey: ['cases', search, status, domainId, areaId, page],
    queryFn: () =>
      listCases({
        search: search || undefined,
        status: status || undefined,
        domainId: domainId || undefined,
        areaId: areaId || undefined,
        page,
        pageSize,
      }),
  })

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / pageSize)) : 1
  const domainOptions = [
    { value: '', label: 'All domains' },
    ...(domainsQuery.data ?? []).map((d) => ({ value: d.id, label: d.name })),
  ]

  return (
    <>
      <PageHeader
        title="Enforcement cases"
        description="Search, filter, and open cases in the field."
        actions={
          <Button type="button" onClick={() => navigate('/app/enforcement/cases/new')}>
            <Plus className="h-4 w-4" />
            New case
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
              placeholder="Case number or subject…"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>
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
        <label className="space-y-1 text-sm md:w-44">
          <span className="text-muted-foreground">Domain</span>
          <NativeSelect
            value={domainId}
            onChange={(e) => {
              setPage(1)
              setDomainId(e.target.value)
            }}
          >
            {domainOptions.map((d) => (
              <option key={d.value || 'all'} value={d.value}>
                {d.label}
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
                <TableHead>Case</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link to={`/app/enforcement/cases/${row.id}`} className="font-medium text-primary hover:underline">
                      {row.caseNumber}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>{row.subjectLabel ?? '—'}</TableCell>
                  <TableCell>{row.domainCode}</TableCell>
                  <TableCell>
                    <CaseStatusBadge status={row.status as CaseStatus} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.outstandingAmount != null ? `₹${row.outstandingAmount.toLocaleString()}` : '—'}
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
          <Button
            variant="tertiary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}
