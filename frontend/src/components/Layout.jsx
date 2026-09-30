import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="shell">
            <aside className="sidebar">
                <h1 className="brand">Scanner Point</h1>
                <nav>
                    <NavLink to="/customers">Customers</NavLink>
                    <NavLink to="/vehicles">Vehicles</NavLink>
                    <div className="nav-heading">Staff</div>
                    <NavLink to="/employees">Employees</NavLink>
                    <NavLink to="/payroll">Payroll</NavLink>
                    <NavLink to="/employee-report">Employee report</NavLink>
                </nav>
                <div className="sidebar-footer">
                    <span>{user?.username}</span>
                    <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
                </div>
            </aside>
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}
