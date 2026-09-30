import { createContext, useCallback, useContext, useState } from 'react';
import API, { AUTH_KEY, readAuth } from '../api/axios';

const AuthContext = createContext(null);

// The staff roles seeded by the backend's DataInitializer, plus "user" for a plain ROLE_USER account
export const ROLE_LABEL = {
    admin: 'Admin',
    receptionist: 'Receptionist',
    mechanic: 'Mechanic',
    storekeeper: 'Storekeeper',
    user: 'Registered user',
};

const FROM_BACKEND = {
    ROLE_ADMIN: 'admin',
    ROLE_RECEPTIONIST: 'receptionist',
    ROLE_MECHANIC: 'mechanic',
    ROLE_STOREKEEPER: 'storekeeper',
};
const PRIORITY = ['admin', 'receptionist', 'mechanic', 'storekeeper'];

const fromRoles = (roles = []) => PRIORITY.find((r) => roles.some((name) => FROM_BACKEND[name] === r)) || 'user';
const allowed = (path) => API.get(path).then(() => true, () => false);

/**
 * POST /auth/login only returns a message, so the role is worked out from what the account may read:
 *   /users                -> admin only
 *   /spare-parts/low-stock -> admin, storekeeper
 *   /customers            -> admin, receptionist, mechanic
 *   /spare-parts          -> admin, storekeeper, mechanic
 * If the backend later adds GET /auth/me (returning UserResponse) it is used instead.
 */
async function resolveRole() {
    try {
        const me = await API.get('/auth/me');
        if (Array.isArray(me.data?.roles)) return fromRoles(me.data.roles);
    } catch { /* endpoint not available */ }
    const [users, lowStock, customers, parts] = await Promise.all(
        ['/users', '/spare-parts/low-stock', '/customers', '/spare-parts'].map(allowed));
    if (users) return 'admin';
    if (lowStock) return 'storekeeper';
    if (customers) return parts ? 'mechanic' : 'receptionist';
    return 'user';
}

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(readAuth);

    const save = (value) => {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(value));
        setAuth(value);
        return value;
    };

    const login = useCallback(async (username, password) => {
        await API.post('/auth/login', { username, password }); // throws on bad credentials
        const token = btoa(unescape(encodeURIComponent(`${username}:${password}`)));
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ username, token }));
        return save({ username, token, role: await resolveRole() });
    }, []);

    const register = useCallback(async ({ username, email, password }) => {
        const res = await API.post('/auth/register', { username, email, password });
        return res.data;
    }, []);

    // Development-only: look around as a role with sample data and no backend session.
    const preview = useCallback((role) => save({ username: `${role}-preview`, role, demo: true }), []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(AUTH_KEY);
        setAuth(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user: auth, login, register, preview, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
