export type FacilityStatus =
  | 'Draft'
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Active'
  | 'Suspended'
  | 'Closed'
  | 'Rejected'

export type FacilityType = 'Surface' | 'Multilevel' | 'Underground' | 'OnStreet' | 'Mixed'

export type OccupancyMode = 'Capacity' | 'IndividualSpaces' | 'Integrated'

export type OccupancySource = 'Manual' | 'EntryExit' | 'Sensor' | 'Anpr' | 'ExternalApi'

export type SessionStatus = 'Created' | 'Active' | 'PaymentPending' | 'Completed' | 'Cancelled'

export type EntryExitMethod = 'Manual' | 'Qr' | 'Rfid' | 'Anpr' | 'Sensor' | 'External'

export type VehicleType = 'Car' | 'TwoWheeler' | 'EV' | 'Commercial' | 'Bus' | 'Other'

export type ProductType =
  | 'Hourly'
  | 'Daily'
  | 'Monthly'
  | 'Reserved'
  | 'Resident'
  | 'Commercial'
  | 'Corporate'

export type SubscriptionStatus = 'Pending' | 'Active' | 'Expired' | 'Cancelled'

export type ObligationStatus = 'Outstanding' | 'PartiallyPaid' | 'Paid' | 'Waived' | 'Cancelled'

export type TicketStatus = 'Issued' | 'Cancelled' | 'Completed'

export type ZoneStatus = 'Active' | 'Inactive'

export interface DashboardStats {
  totalFacilities: number
  activeFacilities: number
  totalCapacity: number
  occupied: number
  available: number
  todayEntries: number
  todayExits: number
  activeSessions: number
  openObligations: number
  outstandingAmount: number
  recentActivity: RecentParkingActivity[]
}

export interface RecentParkingActivity {
  sessionId?: string | null
  facilityId?: string | null
  eventType: string
  occurredAt: string
}

export interface FacilityListResponse {
  items: ParkingFacility[]
  total: number
  page: number
  pageSize: number
}

export interface SessionListResponse {
  items: ParkingSession[]
  total: number
  page: number
  pageSize: number
}

export interface ParkingFacility {
  id: string
  organizationId: string
  ownerOrganizationId: string
  operatorOrganizationId: string
  areaId?: string | null
  name: string
  code: string
  description?: string | null
  facilityType: FacilityType
  status: FacilityStatus
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  totalCapacity: number
  occupancyMode: OccupancyMode
  vehicleTypesCsv: string
  operatingHoursJson?: string | null
  rejectionReason?: string | null
  submittedAt?: string | null
  reviewedAt?: string | null
  reviewedByKeycloakUserId?: string | null
  activatedAt?: string | null
  createdAt: string
  updatedAt: string
  createdByKeycloakUserId: string
  updatedByKeycloakUserId?: string | null
  zones?: ParkingZone[]
}

export interface ParkingZone {
  id: string
  facilityId: string
  name: string
  code: string
  zoneType?: string | null
  capacity: number
  status: ZoneStatus
  createdAt: string
}

export interface OccupancySnapshot {
  id: string
  facilityId: string
  zoneId?: string | null
  totalCapacity: number
  occupied: number
  available: number
  source: OccupancySource
  recordedAt: string
  recordedByKeycloakUserId?: string | null
  notes?: string | null
}

export interface ParkingSession {
  id: string
  facilityId: string
  zoneId?: string | null
  organizationId: string
  areaId?: string | null
  vehiclePlate: string
  vehicleExternalId?: string | null
  vehicleType: VehicleType
  status: SessionStatus
  entryTime: string
  exitTime?: string | null
  entryMethod: EntryExitMethod
  exitMethod?: EntryExitMethod | null
  pricingProductId?: string | null
  calculatedAmount?: number | null
  currency: string
  financialObligationId?: string | null
  enforcementCaseId?: string | null
  ticketId?: string | null
  createdAt: string
  updatedAt: string
  createdByKeycloakUserId: string
}

export interface SessionExitResult {
  session: ParkingSession
  obligation?: FinancialObligation | null
}

export interface FinancialObligation {
  id: string
  organizationId: string
  sessionId?: string | null
  subscriptionId?: string | null
  amount: number
  amountPaid: number
  currency: string
  status: ObligationStatus
  dueAt?: string | null
  createdAt: string
  externalPaymentReference?: string | null
}

