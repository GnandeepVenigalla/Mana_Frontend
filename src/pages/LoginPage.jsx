import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, TrendingUp, Shield, PieChart } from 'lucide-react';

const FEATURES = [
    { icon: '📊', tag: 'Smart Analytics', desc: 'AI-powered spending analysis and insights' },
    { icon: '🔒', tag: 'Bank-Level Security', desc: 'Your data is encrypted and protected' },
    { icon: '💡', tag: 'AI Insights', desc: 'Personalized tips to grow your savings' },
];

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = 'Email is required';
        if (!form.password) errs.password = 'Password is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back! 👋');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Login failed. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        width: `${60 + i * 30}px`,
                        height: `${60 + i * 30}px`,
                        top: `${10 + i * 18}%`,
                        left: `${5 + i * 8}%`,
                        animationDelay: `${i * 1.2}s`,
                        animationDuration: `${5 + i}s`,
                    }} />
                ))}
            </div>

            <div className="auth-left">
                <div className="auth-branding">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
                        <div style={{ width: 48, height: 48, background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, boxShadow: 'var(--shadow-glow)' }}>
                            <img src="https://raw.githubusercontent.com/GnandeepVenigalla/Mana_Karma/main/public/manakarma.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 28, fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: -0.5, lineHeight: 1 }}>Mana Karma</span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>Powered by GD Enterprisier</span>
                        </div>
                    </div>
                    <h1 className="auth-headline">Your Money,<br /><span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Smarter.</span></h1>
                    <p className="auth-sub">Analyze spending, track budgets, and get AI-powered financial guidance — all in one beautiful dashboard.</p>
                    <div className="auth-features">
                        {FEATURES.map((f) => (
                            <div className="auth-feature-item" key={f.tag}>
                                <div className="auth-feature-icon">{f.icon}</div>
                                <div className="auth-feature-text">
                                    <span className="auth-feature-tag">{f.tag}</span>
                                    <span className="auth-feature-desc">{f.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-container">
                    <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                        <img src="https://raw.githubusercontent.com/GnandeepVenigalla/Mana_Karma/main/public/manakarma.png" alt="Mana Karma" style={{ width: 64, height: 64 }} />
                    </div>
                    <h2 className="auth-form-title text-center">Welcome Back</h2>
                    <p className="auth-form-sub text-center">Sign in to your Mana Karma account</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                autoComplete="email"
                            />
                            {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="login-password"
                                    type={showPw ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    autoComplete="current-password"
                                    style={{ paddingRight: 44 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => !p)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex' }}
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <span className="form-error">⚠ {errors.password}</span>}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            id="login-submit"
                            disabled={loading}
                            style={{ justifyContent: 'center', marginTop: 4 }}
                        >
                            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} />Signing In...</> : <><LogIn size={18} />Sign In</>}
                        </button>
                    </form>

                    <div className="auth-divider">or</div>

                    <div
                        className="card card-sm"
                        style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.2)', cursor: 'pointer' }}
                        onClick={() => {
                            setForm({ email: 'demo@manakarma.com', password: 'demo123456' });
                        }}
                    >
                        <p style={{ fontSize: 13, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            🎯 <strong style={{ color: 'var(--color-primary)' }}>Try Demo Account</strong> — demo@manakarma.com / demo123456
                        </p>
                    </div>

                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <a onClick={() => navigate('/register')}>Create one free</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
