import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import EmployeeReport from './pages/EmployeeReport';
import './App.css';

function RequireAuth({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
                <Route path="/customers" element={<Customers />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/employee-report" element={<EmployeeReport />} />
            </Route>
            <Route path="*" element={<Navigate to="/customers" replace />} />
        </Routes>
    );
}
