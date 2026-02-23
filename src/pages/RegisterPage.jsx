import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '',
        password: '', confirmPassword: '',
    });
    const [errors, setErrors] = useState({});

    const update = (field, value) => setForm(p => ({ ...p, [field]: value }));

    const validateStep1 = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'Required';
        if (!form.lastName.trim()) errs.lastName = 'Required';
        if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
        if (form.password.length < 6) errs.password = 'At least 6 characters';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) setStep(2);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
            });
            toast.success('Account created! Let\'s set up your profile 🎉');
        } catch (err) {
            let msg = 'Registration failed.';
            if (err?.response?.data?.errors?.length > 0) {
                msg = err.response.data.errors[0].msg;
            } else if (err?.response?.data?.message) {
                msg = err.response.data.message;
            }
            toast.error(msg);
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        width: `${60 + i * 30}px`, height: `${60 + i * 30}px`,
                        top: `${10 + i * 18}%`, left: `${5 + i * 8}%`,
                        animationDelay: `${i * 1.2}s`, animationDuration: `${5 + i}s`,
                    }} />
                ))}
            </div>

            <div className="auth-left">
                <div className="auth-branding">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                        <div style={{ width: 56, height: 56, background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, boxShadow: 'var(--shadow-glow)' }}>
                            <img src="/favicon.ico" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 32, fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: -0.5, lineHeight: 1 }}>Mana Karma</span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, opacity: 0.8 }}>Powered by GD Enterprises</span>
                        </div>
                    </div>
                    <h1 className="auth-headline">Start Your<br /><span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Financial Journey</span></h1>
                    <p className="auth-sub">Join thousands of users who've transformed their finances with AI-powered insights and smart budgeting tools.</p>
                    <div className="auth-features">
                        {[
                            { icon: '🆓', tag: 'Free to Start', desc: 'No credit card required' },
                            { icon: '📱', tag: 'Mobile Ready', desc: 'Access from any device' },
                            { icon: '🤖', tag: 'AI-Powered', desc: 'Smart categorization & insights' },
                        ].map(f => (
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
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                        <img src="/favicon.ico" alt="Mana Karma" style={{ width: 64, height: 64 }} />
                    </div>
                    <h2 className="auth-form-title text-center">Create Your Account</h2>
                    <p className="auth-form-sub text-center">Step {step} of 2 — {step === 1 ? 'Personal Info' : 'Confirm & Create'}</p>

                    {/* Step indicator */}
                    <div className="step-indicator" style={{ height: 4, gap: 6, marginBottom: 28 }}>
                        {[1, 2].map(s => (
                            <div key={s} className={`step-dot ${s < step ? 'done' : s === step ? 'active' : ''}`} />
                        ))}
                    </div>

                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="reg-fname">First Name <span className="required">*</span></label>
                                    <input id="reg-fname" className="form-input" placeholder="John" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                                    {errors.firstName && <span className="form-error">⚠ {errors.firstName}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="reg-lname">Last Name <span className="required">*</span></label>
                                    <input id="reg-lname" className="form-input" placeholder="Doe" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                                    {errors.lastName && <span className="form-error">⚠ {errors.lastName}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-email">Email Address <span className="required">*</span></label>
                                <input id="reg-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
                                {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-pw">Password <span className="required">*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input id="reg-pw" type={showPw ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} style={{ paddingRight: 44 }} />
                                    <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex' }}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <span className="form-error">⚠ {errors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-cpw">Confirm Password <span className="required">*</span></label>
                                <input id="reg-cpw" type="password" className="form-input" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                                {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
                            </div>

                            <button className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center', marginTop: 4 }} onClick={handleNext} id="reg-next">
                                Continue →
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="card" style={{ background: 'var(--color-surface-2)' }}>
                                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>Account Summary</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[['Name', `${form.firstName} ${form.lastName}`], ['Email', form.email]].map(([k, v]) => (
                                        <div key={k} className="flex-between">
                                            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{k}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <p style={{ fontSize: 13, color: 'var(--color-success)' }}>
                                    🔒 By creating an account, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and never sold.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Back</button>
                                <button
                                    id="reg-submit"
                                    className="btn btn-primary"
                                    style={{ flex: 2, justifyContent: 'center' }}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} />Creating...</> : <><UserPlus size={18} />Create Account</>}
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="auth-switch">
                        Already have an account? <a onClick={() => navigate('/login')}>Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
