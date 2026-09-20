import { Navigate, Route, Routes } from 'react-router-dom'
import { ModuleSubNav } from '@/shared/components/ModuleSubNav'
import { DashboardPage } from './pages/DashboardPage'
import { CasesPage } from './pages/CasesPage'
import { CaseDetailPage } from './pages/CaseDetailPage'
import { CreateCasePage } from './pages/CreateCasePage'
import { ConfigurationPage } from './pages/ConfigurationPage'

const subNav = [
  { label: 'Overview', path: '/app/enforcement', end: true },
  { label: 'Cases', path: '/app/enforcement/cases' },
  { label: 'New case', path: '/app/enforcement/cases/new' },
  { label: 'Configuration', path: '/app/enforcement/configuration' },
]

export function EnforcementRoutes() {
  return (
    <>
      <ModuleSubNav items={subNav} />
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="cases/new" element={<CreateCasePage />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="configuration" element={<ConfigurationPage />} />
        <Route path="*" element={<Navigate to="/app/enforcement" replace />} />
      </Routes>
    </>
  )
}
