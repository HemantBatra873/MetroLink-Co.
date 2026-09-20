export type PaymentStatus =
  | 'Pending'
  | 'RequiresAction'
  | 'Succeeded'
  | 'Failed'
  | 'Cancelled'

export type PaymentRole = 'PaymentAdmin' | 'PaymentOperator' | 'PaymentViewer'

export interface PaymentStats {
  total: number
  pending: number
  requiresAction: number
  succeeded: number
  failed: number
  cancelled: number
  succeededAmount: number
}

export interface Payment {
  id: string
  organizationId: string
  sourceSystem: string
  payableReferenceId: string
  correlationId?: string | null
  amount: number
  currency: string
  status: PaymentStatus
  providerCode: string
  providerOrderId?: string | null
  providerPaymentId?: string | null
  idempotencyKey: string
  description?: string | null
  createdAt: string
  updatedAt: string
  paidAt?: string | null
  failureReason?: string | null
}

export interface PaymentEvent {
  id: string
  eventType: string
  occurredAt: string
  payloadJson?: string | null
}
