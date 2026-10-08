import PartRequestsPage from './pages/PartRequestsPage.jsx'
import PartsPage from './pages/PartsPage.jsx'
import StockPage from './pages/StockPage.jsx'
import StoreDashboardPage from './pages/StoreDashboardPage.jsx'

const STORE = ['STOREKEEPER', 'ADMIN']

/** Tevindu – inventory and spare parts. */
export default {
  staffNav: [
    { to: '/staff/store', label: 'Store dashboard', icon: 'space_dashboard', group: 'Stores', roles: STORE, order: 30 },
    { to: '/staff/part-requests', label: 'Part requests', icon: 'assignment_returned', group: 'Stores', roles: STORE, order: 31 },
    { to: '/staff/parts', label: 'Spare parts & suppliers', icon: 'inventory_2', group: 'Stores', roles: STORE, order: 32 },
    { to: '/staff/stock', label: 'Stock movements', icon: 'swap_vert', group: 'Stores', roles: STORE, order: 33 },
  ],
  staffRoutes: [
    { path: 'store', element: <StoreDashboardPage />, roles: STORE },
    { path: 'part-requests', element: <PartRequestsPage />, roles: STORE },
    { path: 'parts', element: <PartsPage />, roles: STORE },
    { path: 'stock', element: <StockPage />, roles: STORE },
    { path: 'stock/:partId', element: <StockPage />, roles: STORE },
  ],
}
