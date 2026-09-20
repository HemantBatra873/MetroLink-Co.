import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppShell, CreditCard, LayoutDashboard, Wallet } from '@enterprise/component-library'
import { Building2, Scale, Shield, User } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { EnforcementPermissions } from '@/auth/permissions'
import { ContextBar } from './ContextBar'
import { filterNavItems, primaryNavItems, tabIdForPath } from './navigation'

const iconMap: Record<string, React.ReactNode> = {
  workspace: <LayoutDashboard className="h-4 w-4" />,
  parking: <Building2 className="h-4 w-4" />,
  enforcement: <Scale className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  profile: <User className="h-4 w-4" />,
  administration: <Shield className="h-4 w-4" />,
}

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, hasAnyPermission, logout } = useAuth()

  const activeTab = tabIdForPath(location.pathname)

  const hasPaymentAccess =
    hasAnyPermission(EnforcementPermissions.PaymentView) ||
    Boolean(session?.paymentRoles.length)

  const navItems = useMemo(() => {
    return filterNavItems(primaryNavItems, hasAnyPermission, { hasPaymentAccess }).map((item) => ({
      id: item.id,
      label: item.label,
      icon: iconMap[item.id] ?? <Wallet className="h-4 w-4" />,
    }))
  }, [hasAnyPermission, hasPaymentAccess])

  const onTabChange = (tabId: string) => {
    const target = primaryNavItems.find((n) => n.id === tabId)
    if (target) navigate(target.path)
  }

  return (
    <AppShell
      title="Urban Management"
      activeTab={activeTab}
      onTabChange={onTabChange}
      currentTheme="light"
      navItems={navItems}
      sidebarLabel="Platform"
      sidebarFooterNote={{
        title: session?.displayName ?? 'Signed out',
        subtitle: session
          ? `${session.paymentRoles.join(', ') || 'operator'} · tap Profile to sign out`
          : 'Use /login for dev session',
      }}
    >
      <ContextBar />
      <Outlet />
      {session && (
        <button
          type="button"
          className="sr-only"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Sign out
        </button>
      )}
    </AppShell>
  )
}
