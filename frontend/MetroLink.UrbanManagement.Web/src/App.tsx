import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/shell/AppLayout'
import { LoginPage } from '@/modules/auth/LoginPage'
import { RequireAuth } from '@/modules/auth/RequireAuth'
import { WorkspaceHomePage } from '@/modules/workspace/WorkspaceHomePage'
import { ParkingRoutes } from '@/modules/parking/ParkingRoutes'
import { EnforcementRoutes } from '@/modules/enforcement/EnforcementRoutes'
import { PaymentsRoutes } from '@/modules/payments/PaymentsRoutes'
import { AdministrationRoutes } from '@/modules/identity/AdministrationRoutes'
import { ProfilePage } from '@/modules/identity/pages/ProfilePage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<WorkspaceHomePage />} />
        <Route path="parking/*" element={<ParkingRoutes />} />
        <Route path="enforcement/*" element={<EnforcementRoutes />} />
        <Route path="payments/*" element={<PaymentsRoutes />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="administration/*" element={<AdministrationRoutes />} />
      </Route>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
