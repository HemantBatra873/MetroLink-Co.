import { useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { ParkingPermissions } from '@/auth/permissions'
import { ModuleSubNav, type SubNavItem } from '@/shared/components/ModuleSubNav'
import { DashboardPage } from './pages/DashboardPage'
import { FacilitiesPage } from './pages/FacilitiesPage'
import { FacilityCreatePage } from './pages/FacilityCreatePage'
import { FacilityDetailPage } from './pages/FacilityDetailPage'
import { SessionsPage } from './pages/SessionsPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { OccupancyPage } from './pages/OccupancyPage'
import { PricingPage } from './pages/PricingPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'
import { PublicDiscoveryPage } from './pages/PublicDiscoveryPage'

type GatedSubNav = SubNavItem & { permissions?: string[] }

const allSubNav: GatedSubNav[] = [
  {
    label: 'Overview',
    path: '/app/parking',
    end: true,
    permissions: [ParkingPermissions.ReportView, ParkingPermissions.FacilityView],
  },
  { label: 'Facilities', path: '/app/parking/facilities', permissions: [ParkingPermissions.FacilityView] },
  { label: 'Sessions', path: '/app/parking/sessions', permissions: [ParkingPermissions.SessionView] },
  { label: 'Occupancy', path: '/app/parking/occupancy', permissions: [ParkingPermissions.OccupancyView] },
  { label: 'Pricing', path: '/app/parking/pricing', permissions: [ParkingPermissions.PricingView] },
  {
    label: 'Subscriptions',
    path: '/app/parking/subscriptions',
    permissions: [ParkingPermissions.SubscriptionView],
  },
  { label: 'Find parking', path: '/app/parking/find' },
]

export function ParkingRoutes() {
  const { hasAnyPermission } = useAuth()

  const subNav = useMemo(
    () =>
      allSubNav.filter(
        (item) => !item.permissions?.length || hasAnyPermission(...item.permissions),
      ),
    [hasAnyPermission],
  )

  const defaultPath = subNav[0]?.path ?? '/app/parking/find'

  return (
    <>
      <ModuleSubNav items={subNav} />
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="facilities" element={<FacilitiesPage />} />
        <Route path="facilities/new" element={<FacilityCreatePage />} />
        <Route path="facilities/:id" element={<FacilityDetailPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="sessions/:id" element={<SessionDetailPage />} />
        <Route path="occupancy" element={<OccupancyPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="find" element={<PublicDiscoveryPage />} />
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    </>
  )
}
