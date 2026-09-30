import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu } from '../ui/icons';
import Logo from '../ui/Logo';
import Sidebar from './Sidebar';
import '../../styles/app.css';

export default function AppShell() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // small screens only

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="shell">
            <header className="topbar">
                <Logo light to="/overview" />
                <button type="button" className="side-logout" onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu" aria-expanded={menuOpen} aria-controls="sidebar">
                    <Menu aria-hidden="true" />
                </button>
            </header>
            {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} />}
            <Sidebar user={user} open={menuOpen} onNavigate={() => setMenuOpen(false)} onLogout={handleLogout} />
            <main className="content">
                <div className="content-inner">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
