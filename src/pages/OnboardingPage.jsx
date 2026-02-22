import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STEPS = ['Welcome', 'Income', 'Budget Limits', 'All Set!'];
const CATEGORIES = [
    { key: 'shopping', label: 'Shopping', icon: '🛍️' },
    { key: 'groceries', label: 'Groceries', icon: '🛒' },
    { key: 'gasAndFuel', label: 'Gas & Fuel', icon: '⛽' },
    { key: 'subscriptions', label: 'Subscriptions', icon: '📺' },
    { key: 'healthInsurance', label: 'Health Insurance', icon: '⚕️' },
    { key: 'carInsurance', label: 'Car Insurance', icon: '🚗' },
    { key: 'bills', label: 'Bills & Utilities', icon: '🏠' },
    { key: 'food', label: 'Food & Dining', icon: '🍔' },
    { key: 'movies', label: 'Movies & Entertainment', icon: '🎟️' },
    { key: 'savings', label: 'Savings & Investments', icon: '🏦' },
    { key: 'others', label: 'Others', icon: '📦' },
];

export default function OnboardingPage() {
    const { user, updateUser } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [income, setIncome] = useState({
        monthly: '',
        currency: 'USD',
        jobTitle: '',
        employer: '',
    });
    const [budgetLimits, setBudgetLimits] = useState({
        shopping: '', groceries: '', gasAndFuel: '', subscriptions: '',
        healthInsurance: '', carInsurance: '', bills: '', food: '', movies: '', savings: '', others: '',
    });

    const handleComplete = async () => {
        setLoading(true);
        try {
            const monthly = parseFloat(income.monthly) || 0;
            const payload = {
                income: {
                    monthly,
                    annual: monthly * 12,
                    currency: income.currency,
                    jobTitle: income.jobTitle,
                    employer: income.employer,
                },
                budgetLimits: Object.fromEntries(
                    Object.entries(budgetLimits).map(([k, v]) => [k, parseFloat(v) || 0])
                ),
                onboardingComplete: true,
            };
            const { data } = await api.put('/users/profile', payload);
            updateUser(data.user);
            toast.success('Profile setup complete! 🎉');
        } catch (err) {
            toast.error('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-page">
            {/* Background effects */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 30% 40%, rgba(79,142,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(124,58,237,0.12) 0%, transparent 60%)',
                pointerEvents: 'none',
            }} />

            <div className="onboarding-card">
                {/* Step indicators */}
                <div className="step-indicator">
                    {STEPS.map((s, i) => (
                        <div key={s} className={`step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} title={s} />
                    ))}
                </div>

                {/* Step 0: Welcome */}
                {step === 0 && (
                    <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <div style={{ fontSize: 64, marginBottom: 8 }}>👋</div>
                        <h2 style={{ fontSize: 30, fontWeight: 900 }}>Welcome, {user?.firstName}!</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 16, maxWidth: 400, lineHeight: 1.7 }}>
                            Let's set up your financial profile in just a couple of steps. This helps Mana Karma give you personalized insights and recommendations.
                        </p>
                        <div className="card" style={{ background: 'var(--gradient-card)', borderColor: 'rgba(79,142,247,0.3)', maxWidth: 380, width: '100%', marginTop: 8 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[['💰', 'Enter your monthly income'], ['📊', 'Set spending budget limits'], ['🚀', 'Get AI-powered insights instantly']].map(([icon, text]) => (
                                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                                        <span style={{ fontSize: 20 }}>{icon}</span>
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg" id="ob-start" onClick={() => setStep(1)} style={{ marginTop: 8 }}>
                            Let's Get Started →
                        </button>
                    </div>
                )}

                {/* Step 1: Income */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>💰 Your Income</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>This helps us calculate your savings rate and give smart recommendations.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Monthly Income <span className="required">*</span></label>
                                <div className="input-group">
                                    <span className="input-prefix">$</span>
                                    <input
                                        className="form-input"
                                        type="number"
                                        placeholder="e.g. 5000"
                                        value={income.monthly}
                                        onChange={e => setIncome(p => ({ ...p, monthly: e.target.value }))}
                                        id="ob-income"
                                    />
                                </div>
                                {income.monthly && <span className="form-hint">Annual: ~${(parseFloat(income.monthly) * 12).toLocaleString()}/year</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Job Title</label>
                                    <input className="form-input" placeholder="e.g. Software Engineer" value={income.jobTitle} onChange={e => setIncome(p => ({ ...p, jobTitle: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Employer</label>
                                    <input className="form-input" placeholder="e.g. Google" value={income.employer} onChange={e => setIncome(p => ({ ...p, employer: e.target.value }))} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Currency</label>
                                <select className="form-select" value={income.currency} onChange={e => setIncome(p => ({ ...p, currency: e.target.value }))}>
                                    <option value="USD">USD — US Dollar</option>
                                    <option value="EUR">EUR — Euro</option>
                                    <option value="GBP">GBP — British Pound</option>
                                    <option value="CAD">CAD — Canadian Dollar</option>
                                    <option value="AUD">AUD — Australian Dollar</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
                            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} id="ob-income-next"
                                onClick={() => {
                                    if (!income.monthly) { toast.error('Please enter your monthly income'); return; }
                                    setStep(2);
                                }}>
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Budget Limits */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>📊 Budget Limits</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                                Set monthly spending limits per category (optional). Leave blank to track without limits.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
                            {CATEGORIES.map(({ key, label, icon }) => (
                                <div key={key} className="form-group">
                                    <label className="form-label">{icon} {label}</label>
                                    <div className="input-group">
                                        <span className="input-prefix">$</span>
                                        <input
                                            className="form-input"
                                            type="number"
                                            placeholder="No limit"
                                            value={budgetLimits[key]}
                                            onChange={e => setBudgetLimits(p => ({ ...p, [key]: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn btn-primary" id="ob-budget-next" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(3)}>
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Done */}
                {step === 3 && (
                    <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                        <div style={{ fontSize: 72 }}>🎉</div>
                        <h2 style={{ fontSize: 28, fontWeight: 900 }}>You're All Set!</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, maxWidth: 380, lineHeight: 1.7 }}>
                            Your profile is configured. Start by uploading a bank statement to get your first AI-powered financial analysis.
                        </p>
                        <div className="card" style={{ background: 'var(--gradient-card)', width: '100%', maxWidth: 360 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                                <div className="flex-between">
                                    <span style={{ color: 'var(--color-text-muted)' }}>Monthly Income</span>
                                    <strong>${parseFloat(income.monthly || 0).toLocaleString()}</strong>
                                </div>
                                <div className="flex-between">
                                    <span style={{ color: 'var(--color-text-muted)' }}>Savings Goal</span>
                                    <strong>${(parseFloat(income.monthly || 0) * 0.2).toLocaleString()} (20%)</strong>
                                </div>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary btn-lg"
                            id="ob-complete"
                            onClick={handleComplete}
                            disabled={loading}
                            style={{ marginTop: 8 }}
                        >
                            {loading ? <><div className="spinner" style={{ width: 20, height: 20 }} />Saving...</> : '🚀 Launch Dashboard'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
