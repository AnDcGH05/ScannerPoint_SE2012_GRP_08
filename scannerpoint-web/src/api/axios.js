import axios from 'axios';

export const AUTH_KEY = 'sp_auth';

export function readAuth() {
    try {
        return JSON.parse(sessionStorage.getItem(AUTH_KEY));
    } catch {
        return null;
    }
}

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach the Basic auth header saved at login (the backend uses HTTP Basic)
API.interceptors.request.use((config) => {
    const token = readAuth()?.token;
    if (token) config.headers.Authorization = `Basic ${token}`;
    return config;
});

// Bad/expired credentials on a protected call -> back to login
API.interceptors.response.use(
    (res) => res,
    (error) => {
        const url = error.config?.url || '';
        if (error.response?.status === 401 && !url.includes('/auth/')) {
            sessionStorage.removeItem(AUTH_KEY);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
