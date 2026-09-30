import axios from 'axios';

export const AUTH_KEY = 'sp_auth';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach the Basic auth header saved at login
API.interceptors.request.use((config) => {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (raw) {
        try {
            const { token } = JSON.parse(raw);
            config.headers.Authorization = `Basic ${token}`;
        } catch {
            sessionStorage.removeItem(AUTH_KEY);
        }
    }
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
