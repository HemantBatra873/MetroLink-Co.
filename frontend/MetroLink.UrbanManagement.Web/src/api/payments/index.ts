import { getOrgId, isPaymentAdmin, pay } from '@/api/client'
import type { Payment, PaymentEvent, PaymentStats, PaymentStatus } from './types'

export function isAdmin() {
  return isPaymentAdmin()
}

export function getStats(params?: { organizationId?: string; sourceSystem?: string }) {
  const q = new URLSearchParams()
  const organizationId = isAdmin() ? params?.organizationId : params?.organizationId || getOrgId()
  if (organizationId) q.set('organizationId', organizationId)
  if (params?.sourceSystem) q.set('sourceSystem', params.sourceSystem)
  const qs = q.toString()
  return pay<PaymentStats>(`/payments/stats${qs ? `?${qs}` : ''}`)
}

export function listPayments(params: {
  organizationId?: string
  payableReferenceId?: string
  sourceSystem?: string
  status?: PaymentStatus | ''
}) {
  const q = new URLSearchParams()
  const organizationId = isAdmin() ? params.organizationId : params.organizationId || getOrgId()
  if (organizationId) q.set('organizationId', organizationId)
  if (params.payableReferenceId) q.set('payableReferenceId', params.payableReferenceId)
  if (params.sourceSystem) q.set('sourceSystem', params.sourceSystem)
  if (params.status) q.set('status', params.status)
  const qs = q.toString()
  return pay<Payment[]>(`/payments${qs ? `?${qs}` : ''}`)
}

export function getPayment(id: string) {
  return pay<Payment>(`/payments/${id}`)
}

export function getPaymentEvents(id: string) {
  return pay<PaymentEvent[]>(`/payments/${id}/events`)
}

export function formatMoney(amount: number, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}
