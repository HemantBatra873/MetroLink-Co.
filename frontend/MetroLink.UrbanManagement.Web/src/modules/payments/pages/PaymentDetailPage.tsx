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
import { useParams } from 'react-router-dom'
import { formatMoney, getPayment, getPaymentEvents } from '@/api/payments'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { PaymentStatusBadge } from '@/modules/payments/components/PaymentStatusBadge'

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const paymentQuery = useQuery({
    queryKey: ['payment', id],
    queryFn: () => getPayment(id!),
    enabled: Boolean(id),
  })
  const eventsQuery = useQuery({
    queryKey: ['payment-events', id],
    queryFn: () => getPaymentEvents(id!),
    enabled: Boolean(id),
  })

  const p = paymentQuery.data

  return (
    <>
      <PageHeader
        title={p ? formatMoney(p.amount, p.currency) : 'Payment detail'}
        description={p?.description ?? p?.sourceSystem ?? 'Loading payment…'}
        breadcrumbs={[
          { label: 'Payments', href: '/app/payments' },
          { label: p?.id.slice(0, 8) ?? '…' },
        ]}
      />
      {(paymentQuery.isError || eventsQuery.isError) && (
        <ApiAlert
          message={
            (paymentQuery.error instanceof Error && paymentQuery.error.message) ||
            (eventsQuery.error instanceof Error && eventsQuery.error.message) ||
            undefined
          }
        />
      )}
      {paymentQuery.isLoading || !p ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  Summary
                  <PaymentStatusBadge status={p.status} />
                </CardTitle>
                <CardDescription>
                  Created {new Date(p.createdAt).toLocaleString()}
                  {p.paidAt ? ` · Paid ${new Date(p.paidAt).toLocaleString()}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                <Field label="Payment id" value={p.id} mono />
                <Field label="Organization" value={p.organizationId} mono />
                <Field label="Source system" value={p.sourceSystem} />
                <Field label="Payable reference" value={p.payableReferenceId} mono />
                <Field label="Correlation id" value={p.correlationId ?? '—'} mono />
                <Field label="Provider" value={p.providerCode} />
                <Field label="Provider order" value={p.providerOrderId ?? '—'} mono />
                <Field label="Provider payment" value={p.providerPaymentId ?? '—'} mono />
                <Field label="Idempotency key" value={p.idempotencyKey} mono />
                {p.failureReason && <Field label="Failure reason" value={p.failureReason} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event timeline</CardTitle>
                <CardDescription>Audit trail for this payment.</CardDescription>
              </CardHeader>
              <CardContent>
                {eventsQuery.isLoading ? (
                  <Spinner />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Payload</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(eventsQuery.data ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-muted-foreground">
                            No events.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (eventsQuery.data ?? []).map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="whitespace-nowrap text-sm">
                              {new Date(e.occurredAt).toLocaleString()}
                            </TableCell>
                            <TableCell>{e.eventType}</TableCell>
                            <TableCell className="max-w-md truncate font-mono text-xs">
                              {e.payloadJson ?? '—'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className={mono ? 'font-mono text-xs break-all' : undefined}>{value}</p>
    </div>
  )
}
