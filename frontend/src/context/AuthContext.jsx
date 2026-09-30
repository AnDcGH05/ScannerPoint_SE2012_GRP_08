import { createContext, useCallback, useContext, useState } from 'react';
import API, { AUTH_KEY } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem(AUTH_KEY));
        } catch {
            return null;
        }
    });

    const login = useCallback(async (username, password) => {
        await API.post('/auth/login', { username, password }); // throws on bad credentials
        const value = {
            username,
            token: btoa(unescape(encodeURIComponent(`${username}:${password}`))),
        };
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(value));
        setAuth(value);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(AUTH_KEY);
        setAuth(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user: auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
