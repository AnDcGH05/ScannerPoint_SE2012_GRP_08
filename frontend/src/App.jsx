import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import { homePath, useAuth } from './auth/AuthContext.jsx'
import CustomerLayout from './layouts/CustomerLayout.jsx'
import StaffLayout from './layouts/StaffLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFound from './pages/NotFound.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import { customerRoutes, staffRoutes } from './features/registry.js'

const STAFF = ['RECEPTIONIST', 'MECHANIC', 'STOREKEEPER', 'ADMIN']

function RoleHome() {
  const { user } = useAuth()
  return <Navigate to={user ? homePath(user.role) : '/login'} replace />
}

function guard(route) {
  return route.roles ? <ProtectedRoute roles={route.roles}>{route.element}</ProtectedRoute> : route.element
}

export default function App() {
  const hasCustomerHome = customerRoutes.some((r) => r.index)
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/app" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerLayout /></ProtectedRoute>}>
        {!hasCustomerHome && <Route index element={<WelcomePage />} />}
        {customerRoutes.map((r) =>
          r.index ? <Route key="index" index element={r.element} /> : <Route key={r.path} path={r.path} element={r.element} />)}
      </Route>

      <Route path="/staff" element={<ProtectedRoute roles={STAFF}><StaffLayout /></ProtectedRoute>}>
        <Route index element={<RoleHome />} />
        {staffRoutes.map((r) => <Route key={r.path} path={r.path} element={guard(r)} />)}
      </Route>

      <Route path="/" element={<RoleHome />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
