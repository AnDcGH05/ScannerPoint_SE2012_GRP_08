import BookPage from './pages/BookPage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DocumentsPage from './pages/DocumentsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import VehiclesPage from './pages/VehiclesPage.jsx'

const DESK = ['RECEPTIONIST', 'ADMIN']

/** Aneesha – customers, vehicles, documents and bookings. */
export default {
  customerNav: [
    { to: '/app', label: 'Dashboard', order: 1, end: true },
    { to: '/app/vehicles', label: 'My Vehicles', order: 2 },
    { to: '/app/book', label: 'Book a Service', order: 3 },
    { to: '/app/bookings', label: 'My Bookings', order: 4 },
    { to: '/app/profile', label: 'Profile', order: 6 },
  ],
  customerRoutes: [
    { index: true, element: <DashboardPage /> },
    { path: 'vehicles', element: <VehiclesPage /> },
    { path: 'book', element: <BookPage /> },
    { path: 'bookings', element: <BookingsPage /> },
    { path: 'profile', element: <ProfilePage /> },
  ],
  staffNav: [
    { to: '/staff/calendar', label: 'Bay booking calendar', icon: 'calendar_month', group: 'Front desk', roles: DESK, order: 11 },
    { to: '/staff/customers', label: 'Customers & vehicles', icon: 'groups', group: 'Front desk', roles: DESK, order: 12 },
    { to: '/staff/documents', label: 'Documents to verify', icon: 'verified_user', group: 'Front desk', roles: DESK, order: 13 },
  ],
  staffRoutes: [
    { path: 'calendar', element: <CalendarPage />, roles: DESK },
    { path: 'customers', element: <CustomersPage />, roles: DESK },
    { path: 'documents', element: <DocumentsPage />, roles: DESK },
  ],
}
