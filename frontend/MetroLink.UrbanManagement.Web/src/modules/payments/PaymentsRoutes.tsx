import { Navigate, Route, Routes } from 'react-router-dom'
import { ModuleSubNav } from '@/shared/components/ModuleSubNav'
import { DashboardPage } from './pages/DashboardPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { PaymentDetailPage } from './pages/PaymentDetailPage'

const subNav = [
  { label: 'Overview', path: '/app/payments/overview', end: true },
  { label: 'All payments', path: '/app/payments' },
]

export function PaymentsRoutes() {
  return (
    <>
      <ModuleSubNav items={subNav} />
      <Routes>
        <Route index element={<PaymentsPage />} />
        <Route path="overview" element={<DashboardPage />} />
        <Route path=":id" element={<PaymentDetailPage />} />
        <Route path="*" element={<Navigate to="/app/payments" replace />} />
      </Routes>
    </>
  )
}
