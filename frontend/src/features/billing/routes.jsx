import BillPage from './pages/BillPage'
import BillsPage from './pages/BillsPage'
import FeedbackAdminPage from './pages/FeedbackAdminPage'
import InvoiceDeskPage from './pages/InvoiceDeskPage'
import InvoicesPage from './pages/InvoicesPage'
import PayDepositPage from './pages/PayDepositPage'
import PaymentSlipsPage from './pages/PaymentSlipsPage'
import RefundsPage from './pages/RefundsPage'
import ReportsPage from './pages/ReportsPage'

const DESK = ['RECEPTIONIST', 'ADMIN']

/** Sew – packages, billing, payments, refunds, feedback and reports. */
export default {
  customerNav: [{ to: '/app/bills', label: 'Bills & Payments', order: 5 }],
  customerRoutes: [
    { path: 'bills', element: <BillsPage /> },
    { path: 'bills/:id', element: <BillPage /> },
    { path: 'bookings/:id/pay', element: <PayDepositPage /> },
  ],
  staffNav: [
    { to: '/staff/payments', label: 'Payment slips', icon: 'receipt_long', group: 'Billing', roles: DESK, order: 40 },
    { to: '/staff/invoices', label: 'Bills & invoices', icon: 'point_of_sale', group: 'Billing', roles: DESK, order: 41 },
    { to: '/staff/refunds', label: 'Refunds', icon: 'currency_exchange', group: 'Billing', roles: DESK, order: 42 },
    { to: '/staff/reports', label: 'Reports & packages', icon: 'monitoring', group: 'Admin', roles: ['ADMIN'], order: 50 },
    { to: '/staff/feedback', label: 'Customer feedback', icon: 'reviews', group: 'Admin', roles: ['ADMIN'], order: 52 },
  ],
  staffRoutes: [
    { path: 'payments', element: <PaymentSlipsPage />, roles: DESK },
    { path: 'invoices', element: <InvoicesPage />, roles: DESK },
    { path: 'invoices/:id', element: <InvoiceDeskPage />, roles: DESK },
    { path: 'refunds', element: <RefundsPage />, roles: DESK },
    { path: 'reports', element: <ReportsPage />, roles: ['ADMIN'] },
    { path: 'feedback', element: <FeedbackAdminPage />, roles: ['ADMIN'] },
  ],
}
