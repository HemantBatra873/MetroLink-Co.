import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  loadSession,
  saveSession,
  SESSION_STORAGE_KEY,
  type AuthSession,
} from './session'

const sample: AuthSession = {
  userSub: 'user-1',
  displayName: 'Tester',
  organizationId: 'org-1',
  permissions: ['Parking.Facility.View'],
  paymentRoles: ['PaymentViewer'],
}

describe('session storage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('persists and loads session on login', () => {
    saveSession(sample)
    expect(loadSession()).toEqual(sample)
  })

  it('clears session on logout', () => {
    saveSession(sample)
    clearSession()
    expect(loadSession()).toBeNull()
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })
})
