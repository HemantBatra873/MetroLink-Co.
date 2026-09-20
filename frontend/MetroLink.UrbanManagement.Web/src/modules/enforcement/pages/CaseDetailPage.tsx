import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
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
import { CreditCard } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import {
  assignCase,
  cancelCase,
  completeMockPayment,
  disputeCase,
  enforcementApi,
  getCase,
  initiatePayment,
  issueCase,
  orgId,
  reviewCase,
} from '@/api/enforcement'
import type { FinancialObligation } from '@/api/enforcement/types'
import { useAuth } from '@/auth/AuthContext'
import { EnforcementPermissions } from '@/auth/permissions'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { CaseStatusBadge, ObligationStatusBadge } from '@/modules/enforcement/components/StatusBadge'
import { Timeline } from '@/shared/components/Timeline'

function outstanding(obligation: FinancialObligation) {
  return Math.max(0, obligation.amount - obligation.amountPaid)
}

function isPayable(obligation: FinancialObligation) {
  return (
    (obligation.status === 'Outstanding' || obligation.status === 'PartiallyPaid') &&
    outstanding(obligation) > 0
  )
}

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const client = useQueryClient()
  const { can, session } = useAuth()
  const query = useQuery({
    queryKey: ['case', id],
    queryFn: () => getCase(id!),
    enabled: Boolean(id),
  })

  const invalidateCase = () => {
    client.invalidateQueries({ queryKey: ['case', id] })
    client.invalidateQueries({ queryKey: ['dashboard'] })
    client.invalidateQueries({ queryKey: ['cases'] })
  }

  const payment = useMutation({
    mutationFn: async (obligation: FinancialObligation) => {
      const amount = outstanding(obligation)
      const initiated = await initiatePayment({
        organizationId: orgId(),
        sourceSystem: 'Enforcement',
        payableReferenceId: obligation.id,
        correlationId: id!,
        amount,
        currency: obligation.currency,
        idempotencyKey: crypto.randomUUID(),
        provider: 'Mock',
        description: `Enforcement obligation ${obligation.id}`,
        successCallbackUrl: `${enforcementApi}/financial-obligations/${obligation.id}/mark-paid`,
      })
      await completeMockPayment(initiated.paymentId)
    },
    onSuccess: invalidateCase,
  })

  const workflow = useMutation({
    mutationFn: async (action: {
      kind: 'assign' | 'issue' | 'cancel' | 'dispute' | 'review'
      officer?: string
      reason?: string
      uphold?: boolean
    }) => {
      if (!id) throw new Error('Missing case id')
      if (action.kind === 'assign') return assignCase(id, action.officer!)
      if (action.kind === 'issue') return issueCase(id)
      if (action.kind === 'cancel') return cancelCase(id, action.reason!)
      if (action.kind === 'dispute') return disputeCase(id, action.reason!)
      return reviewCase(id, Boolean(action.uphold), action.reason)
    },
    onSuccess: invalidateCase,
  })

  const c = query.data

  return (
    <>
      <PageHeader
        title={c?.caseNumber ?? 'Case detail'}
        description={c?.enforcementDomain?.name ?? 'Loading case…'}
        breadcrumbs={[
          { label: 'Cases', href: '/app/enforcement/cases' },
          { label: c?.caseNumber ?? '…' },
        ]}
      />
      {query.isError && <ApiAlert message={query.error instanceof Error ? query.error.message : undefined} />}
      {query.isLoading || !c ? (
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
                  <CaseStatusBadge status={c.status} />
                </CardTitle>
                <CardDescription>
                  Created {new Date(c.createdAt).toLocaleString()}
                  {c.locationLabel ? ` · ${c.locationLabel}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Subject</p>
                  <p className="font-medium">{c.subject?.displayLabel ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.subject?.subjectTypeCode}
                    {c.subject?.externalId ? ` · ${c.subject.externalId}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Officer</p>
                  <p className="font-medium truncate">{c.assignedOfficerKeycloakUserId ?? 'Unassigned'}</p>
                </div>
                {c.notes && (
                  <div className="sm:col-span-2">
                    <p className="text-muted-foreground">Notes</p>
                    <p>{c.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Violation</TableHead>
                      <TableHead>Offence #</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {c.violations.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.violationType?.name ?? v.violationTypeId}</TableCell>
                        <TableCell>{v.offenceNumberApplied}</TableCell>
                        <TableCell className="text-muted-foreground">{v.notes ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evidence</CardTitle>
                <CardDescription>{c.evidence.length} item(s) on file</CardDescription>
              </CardHeader>
              <CardContent>
                {c.evidence.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No evidence attached.</p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {c.evidence.map((e) => (
                      <li key={e.id} className="rounded-md border border-border p-3">
                        <p className="font-medium">
                          {e.title}{' '}
                          <span className="text-xs text-muted-foreground">({e.type})</span>
                        </p>
                        {e.description && <p className="text-muted-foreground">{e.description}</p>}
                        {e.uriOrValue && (
                          <p className="text-xs break-all text-primary">{e.uriOrValue}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {c.actions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No enforcement actions yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Issued</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {c.actions.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{a.actionType?.name ?? a.actionTypeId}</TableCell>
                          <TableCell>{new Date(a.issuedAt).toLocaleString()}</TableCell>
                          <TableCell>{a.notes ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case workflow</CardTitle>
                <CardDescription>Permission-gated transitions via EnforceCore</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {can(EnforcementPermissions.CaseAssign) && (
                  <Button
                    size="sm"
                    variant="tertiary"
                    loading={workflow.isPending}
                    onClick={() => {
                      const officer = window.prompt('Officer Keycloak user id', session?.userSub ?? '')
                      if (officer) workflow.mutate({ kind: 'assign', officer })
                    }}
                  >
                    Assign officer
                  </Button>
                )}
                {can(EnforcementPermissions.CaseIssue) && (
                  <Button
                    size="sm"
                    variant="tertiary"
                    loading={workflow.isPending}
                    onClick={() => workflow.mutate({ kind: 'issue' })}
                  >
                    Issue case
                  </Button>
                )}
                {can(EnforcementPermissions.CaseDispute) && (
                  <Button
                    size="sm"
                    variant="tertiary"
                    loading={workflow.isPending}
                    onClick={() => {
                      const reason = window.prompt('Dispute reason')
                      if (reason) workflow.mutate({ kind: 'dispute', reason })
                    }}
                  >
                    Open dispute
                  </Button>
                )}
                {can(EnforcementPermissions.CaseReview) && (
                  <>
                    <Button
                      size="sm"
                      variant="tertiary"
                      loading={workflow.isPending}
                      onClick={() => workflow.mutate({ kind: 'review', uphold: true })}
                    >
                      Uphold after review
                    </Button>
                    <Button
                      size="sm"
                      variant="tertiary"
                      loading={workflow.isPending}
                      onClick={() => {
                        const reason = window.prompt('Overturn reason') ?? undefined
                        workflow.mutate({ kind: 'review', uphold: false, reason })
                      }}
                    >
                      Overturn after review
                    </Button>
                  </>
                )}
                {can(EnforcementPermissions.CaseCancel) && (
                  <Button
                    size="sm"
                    variant="danger"
                    loading={workflow.isPending}
                    onClick={() => {
                      const reason = window.prompt('Cancellation reason')
                      if (reason) workflow.mutate({ kind: 'cancel', reason })
                    }}
                  >
                    Cancel case
                  </Button>
                )}
                {workflow.isError && (
                  <p className="text-sm text-destructive">
                    {workflow.error instanceof Error ? workflow.error.message : 'Workflow action failed'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial obligations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {c.financialObligations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No fines or fees on this case.</p>
                ) : (
                  c.financialObligations.map((o) => (
                    <div key={o.id} className="rounded-md border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <ObligationStatusBadge status={o.status} />
                        <span className="font-semibold tabular-nums">
                          {o.currency} {o.amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Paid {o.currency} {o.amountPaid.toLocaleString()}
                        {o.dueAt ? ` · due ${new Date(o.dueAt).toLocaleDateString()}` : ''}
                      </p>
                      {isPayable(o) && (
                        <Button
                          size="sm"
                          className="w-full"
                          loading={payment.isPending}
                          onClick={() => payment.mutate(o)}
                        >
                          <CreditCard className="h-4 w-4" />
                          Initiate mock payment
                        </Button>
                      )}
                      <Link
                        to={`/app/payments?ref=${o.id}`}
                        className="inline-flex text-xs font-medium text-primary hover:underline"
                      >
                        View payments for this obligation →
                      </Link>
                    </div>
                  ))
                )}
                {payment.isError && (
                  <p className="text-sm text-destructive">
                    {payment.error instanceof Error ? payment.error.message : 'Payment failed'}
                  </p>
                )}
                {payment.isSuccess && (
                  <p className="text-sm text-muted-foreground">Payment completed — refresh may show updated status.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline
                  entries={[...c.auditEvents]
                    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
                    .map((e) => ({
                      id: e.id,
                      title: e.eventType.replace(/([A-Z])/g, ' $1').trim(),
                      subtitle: e.reason ?? undefined,
                      timestamp: e.occurredAt,
                    }))}
                />
              </CardContent>
            </Card>

            <Link to="/app/enforcement/cases" className="text-sm text-primary hover:underline">
              ← Back to cases
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
