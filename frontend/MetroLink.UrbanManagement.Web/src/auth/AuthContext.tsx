import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  canAccess,
  hasAnyPermission as hasAnyPermissionHelper,
} from './permissions'
import {
  clearSession,
  defaultSessionFromEnv,
  loadSession,
  saveSession,
  type AuthSession,
} from './session'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (session: AuthSession) => void
  logout: () => void
  can: (permission: string) => boolean
  hasAnyPermission: (...permissions: string[]) => boolean
  hasPaymentRole: (role: AuthSession['paymentRoles'][number]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())

  const permissionSet = useMemo(
    () => new Set(session?.permissions ?? []),
    [session?.permissions],
  )

  const login = useCallback((next: AuthSession) => {
    saveSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const can = useCallback(
    (permission: string) => canAccess(permissionSet, permission),
    [permissionSet],
  )

  const hasAnyPermission = useCallback(
    (...permissions: string[]) => hasAnyPermissionHelper(permissionSet, permissions),
    [permissionSet],
  )

  const hasPaymentRole = useCallback(
    (role: AuthSession['paymentRoles'][number]) =>
      Boolean(session?.paymentRoles.includes(role)),
    [session?.paymentRoles],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login,
      logout,
      can,
      hasAnyPermission,
      hasPaymentRole,
    }),
    [session, login, logout, can, hasAnyPermission, hasPaymentRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useEnsureDevSession() {
  const { session, login } = useAuth()
  if (!session) {
    login(defaultSessionFromEnv())
  }
}
