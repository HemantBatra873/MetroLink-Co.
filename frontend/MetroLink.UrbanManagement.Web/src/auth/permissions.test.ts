import { describe, expect, it } from 'vitest'
import { canAccess, hasAnyPermission, ParkingPermissions } from './permissions'

describe('canAccess', () => {
  it('returns true when permission is present', () => {
    const set = new Set([ParkingPermissions.FacilityView])
    expect(canAccess(set, ParkingPermissions.FacilityView)).toBe(true)
  })

  it('returns false when permission is missing', () => {
    const set = new Set<string>()
    expect(canAccess(set, ParkingPermissions.FacilityView)).toBe(false)
  })
})

describe('hasAnyPermission', () => {
  it('returns true if any required permission matches', () => {
    const set = new Set([ParkingPermissions.SessionView])
    expect(hasAnyPermission(set, [ParkingPermissions.FacilityView, ParkingPermissions.SessionView])).toBe(
      true,
    )
  })

  it('returns false when none match', () => {
    const set = new Set([ParkingPermissions.TicketView])
    expect(hasAnyPermission(set, [ParkingPermissions.FacilityView])).toBe(false)
  })

  it('returns true for empty required list', () => {
    expect(hasAnyPermission(new Set(), [])).toBe(true)
  })
})
