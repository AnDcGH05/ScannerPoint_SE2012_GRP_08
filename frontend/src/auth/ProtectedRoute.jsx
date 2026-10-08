import { Navigate, useLocation } from 'react-router-dom'
import { homePath, useAuth } from './AuthContext.jsx'

/** Only lets the listed roles through; everyone else goes to the login page or their own home. */
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={homePath(user.role)} replace />
  return children
}
