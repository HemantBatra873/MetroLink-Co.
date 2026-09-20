import { parsePermissionList, type PaymentRole } from './permissions'

export const SESSION_STORAGE_KEY = 'urban-mgmt-session'

export interface AuthSession {
  userSub: string
  displayName: string
  organizationId: string
  permissions: string[]
  paymentRoles: PaymentRole[]
}

export function defaultSessionFromEnv(): AuthSession {
  return {
    userSub: import.meta.env.VITE_TEST_USER_SUB || '3fa85f64-5717-4562-b3fc-2c963f66afa1',
    displayName: import.meta.env.VITE_USER_DISPLAY_NAME || 'Demo Operator',
    organizationId: import.meta.env.VITE_ORG_ID || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    permissions: parsePermissionList(import.meta.env.VITE_USER_PERMISSIONS),
    paymentRoles: (import.meta.env.VITE_PAYMENT_TEST_ROLES || 'PaymentAdmin,PaymentOperator')
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean) as PaymentRole[],
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

export function getActiveSession(): AuthSession {
  return loadSession() ?? defaultSessionFromEnv()
}
