import axios from 'axios';

const isDev = import.meta.env.DEV;
const prodUrl = import.meta.env.VITE_API_URL || 'https://mana-backend-six.vercel.app/api';
const localUrl = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: isDev ? localUrl : prodUrl,
    timeout: 30000,
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('mk_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('mk_token');
            localStorage.removeItem('mk_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
