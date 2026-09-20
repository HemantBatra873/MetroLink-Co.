import { StatusBadge } from '@enterprise/component-library'
import type { CaseStatus, ObligationStatus } from '@/api/enforcement/types'

const caseVariants: Record<CaseStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Draft: 'secondary',
  Issued: 'default',
  Payable: 'default',
  Paid: 'outline',
  Disputed: 'destructive',
  UnderReview: 'secondary',
  Upheld: 'outline',
  Cancelled: 'secondary',
}

const obligationVariants: Record<ObligationStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Outstanding: 'destructive',
  PartiallyPaid: 'default',
  Paid: 'outline',
  Waived: 'secondary',
  Cancelled: 'secondary',
}

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return <StatusBadge status={status} variant={caseVariants[status]} />
}

export function ObligationStatusBadge({ status }: { status: ObligationStatus }) {
  return <StatusBadge status={status} variant={obligationVariants[status]} />
}
