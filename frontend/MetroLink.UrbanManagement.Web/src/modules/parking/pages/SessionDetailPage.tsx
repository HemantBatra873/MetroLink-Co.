import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  PageHeader,
  Spinner,
} from '@enterprise/component-library'
import { CreditCard } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import {
  completeMockPayment,
  exitSession,
  getFinancialObligation,
  getSession,
  getTicket,
  initiatePayment,
  orgId,
  parkingApi,
  reportSessionViolation,
  cancelSession,
} from '@/api/parking'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { SessionStatusBadge } from '@/modules/parking/components/StatusBadge'
import type { FinancialObligation, SessionStatus } from '@/api/parking/types'

function outstanding(obligation: FinancialObligation) {
  return Math.max(0, obligation.amount - obligation.amountPaid)
}

function isPayable(obligation: FinancialObligation) {
  return (
    (obligation.status === 'Outstanding' || obligation.status === 'PartiallyPaid') &&
    outstanding(obligation) > 0
  )
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const client = useQueryClient()
  const [violationTypeId, setViolationTypeId] = useState('')
  const [actionError, setActionError] = useState('')

  const query = useQuery({
    queryKey: ['session', id],
    queryFn: () => getSession(id!),
    enabled: Boolean(id),
  })

  const obligationQuery = useQuery({
    queryKey: ['obligation', query.data?.financialObligationId],
    queryFn: () => getFinancialObligation(query.data!.financialObligationId!),
    enabled: Boolean(query.data?.financialObligationId),
  })

  const ticketQuery = useQuery({
    queryKey: ['ticket', query.data?.ticketId],
    queryFn: () => getTicket(query.data!.ticketId!),
    enabled: Boolean(query.data?.ticketId),
  })

  const exit = useMutation({
    mutationFn: () => exitSession(id!),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['session', id] })
      client.invalidateQueries({ queryKey: ['sessions'] })
      client.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (e) => setActionError(e instanceof Error ? e.message : 'Exit failed'),
  })

  const payment = useMutation({
    mutationFn: async (obligation: FinancialObligation) => {
      const amount = outstanding(obligation)
      const initiated = await initiatePayment({
        organizationId: orgId(),
        sourceSystem: 'Parking',
        payableReferenceId: obligation.id,
        correlationId: id!,
        amount,
        currency: obligation.currency,
        idempotencyKey: crypto.randomUUID(),
        provider: 'Mock',
        description: `Parking obligation ${obligation.id}`,
        successCallbackUrl: `${parkingApi}/financial-obligations/${obligation.id}/mark-paid`,
      })
      await completeMockPayment(initiated.paymentId)
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['session', id] })
      client.invalidateQueries({ queryKey: ['obligation'] })
      client.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (e) => setActionError(e instanceof Error ? e.message : 'Payment failed'),
  })

  const reportViolation = useMutation({
    mutationFn: () =>
      reportSessionViolation(id!, {
        violationTypeId: violationTypeId.trim(),
        notes: 'Reported from Parking UI',
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['session', id] }),
    onError: (e) => setActionError(e instanceof Error ? e.message : 'Report failed'),
  })

  const cancel = useMutation({
    mutationFn: () => cancelSession(id!),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['session', id] })
      client.invalidateQueries({ queryKey: ['sessions'] })
    },
    onError: (e) => setActionError(e instanceof Error ? e.message : 'Cancel failed'),
  })

  const s = query.data
  const obligation = obligationQuery.data

  return (
    <>
      <PageHeader
        title={s?.vehiclePlate ?? 'Session'}
        description={`Session ${id?.slice(0, 8) ?? ''}…`}
        breadcrumbs={[
          { label: 'Sessions', href: '/app/parking/sessions' },
          { label: s?.vehiclePlate ?? '…' },
        ]}
      />
      {query.isError && <ApiAlert message={query.error instanceof Error ? query.error.message : undefined} />}
      {actionError && <ApiAlert message={actionError} />}
      {query.isLoading || !s ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  Session
                  <SessionStatusBadge status={s.status as SessionStatus} />
                </CardTitle>
                <CardDescription>
                  Entry {new Date(s.entryTime).toLocaleString()}
                  {s.exitTime ? ` · Exit ${new Date(s.exitTime).toLocaleString()}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Vehicle</p>
                  <p className="font-medium">{s.vehiclePlate}</p>
                  <p className="text-xs text-muted-foreground">{s.vehicleType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Methods</p>
                  <p>
                    {s.entryMethod}
                    {s.exitMethod ? ` → ${s.exitMethod}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Calculated amount</p>
                  <p className="font-medium tabular-nums">
                    {s.calculatedAmount != null ? `₹${s.calculatedAmount} ${s.currency}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Facility</p>
                  <p className="font-mono text-xs">{s.facilityId}</p>
                </div>
              </CardContent>
            </Card>

            {ticketQuery.data && (
              <Card>
                <CardHeader>
                  <CardTitle>Ticket</CardTitle>
                  <CardDescription>{ticketQuery.data.ticketNumber}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>Status: {ticketQuery.data.status}</p>
                  <p>Issued: {new Date(ticketQuery.data.issuedAt).toLocaleString()}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {(s.status === 'Active' || s.status === 'Created') && (
                  <Button disabled={exit.isPending} onClick={() => exit.mutate()}>
                    Record exit
                  </Button>
                )}
                {obligation && isPayable(obligation) && (
                  <Button
                    variant="secondary"
                    disabled={payment.isPending}
                    onClick={() => payment.mutate(obligation)}
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay (mock)
                  </Button>
                )}
                {(s.status === 'Active' || s.status === 'Created') && (
                  <Button variant="tertiary" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
                    Cancel session
                  </Button>
                )}
              </CardContent>
            </Card>

            {obligation && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>Status: {obligation.status}</p>
                  <p className="tabular-nums">
                    ₹{obligation.amountPaid.toLocaleString()} / ₹{obligation.amount.toLocaleString()}
                  </p>
                  <Link
                    to={`/app/payments?ref=${obligation.id}`}
                    className="inline-flex text-sm font-medium text-primary hover:underline"
                  >
                    View in payments →
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Report violation</CardTitle>
                <CardDescription>Requires enforcement violation type GUID.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label>Violation type ID</Label>
                <Input
                  value={violationTypeId}
                  onChange={(e) => setViolationTypeId(e.target.value)}
                  placeholder="GUID from EnforceCore"
                />
                <Button
                  variant="tertiary"
                  size="sm"
                  disabled={!violationTypeId.trim() || reportViolation.isPending}
                  onClick={() => reportViolation.mutate()}
                >
                  Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
