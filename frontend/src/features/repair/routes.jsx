import CustomerJobPage from './CustomerJobPage.jsx'
import JobBoardPage from './JobBoardPage.jsx'
import JobDetailPage from './JobDetailPage.jsx'
import MechanicDashboardPage from './MechanicDashboardPage.jsx'
import StaffPage from './StaffPage.jsx'

/** Sohan – job cards, smart repair workflow, notifications and staff. */
export default {
  customerRoutes: [{ path: 'jobs/:id', element: <CustomerJobPage /> }],
  staffNav: [
    { to: '/staff/jobs', label: 'Job board & check-in', icon: 'view_kanban', group: 'Front desk', roles: ['RECEPTIONIST', 'ADMIN'], order: 10, end: true },
    { to: '/staff/my-jobs', label: 'My jobs', icon: 'engineering', group: 'Workshop', roles: ['MECHANIC'], order: 20 },
    { to: '/staff/staff', label: 'Staff', icon: 'badge', group: 'Admin', roles: ['ADMIN'], order: 51 },
  ],
  staffRoutes: [
    { path: 'jobs', element: <JobBoardPage />, roles: ['RECEPTIONIST', 'ADMIN'] },
    { path: 'jobs/:id', element: <JobDetailPage />, roles: ['RECEPTIONIST', 'MECHANIC', 'ADMIN', 'STOREKEEPER'] },
    { path: 'my-jobs', element: <MechanicDashboardPage />, roles: ['MECHANIC'] },
    { path: 'staff', element: <StaffPage />, roles: ['ADMIN'] },
  ],
}
