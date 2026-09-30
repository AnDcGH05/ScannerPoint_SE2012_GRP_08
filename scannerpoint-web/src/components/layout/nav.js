import {
    CalendarDays, Car, ClipboardCheck, ClipboardList, FileText, LayoutDashboard, Package, Receipt,
    RefreshCw, UserRound, Users, Wrench,
} from '../ui/icons';

const A = 'admin', R = 'receptionist', M = 'mechanic', S = 'storekeeper';

// Mirrors the @PreAuthorize rules in the backend controllers
const PERMISSIONS = {
    'customers.read': [A, R, M], 'customers.write': [A, R],
    'vehicles.read': [A, R, M], 'vehicles.write': [A, R],
    'appointments.read': [A, R, M], 'appointments.write': [A, R],
    'jobcards.read': [A, R, M], 'jobcards.create': [A, R, M], 'jobcards.status': [A, M],
    'inspections.read': [A, R, M], 'inspections.write': [A, M],
    'parts.read': [A, S, M], 'parts.write': [A, S], 'parts.lowstock': [A, S],
    'suppliers': [A, S],
    'stock.restock': [A, S], 'stock.dispense': [A, S, M], 'stock.history': [A, S],
    'billing': [A, R],
    'employees': [A], 'payroll': [A], 'reports': [A], 'users': [A],
};

export const can = (role, permission) => PERMISSIONS[permission]?.includes(role) ?? false;

// Sidebar sections; an item is shown when the role holds any of its permissions
export const NAV = [
    { label: null, items: [{ to: '/overview', label: 'Overview', icon: LayoutDashboard, needs: null }] },
    {
        label: 'Front desk',
        items: [
            { to: '/customers', label: 'Customers', icon: UserRound, needs: ['customers.read'] },
            { to: '/vehicles', label: 'Vehicles', icon: Car, needs: ['vehicles.read'] },
            { to: '/appointments', label: 'Appointments', icon: CalendarDays, needs: ['appointments.read'] },
        ],
    },
    {
        label: 'Workshop',
        items: [
            { to: '/job-cards', label: 'Job cards', icon: ClipboardList, needs: ['jobcards.read'] },
            { to: '/inspections', label: 'Inspections', icon: ClipboardCheck, needs: ['inspections.read'] },
        ],
    },
    {
        label: 'Inventory',
        items: [
            { to: '/parts', label: 'Spare parts', icon: Package, needs: ['parts.read'] },
            { to: '/stock', label: 'Stock movements', icon: RefreshCw, needs: ['stock.restock', 'stock.dispense'] },
            { to: '/suppliers', label: 'Suppliers', icon: Wrench, needs: ['suppliers'] },
        ],
    },
    { label: 'Billing', items: [{ to: '/invoices', label: 'Invoices & payments', icon: Receipt, needs: ['billing'] }] },
    {
        label: 'Administration',
        items: [
            { to: '/employees', label: 'Employees', icon: Users, needs: ['employees'] },
            { to: '/payroll', label: 'Payroll', icon: Receipt, needs: ['payroll'] },
            { to: '/reports', label: 'Reports', icon: FileText, needs: ['reports'] },
            { to: '/users', label: 'User accounts', icon: UserRound, needs: ['users'] },
        ],
    },
];

export const visible = (role, item) => !item.needs || item.needs.some((p) => can(role, p));
