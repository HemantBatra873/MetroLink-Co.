import { describe, expect, it } from 'vitest'
import { EnforcementPermissions } from '@/auth/permissions'
import { filterNavItems, primaryNavItems, tabIdForPath } from './navigation'

describe('filterNavItems', () => {
  it('always shows parking (Find Parking is public within the app)', () => {
    const filtered = filterNavItems(primaryNavItems, () => false, { hasPaymentAccess: false })
    expect(filtered.some((i) => i.id === 'parking')).toBe(true)
    expect(filtered.some((i) => i.id === 'workspace')).toBe(true)
    expect(filtered.some((i) => i.id === 'profile')).toBe(true)
  })

  it('hides administration without identity permissions', () => {
    const filtered = filterNavItems(primaryNavItems, () => false, { hasPaymentAccess: false })
    expect(filtered.some((i) => i.id === 'administration')).toBe(false)
  })

  it('shows payments only when payment access is granted', () => {
    const withPayment = filterNavItems(primaryNavItems, () => false, { hasPaymentAccess: true })
    const withoutPayment = filterNavItems(primaryNavItems, () => false, { hasPaymentAccess: false })
    expect(withPayment.some((i) => i.id === 'payments')).toBe(true)
    expect(withoutPayment.some((i) => i.id === 'payments')).toBe(false)
  })

  it('shows enforcement when case view permission exists', () => {
    const filtered = filterNavItems(
      primaryNavItems,
      (...perms) => perms.includes(EnforcementPermissions.CaseView),
      { hasPaymentAccess: false },
    )
    expect(filtered.some((i) => i.id === 'enforcement')).toBe(true)
  })
})

describe('tabIdForPath', () => {
  it('maps module paths to tab ids', () => {
    expect(tabIdForPath('/app/parking/facilities')).toBe('parking')
    expect(tabIdForPath('/app/enforcement/cases')).toBe('enforcement')
    expect(tabIdForPath('/app/payments/overview')).toBe('payments')
    expect(tabIdForPath('/app/administration/users')).toBe('administration')
    expect(tabIdForPath('/app')).toBe('workspace')
  })
})
