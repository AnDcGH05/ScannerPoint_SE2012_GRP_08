import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { can } from './components/layout/nav';
import { useAuth } from './context/AuthContext';
import Appointments from './pages/Appointments';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import Inspections from './pages/Inspections';
import Invoices from './pages/Invoices';
import JobCards from './pages/JobCards';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Payroll from './pages/Payroll';
import Register from './pages/Register';
import Reports from './pages/Reports';
import SpareParts from './pages/SpareParts';
import Stock from './pages/Stock';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import Vehicles from './pages/Vehicles';

function RequireAuth({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

// Opens a screen only for roles the backend would accept; others go back to the overview
function Guard({ needs, children }) {
    const { user } = useAuth();
    return needs.some((p) => can(user.role, p)) ? children : <Navigate to="/overview" replace />;
}

const page = (path, needs, element) => <Route path={path} element={<Guard needs={needs}>{element}</Guard>} />;

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<RequireAuth><AppShell /></RequireAuth>}>
                <Route path="/overview" element={<Overview />} />
                {page('/customers', ['customers.read'], <Customers />)}
                {page('/vehicles', ['vehicles.read'], <Vehicles />)}
                {page('/appointments', ['appointments.read'], <Appointments />)}
                {page('/job-cards', ['jobcards.read'], <JobCards />)}
                {page('/inspections', ['inspections.read'], <Inspections />)}
                {page('/parts', ['parts.read'], <SpareParts />)}
                {page('/stock', ['stock.restock', 'stock.dispense'], <Stock />)}
                {page('/suppliers', ['suppliers'], <Suppliers />)}
                {page('/invoices', ['billing'], <Invoices />)}
                {page('/employees', ['employees'], <Employees />)}
                {page('/payroll', ['payroll'], <Payroll />)}
                {page('/reports', ['reports'], <Reports />)}
                {page('/users', ['users'], <Users />)}
            </Route>

            {/* Path used by the earlier prototype */}
            <Route path="/employee-report" element={<Navigate to="/reports" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
