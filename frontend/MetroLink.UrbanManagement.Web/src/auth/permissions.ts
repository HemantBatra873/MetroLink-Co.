export const ParkingPermissions = {
  FacilityView: 'Parking.Facility.View',
  FacilityCreate: 'Parking.Facility.Create',
  FacilityUpdate: 'Parking.Facility.Update',
  FacilitySubmit: 'Parking.Facility.Submit',
  FacilityVerify: 'Parking.Facility.Verify',
  FacilityActivate: 'Parking.Facility.Activate',
  FacilitySuspend: 'Parking.Facility.Suspend',
  ZoneView: 'Parking.Zone.View',
  ZoneManage: 'Parking.Zone.Manage',
  SpaceView: 'Parking.Space.View',
  SpaceManage: 'Parking.Space.Manage',
  OccupancyView: 'Parking.Occupancy.View',
  OccupancyUpdate: 'Parking.Occupancy.Update',
  SessionView: 'Parking.Session.View',
  SessionCreate: 'Parking.Session.Create',
  SessionClose: 'Parking.Session.Close',
  TicketView: 'Parking.Ticket.View',
  PricingView: 'Parking.Pricing.View',
  PricingManage: 'Parking.Pricing.Manage',
  SubscriptionView: 'Parking.Subscription.View',
  SubscriptionManage: 'Parking.Subscription.Manage',
  ReportView: 'Parking.Report.View',
} as const

export const EnforcementPermissions = {
  CaseView: 'Enforcement.Case.View',
  CaseCreate: 'Enforcement.Case.Create',
  CaseAssign: 'Enforcement.Case.Assign',
  CaseIssue: 'Enforcement.Case.Issue',
  CaseCancel: 'Enforcement.Case.Cancel',
  CaseDispute: 'Enforcement.Case.Dispute',
  CaseReview: 'Enforcement.Case.Review',
  CaseUpdate: 'Enforcement.Case.Update',
  PaymentView: 'Enforcement.Payment.View',
} as const

export const IdentityPermissions = {
  OrganizationView: 'Identity.Organization.View',
  UserView: 'Identity.User.View',
  RoleView: 'Identity.Role.View',
  PermissionView: 'Identity.Permission.View',
  MembershipView: 'Identity.Membership.View',
  AreaView: 'Identity.Area.View',
} as const

export type PaymentRole = 'PaymentAdmin' | 'PaymentOperator' | 'PaymentViewer'

export const DEFAULT_DEV_PERMISSIONS = (
  import.meta.env.VITE_USER_PERMISSIONS ||
  Object.values({ ...ParkingPermissions, ...EnforcementPermissions, ...IdentityPermissions }).join(',')
)
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean)

export function parsePermissionList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [...DEFAULT_DEV_PERMISSIONS]
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
}

export function canAccess(permissions: Set<string>, permission: string): boolean {
  return permissions.has(permission)
}

export function hasAnyPermission(permissions: Set<string>, required: string[]): boolean {
  if (required.length === 0) return true
  return required.some((p) => permissions.has(p))
}
