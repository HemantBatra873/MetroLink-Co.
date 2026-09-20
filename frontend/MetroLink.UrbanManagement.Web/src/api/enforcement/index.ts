import { enf, enforcementApi, getOrgId, pay } from '@/api/client'
import type {
  AddEvidenceRequest,
  CaseListResponse,
  CreateCaseRequest,
  DashboardStats,
  EnforcementCase,
  EnforcementDomain,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentResponse,
} from './types'

export { enforcementApi }

export function orgId(): string {
  return getOrgId()
}

export function getDashboard() {
  return enf<DashboardStats>(`/dashboard?organizationId=${getOrgId()}`)
}

export function listCases(params: {
  status?: string
  domainId?: string
  areaId?: string
  search?: string
  page: number
  pageSize: number
}) {
  const q = new URLSearchParams({
    organizationId: getOrgId(),
    page: String(params.page),
    pageSize: String(params.pageSize),
  })
  if (params.status) q.set('status', params.status)
  if (params.domainId) q.set('domainId', params.domainId)
  if (params.areaId) q.set('areaId', params.areaId)
  if (params.search) q.set('search', params.search)
  return enf<CaseListResponse>(`/enforcement-cases?${q}`)
}

export function getCase(id: string) {
  return enf<EnforcementCase>(`/enforcement-cases/${id}`)
}

export function createCase(body: CreateCaseRequest) {
  return enf<EnforcementCase>('/enforcement-cases', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function issueCase(id: string, notes?: string) {
  return enf<EnforcementCase>(`/enforcement-cases/${id}/issue`, {
    method: 'POST',
    body: JSON.stringify({ actionTypeId: null, notes: notes ?? null, dueDays: 14 }),
  })
}

export function assignCase(id: string, officerKeycloakUserId: string) {
  return enf<EnforcementCase>(`/enforcement-cases/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ officerKeycloakUserId }),
  })
}

export function cancelCase(id: string, reason: string) {
  return enf<EnforcementCase>(`/enforcement-cases/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export function disputeCase(id: string, reason: string) {
  return enf<EnforcementCase>(`/enforcement-cases/${id}/dispute`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export function reviewCase(id: string, uphold: boolean, reason?: string) {
  return enf<EnforcementCase>(`/enforcement-cases/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ uphold, reason: reason ?? null }),
  })
}

export function addEvidence(id: string, body: AddEvidenceRequest) {
  return enf<unknown>(`/enforcement-cases/${id}/evidence`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getConfigurationDomains() {
  return enf<EnforcementDomain[]>(`/configuration/domains?organizationId=${getOrgId()}`)
}

export function initiatePayment(body: InitiatePaymentRequest) {
  return pay<InitiatePaymentResponse>('/payments/initiate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function completeMockPayment(paymentId: string) {
  return pay<PaymentResponse>(`/payments/${paymentId}/complete-mock`, { method: 'POST' })
}
