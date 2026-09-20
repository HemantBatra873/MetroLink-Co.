import {
  EnforcementPermissions,
  IdentityPermissions,
} from '@/auth/permissions'
import type { ReactNode } from 'react'

export interface NavItem {
  id: string
  label: string
  path: string
  icon?: ReactNode
  /** User needs at least one of these permissions (empty = always visible when authenticated) */
  permissions: string[]
}

export const primaryNavItems: NavItem[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    path: '/app',
    permissions: [],
  },
  {
    id: 'parking',
    label: 'Parking',
    // Always available so citizens can use Find Parking; sub-nav is permission-filtered.
    path: '/app/parking/find',
    permissions: [],
  },
  {
    id: 'enforcement',
    label: 'Enforcement',
    path: '/app/enforcement',
    permissions: [EnforcementPermissions.CaseView],
  },
  {
    id: 'payments',
    label: 'Payments',
    path: '/app/payments',
    permissions: [EnforcementPermissions.PaymentView],
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/app/profile',
    permissions: [],
  },
  {
    id: 'administration',
    label: 'Administration',
    path: '/app/administration',
    permissions: [
      IdentityPermissions.OrganizationView,
      IdentityPermissions.UserView,
      IdentityPermissions.RoleView,
      IdentityPermissions.PermissionView,
      IdentityPermissions.MembershipView,
      IdentityPermissions.AreaView,
    ],
  },
]

export function filterNavItems(
  items: NavItem[],
  hasAnyPermission: (...permissions: string[]) => boolean,
  options?: { hasPaymentAccess?: boolean },
): NavItem[] {
  return items.filter((item) => {
    if (item.id === 'payments') {
      return Boolean(options?.hasPaymentAccess)
    }
    if (item.permissions.length === 0) return true
    return hasAnyPermission(...item.permissions)
  })
}

export function tabIdForPath(pathname: string): string {
  if (pathname.startsWith('/app/parking')) return 'parking'
  if (pathname.startsWith('/app/enforcement')) return 'enforcement'
  if (pathname.startsWith('/app/payments')) return 'payments'
  if (pathname.startsWith('/app/administration')) return 'administration'
  if (pathname.startsWith('/app/profile')) return 'profile'
  return 'workspace'
}
