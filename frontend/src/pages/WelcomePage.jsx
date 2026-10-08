import { useAuth } from '../auth/AuthContext.jsx'
import { EmptyState } from '../components/States.jsx'

/** Shown to customers until the customer dashboard (Aneesha's feature) is added. */
export default function WelcomePage() {
  const { user } = useAuth()
  return <div className="card"><EmptyState icon="garage" title={`Welcome, ${user?.fullName || ''}`} text="Your dashboard will appear here." /></div>
}
