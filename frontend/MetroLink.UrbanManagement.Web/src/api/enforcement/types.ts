export type CaseStatus =
  | 'Draft'
  | 'Issued'
  | 'Payable'
  | 'Paid'
  | 'Disputed'
  | 'UnderReview'
  | 'Upheld'
  | 'Cancelled'

export type ObligationStatus = 'Outstanding' | 'PartiallyPaid' | 'Paid' | 'Waived' | 'Cancelled'

export type EvidenceType =
  | 'Photograph'
  | 'Video'
  | 'Document'
  | 'GpsCoordinates'
  | 'Timestamp'
  | 'OfficerNotes'
  | 'SensorData'
  | 'Other'

export type ActionOutcomeKind = 'Informational' | 'Financial' | 'Restrictive'

export interface DashboardStats {
  totalCases: number
  openCases: number
  issuedCases: number
  pendingPayment: number
  paid: number
  disputed: number
  recentActivity: RecentActivity[]
}

export interface RecentActivity {
  caseId: string
  caseNumber: string
  eventType: string
  occurredAt: string
}

export interface CaseListItem {
  id: string
  caseNumber: string
  domainCode: string
  status: CaseStatus
  subjectLabel?: string | null
  organizationId: string
  areaId?: string | null
  createdAt: string
  outstandingAmount?: number | null
}

export interface CaseListResponse {
  items: CaseListItem[]
  total: number
  page: number
  pageSize: number
}

export interface PenaltyRule {
  id: string
  violationTypeId: string
  offenceNumber: number
  amount: number
  currency: string
  effectiveFrom: string
  effectiveTo?: string | null
  areaId?: string | null
  isActive: boolean
}

export interface ViolationType {
  id: string
  enforcementDomainId: string
  code: string
  name: string
  description?: string | null
  isActive: boolean
  penaltyRules: PenaltyRule[]
}

export interface SubjectTypeDefinition {
  id: string
  enforcementDomainId: string
  code: string
  name: string
  externalSystemHint?: string | null
}

export interface ActionTypeDefinition {
  id: string
  enforcementDomainId: string
  code: string
  name: string
  outcomeKind: ActionOutcomeKind
  isActive: boolean
}

export interface EnforcementDomain {
  id: string
  organizationId: string
  code: string
  name: string
  description?: string | null
  isActive: boolean
  subjectTypes: SubjectTypeDefinition[]
  violationTypes: ViolationType[]
  actionTypes: ActionTypeDefinition[]
}

export interface CaseSubject {
  id: string
  subjectTypeCode: string
  externalId?: string | null
  displayLabel: string
  metadataJson?: string | null
}

export interface CaseViolation {
  id: string
  violationTypeId: string
  offenceNumberApplied: number
  notes?: string | null
  violationType?: ViolationType | null
}

export interface EvidenceItem {
  id: string
  type: EvidenceType
  title: string
  description?: string | null
  uriOrValue?: string | null
  contentType?: string | null
  capturedAt: string
  capturedByKeycloakUserId: string
}

export interface FinancialObligation {
  id: string
  enforcementCaseId: string
  amount: number
  amountPaid: number
  currency: string
  status: ObligationStatus
  dueAt?: string | null
  createdAt: string
  externalPaymentReference?: string | null
}

export interface EnforcementAction {
  id: string
  actionTypeId: string
  issuedAt: string
  issuedByKeycloakUserId: string
  notes?: string | null
  financialObligationId?: string | null
  actionType?: ActionTypeDefinition | null
}

export interface CaseAuditEvent {
  id: string
  eventType: string
  actorKeycloakUserId: string
  occurredAt: string
  reason?: string | null
  detailsJson?: string | null
}

export interface EnforcementCase {
  id: string
  caseNumber: string
  organizationId: string
  areaId?: string | null
  enforcementDomainId: string
  status: CaseStatus
  createdAt: string
  createdByKeycloakUserId: string
  assignedOfficerKeycloakUserId?: string | null
  issuedAt?: string | null
  locationLabel?: string | null
  latitude?: number | null
  longitude?: number | null
  notes?: string | null
  updatedAt: string
  enforcementDomain?: EnforcementDomain | null
  subject?: CaseSubject | null
  violations: CaseViolation[]
  evidence: EvidenceItem[]
  actions: EnforcementAction[]
  financialObligations: FinancialObligation[]
  auditEvents: CaseAuditEvent[]
}

export interface CreateCaseRequest {
  organizationId: string
  enforcementDomainId: string
  areaId?: string | null
  subjectTypeCode: string
  subjectDisplayLabel: string
  subjectExternalId?: string | null
  subjectMetadataJson?: string | null
  violationTypeId: string
  locationLabel?: string | null
  latitude?: number | null
  longitude?: number | null
  notes?: string | null
  offenceNumber?: number | null
}

export interface AddEvidenceRequest {
  type: EvidenceType
  title: string
  description?: string | null
  uriOrValue?: string | null
  contentType?: string | null
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
