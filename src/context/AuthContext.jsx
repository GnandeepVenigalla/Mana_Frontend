import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import i18n from '../lib/i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('mk_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(true);

    // Apply language globally whenever user changes
    useEffect(() => {
        if (user && user.language) {
            i18n.changeLanguage(user.language);
        } else {
            i18n.changeLanguage('en');
        }
    }, [user]);

    // Verify token on mount
    useEffect(() => {
        const token = localStorage.getItem('mk_token');
        if (token) {
            api.get('/auth/me')
                .then(({ data }) => {
                    setUser(data.user);
                    localStorage.setItem('mk_user', JSON.stringify(data.user));
                })
                .catch(() => {
                    localStorage.removeItem('mk_token');
                    localStorage.removeItem('mk_user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('mk_token', data.token);
        localStorage.setItem('mk_user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    }, []);

    const register = useCallback(async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        localStorage.setItem('mk_token', data.token);
        localStorage.setItem('mk_user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('mk_token');
        localStorage.removeItem('mk_user');
        setUser(null);
    }, []);

    const updateUser = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem('mk_user', JSON.stringify(userData));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