export interface ParkingTicket {
  id: string
  ticketNumber: string
  sessionId: string
  facilityId: string
  vehiclePlate: string
  issuedAt: string
  entryTime: string
  exitTime?: string | null
  amount?: number | null
  currency: string
  status: TicketStatus
}

export interface ParkingProduct {
  id: string
  organizationId: string
  code: string
  name: string
  productType: ProductType
  isActive: boolean
  createdAt: string
}

export interface ParkingRate {
  id: string
  organizationId: string
  facilityId?: string | null
  productId: string
  vehicleType: VehicleType
  currency: string
  baseAmount: number
  perHourAmount?: number | null
  maxDailyAmount?: number | null
  effectiveFrom: string
  effectiveTo?: string | null
  isActive: boolean
  createdAt: string
  createdByKeycloakUserId: string
  product?: ParkingProduct | null
}

export interface ParkingSubscription {
  id: string
  organizationId: string
  facilityId: string
  productId: string
  customerKeycloakUserId?: string | null
  customerLabel: string
  vehiclePlate?: string | null
  status: SubscriptionStatus
  startsAt: string
  endsAt?: string | null
  financialObligationId?: string | null
  createdAt: string
  createdByKeycloakUserId: string
}

export interface PublicFacility {
  id: string
  name: string
  code: string
  facilityType: FacilityType
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  totalCapacity: number
  occupied?: number | null
  availableSpaces?: number | null
  vehicleTypesCsv?: string | null
  operatingHoursJson?: string | null
}

export interface CreateFacilityRequest {
  organizationId: string
  ownerOrganizationId: string
  operatorOrganizationId: string
  areaId?: string | null
  name: string
  code: string
  description?: string | null
  facilityType: FacilityType
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  totalCapacity: number
  occupancyMode: OccupancyMode
  vehicleTypesCsv?: string | null
  operatingHoursJson?: string | null
}

export interface UpdateFacilityRequest {
  name: string
  description?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  totalCapacity: number
  occupancyMode: OccupancyMode
  vehicleTypesCsv?: string | null
  operatingHoursJson?: string | null
}

export interface CreateZoneRequest {
  name: string
  code: string
  zoneType?: string | null
  capacity: number
}

export interface ManualOccupancyRequest {
  occupied: number
  notes?: string | null
}

export interface CreateSessionEntryRequest {
  organizationId: string
  facilityId: string
  zoneId?: string | null
  areaId?: string | null
  vehiclePlate: string
  vehicleExternalId?: string | null
  vehicleType: VehicleType
  entryMethod: EntryExitMethod
  pricingProductId?: string | null
}

export interface SessionExitRequest {
  exitMethod?: EntryExitMethod | null
  exitTime?: string | null
}

export interface ReportViolationRequest {
  violationTypeId: string
  locationLabel?: string | null
  latitude?: number | null
  longitude?: number | null
  notes?: string | null
}

export interface CreateProductRequest {
  organizationId: string
  code: string
  name: string
  productType: ProductType
}

export interface CreateRateRequest {
  organizationId: string
  facilityId?: string | null
  productId: string
  vehicleType: VehicleType
  baseAmount: number
  perHourAmount?: number | null
  maxDailyAmount?: number | null
  effectiveFrom: string
  effectiveTo?: string | null
}

export interface UpdateRateRequest {
  baseAmount: number
  perHourAmount?: number | null
  maxDailyAmount?: number | null
  effectiveTo?: string | null
  isActive: boolean
}

export interface CreateSubscriptionRequest {
  organizationId: string
  facilityId: string
  productId: string
  customerLabel: string
  customerKeycloakUserId?: string | null
  vehiclePlate?: string | null
  startsAt: string
  endsAt?: string | null
}

export interface InitiatePaymentRequest {
  organizationId: string
  sourceSystem: string
  payableReferenceId: string
  correlationId?: string | null
  amount: number
  currency: string
  idempotencyKey: string
  provider?: string | null
  description?: string | null
  successCallbackUrl?: string | null
}

export interface InitiatePaymentResponse {
  paymentId: string
  status: string
  providerCode: string
  providerOrderId: string
  checkoutUrl?: string | null
  amount: number
  currency: string
}

export interface PaymentResponse {
  id: string
  status: string
  paidAt?: string | null
  sourceSystem?: string
  payableReferenceId?: string
}
