import { Navigate, Route, Routes } from 'react-router-dom'
import { ModuleSubNav } from '@/shared/components/ModuleSubNav'
import { AdminOverviewPage } from './pages/AdminOverviewPage'
import { AdminResourcePage } from './pages/AdminResourcePage'

const subNav = [
  { label: 'Overview', path: '/app/administration', end: true },
  { label: 'Organizations', path: '/app/administration/organizations' },
  { label: 'Users', path: '/app/administration/users' },
  { label: 'Memberships', path: '/app/administration/memberships' },
  { label: 'Roles', path: '/app/administration/roles' },
  { label: 'Permissions', path: '/app/administration/permissions' },
  { label: 'Areas', path: '/app/administration/areas' },
]

export function AdministrationRoutes() {
  return (
    <>
      <ModuleSubNav items={subNav} />
      <Routes>
        <Route index element={<AdminOverviewPage />} />
        <Route path="organizations" element={<AdminResourcePage resource="organizations" />} />
        <Route path="users" element={<AdminResourcePage resource="users" />} />
        <Route path="memberships" element={<AdminResourcePage resource="memberships" />} />
        <Route path="roles" element={<AdminResourcePage resource="roles" />} />
        <Route path="permissions" element={<AdminResourcePage resource="permissions" />} />
        <Route path="areas" element={<AdminResourcePage resource="areas" />} />
        <Route path="*" element={<Navigate to="/app/administration" replace />} />
      </Routes>
    </>
  )
}
