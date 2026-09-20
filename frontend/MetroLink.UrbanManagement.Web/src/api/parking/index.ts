import { getOrgId, park, parkingApi, pay } from '@/api/client'
import type {
  CreateFacilityRequest,
  CreateProductRequest,
  CreateRateRequest,
  CreateSessionEntryRequest,
  CreateSubscriptionRequest,
  CreateZoneRequest,
  DashboardStats,
  FacilityListResponse,
  FinancialObligation,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  ManualOccupancyRequest,
  OccupancySnapshot,
  ParkingFacility,
  ParkingProduct,
  ParkingRate,
  ParkingSession,
  ParkingSubscription,
  ParkingTicket,
  PaymentResponse,
  PublicFacility,
  ReportViolationRequest,
  SessionExitRequest,
  SessionExitResult,
  SessionListResponse,
  UpdateFacilityRequest,
  UpdateRateRequest,
  ParkingZone,
} from './types'

export { parkingApi }

export function orgId(): string {
  return getOrgId()
}

export function getDashboard() {
  return park<DashboardStats>(`/dashboard?organizationId=${getOrgId()}`)
}

export function listFacilities(params: {
  status?: string
  page: number
  pageSize: number
}) {
  const q = new URLSearchParams({
    organizationId: getOrgId(),
    page: String(params.page),
    pageSize: String(params.pageSize),
  })
  if (params.status) q.set('status', params.status)
  return park<FacilityListResponse>(`/facilities?${q}`)
}

export function getFacility(id: string) {
  return park<ParkingFacility>(`/facilities/${id}`)
}

export function createFacility(body: CreateFacilityRequest) {
  return park<ParkingFacility>('/facilities', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateFacility(id: string, body: UpdateFacilityRequest) {
  return park<ParkingFacility>(`/facilities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function submitFacility(id: string) {
  return park<ParkingFacility>(`/facilities/${id}/submit`, { method: 'POST' })
}

export function startReviewFacility(id: string) {
  return park<ParkingFacility>(`/facilities/${id}/start-review`, { method: 'POST' })
}

export function approveFacility(id: string) {
  return park<ParkingFacility>(`/facilities/${id}/approve`, { method: 'POST' })
}

export function rejectFacility(id: string, reason: string) {
  return park<ParkingFacility>(`/facilities/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export function activateFacility(id: string) {
  return park<ParkingFacility>(`/facilities/${id}/activate`, { method: 'POST' })
}

export function suspendFacility(id: string) {
  return park<ParkingFacility>(`/facilities/${id}/suspend`, { method: 'POST' })
}

export function closeFacility(id: string) {
  return park<ParkingFacility>(`/facilities/${id}/close`, { method: 'POST' })
}

export function listZones(facilityId: string) {
  return park<ParkingZone[]>(`/facilities/${facilityId}/zones`)
}

export function createZone(facilityId: string, body: CreateZoneRequest) {
  return park<unknown>(`/facilities/${facilityId}/zones`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getOccupancy(facilityId: string, zoneId?: string) {
  const q = new URLSearchParams({ facilityId })
  if (zoneId) q.set('zoneId', zoneId)
  return park<OccupancySnapshot>(`/occupancy?${q}`)
}

export function updateManualOccupancy(facilityId: string, body: ManualOccupancyRequest) {
  return park<OccupancySnapshot>(`/occupancy/${facilityId}/manual`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function listSessions(params: {
  facilityId?: string
  status?: string
  page: number
  pageSize: number
}) {
  const q = new URLSearchParams({
    organizationId: getOrgId(),
    page: String(params.page),
    pageSize: String(params.pageSize),
  })
  if (params.facilityId) q.set('facilityId', params.facilityId)
  if (params.status) q.set('status', params.status)
  return park<SessionListResponse>(`/sessions?${q}`)
}

export function getSession(id: string) {
  return park<ParkingSession>(`/sessions/${id}`)
}

export function createSessionEntry(body: CreateSessionEntryRequest) {
  return park<ParkingSession>('/sessions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function exitSession(id: string, body?: SessionExitRequest) {
  return park<SessionExitResult>(`/sessions/${id}/exit`, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  })
}

export function cancelSession(id: string) {
  return park<ParkingSession>(`/sessions/${id}/cancel`, { method: 'POST' })
}

export function reportSessionViolation(id: string, body: ReportViolationRequest) {
  return park<ParkingSession>(`/sessions/${id}/report-violation`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getTicket(id: string) {
  return park<ParkingTicket>(`/tickets/${id}`)
}

export function getFinancialObligation(id: string) {
  return park<FinancialObligation>(`/financial-obligations/${id}`)
}

export function listProducts() {
  return park<ParkingProduct[]>(`/pricing/products?organizationId=${getOrgId()}`)
}

export function createProduct(body: CreateProductRequest) {
  return park<ParkingProduct>('/pricing/products', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function listRates(facilityId?: string) {
  const q = new URLSearchParams({ organizationId: getOrgId() })
  if (facilityId) q.set('facilityId', facilityId)
  return park<ParkingRate[]>(`/pricing/rates?${q}`)
}

export function createRate(body: CreateRateRequest) {
  return park<ParkingRate>('/pricing/rates', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateRate(id: string, body: UpdateRateRequest) {
  return park<ParkingRate>(`/pricing/rates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function listSubscriptions(facilityId?: string) {
  const q = new URLSearchParams({ organizationId: getOrgId() })
  if (facilityId) q.set('facilityId', facilityId)
  return park<ParkingSubscription[]>(`/subscriptions?${q}`)
}

export function createSubscription(body: CreateSubscriptionRequest) {
  return park<ParkingSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function activateSubscription(id: string) {
  return park<ParkingSubscription>(`/subscriptions/${id}/activate`, { method: 'POST' })
}

export function cancelSubscription(id: string) {
  return park<ParkingSubscription>(`/subscriptions/${id}/cancel`, { method: 'POST' })
}

export function listPublicFacilities() {
  return park<PublicFacility[]>('/public/parking')
}

export function getPublicFacility(id: string) {
  return park<PublicFacility>(`/public/parking/${id}`)
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
