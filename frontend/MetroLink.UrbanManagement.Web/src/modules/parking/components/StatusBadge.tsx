import { StatusBadge } from '@enterprise/component-library'
import type { FacilityStatus, SessionStatus } from '@/api/parking/types'

const facilityVariants: Record<
  FacilityStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  Draft: 'secondary',
  Submitted: 'default',
  UnderReview: 'default',
  Approved: 'outline',
  Active: 'outline',
  Suspended: 'destructive',
  Closed: 'secondary',
  Rejected: 'destructive',
}

const sessionVariants: Record<
  SessionStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  Created: 'secondary',
  Active: 'default',
  PaymentPending: 'default',
  Completed: 'outline',
  Cancelled: 'secondary',
}

export function FacilityStatusBadge({ status }: { status: FacilityStatus }) {
  return <StatusBadge status={status} variant={facilityVariants[status]} />
}

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return <StatusBadge status={status} variant={sessionVariants[status]} />
}
