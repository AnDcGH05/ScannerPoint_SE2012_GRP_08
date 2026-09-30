import { NavLink } from 'react-router-dom';
import { ROLE_LABEL } from '../../context/AuthContext';
import { LogOut } from '../ui/icons';
import Logo from '../ui/Logo';
import { NAV, visible } from './nav';

export const initials = (name = '') =>
    name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

export default function Sidebar({ user, open, onNavigate, onLogout }) {
    return (
        <aside className={`sidebar${open ? ' is-open' : ''}`} id="sidebar">
            <Logo light to="/overview" tagline="Garage workspace" />
            <nav className="side-nav" aria-label="Main">
                {NAV.map((section) => {
                    const items = section.items.filter((item) => visible(user.role, item));
                    if (!items.length) return null;
                    return (
                        <div key={section.label || 'top'}>
                            {section.label && <div className="side-label">{section.label}</div>}
                            {items.map(({ to, label, icon: Icon }) => (
                                <NavLink key={to} to={to} className="side-link" onClick={onNavigate}>
                                    <Icon aria-hidden="true" />{label}
                                </NavLink>
                            ))}
                        </div>
                    );
                })}
            </nav>
            <div className="side-user">
                <span className="avatar">{initials(user.username)}</span>
                <div style={{ minWidth: 0 }}>
                    <div className="side-user-name">{user.username}</div>
                    <div className="side-user-role">{ROLE_LABEL[user.role]}{user.demo && ' · preview'}</div>
                </div>
                <button type="button" className="side-logout" onClick={onLogout} aria-label="Log out">
                    <LogOut aria-hidden="true" />
                </button>
            </div>
        </aside>
    );
}
