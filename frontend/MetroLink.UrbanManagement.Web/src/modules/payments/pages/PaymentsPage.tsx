import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
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
import { Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatMoney, isAdmin, listPayments } from '@/api/payments'
import type { PaymentStatus } from '@/api/payments/types'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { PaymentStatusBadge } from '@/modules/payments/components/PaymentStatusBadge'

const statuses: Array<{ value: PaymentStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'RequiresAction', label: 'Requires action' },
  { value: 'Succeeded', label: 'Succeeded' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

export function PaymentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [sourceSystem, setSourceSystem] = useState('')
  const [status, setStatus] = useState<PaymentStatus | ''>('')
  const [search, setSearch] = useState(searchParams.get('ref') ?? '')

  const query = useQuery({
    queryKey: ['payments', sourceSystem, status],
    queryFn: () =>
      listPayments({
        sourceSystem: sourceSystem || undefined,
        status: status || undefined,
      }),
  })

  const filtered = (query.data ?? []).filter((p) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (
      p.id.toLowerCase().includes(q) ||
      p.payableReferenceId.toLowerCase().includes(q) ||
      p.sourceSystem.toLowerCase().includes(q) ||
      (p.providerOrderId ?? '').toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <>
      <PageHeader
        title={isAdmin() ? 'All payments' : 'Payments'}
        description="Inspect payment status across source systems. Admins see every organization."
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <label className="flex-1 space-y-1 text-sm">
          <span className="text-muted-foreground">Search</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Payment id, payable, provider order…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </label>
        <label className="space-y-1 text-sm md:w-44">
          <span className="text-muted-foreground">Status</span>
          <NativeSelect
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus | '')}
          >
            {statuses.map((s) => (
              <option key={s.value || 'all'} value={s.value}>
                {s.label}
              </option>
            ))}
          </NativeSelect>
        </label>
        <label className="space-y-1 text-sm md:w-44">
          <span className="text-muted-foreground">Source system</span>
          <Input
            placeholder="e.g. Enforcement"
            value={sourceSystem}
            onChange={(e) => setSourceSystem(e.target.value)}
          />
        </label>
      </div>

      {query.isError && <ApiAlert message={query.error instanceof Error ? query.error.message : undefined} />}
      {query.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Payable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/app/payments/${p.id}`)}
                  >
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(p.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{p.sourceSystem}</TableCell>
                    <TableCell className="tabular-nums">{formatMoney(p.amount, p.currency)}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>{p.providerCode}</TableCell>
                    <TableCell className="font-mono text-xs">{p.payableReferenceId.slice(0, 8)}…</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
