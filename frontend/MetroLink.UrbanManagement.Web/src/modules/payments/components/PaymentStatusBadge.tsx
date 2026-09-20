import { StatusBadge } from '@enterprise/component-library'
import type { PaymentStatus } from '@/api/payments/types'

const variants: Record<PaymentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Pending: 'secondary',
  RequiresAction: 'default',
  Succeeded: 'outline',
  Failed: 'destructive',
  Cancelled: 'secondary',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <StatusBadge status={status} variant={variants[status]} />
}
