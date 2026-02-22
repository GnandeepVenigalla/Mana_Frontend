import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { User, Settings, Lock, Save, DollarSign, Target, Briefcase, CreditCard } from 'lucide-react';

const CATEGORIES = [
    { id: 'shopping', label: 'Shopping' },
    { id: 'groceries', label: 'Groceries' },
    { id: 'gasAndFuel', label: 'Gas & Fuel' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'healthInsurance', label: 'Health Insurance' },
    { id: 'carInsurance', label: 'Car Insurance' },
    { id: 'bills', label: 'Bills & Utilities' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'movies', label: 'Movies & Entertainment' },
    { id: 'savings', label: 'Savings & Investments' },
    { id: 'others', label: 'Others' }
];

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState('general');

    // General state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        incomeMonthly: 0,
        jobTitle: '',
        savingsGoal: 0,
        creditScore: 0,
    });

    // Budgets state
    const [budgets, setBudgets] = useState({
        shopping: 0,
        groceries: 0,
        gasAndFuel: 0,
        subscriptions: 0,
        healthInsurance: 0,
        carInsurance: 0,
        bills: 0,
        food: 0,
        movies: 0,
        savings: 0,
        others: 0
    });

    // Password state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Initialize from user data
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                incomeMonthly: user.income?.monthly || 0,
                jobTitle: user.income?.jobTitle || '',
                savingsGoal: user.savingsGoal || 0,
                creditScore: user.creditScore || 0,
            });
            if (user.budgetLimits) {
                setBudgets({
                    ...budgets,
                    ...user.budgetLimits
                });
            }
        }
    }, [user]);

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                income: {
                    monthly: parseFloat(formData.incomeMonthly),
                    jobTitle: formData.jobTitle,
                },
                savingsGoal: parseFloat(formData.savingsGoal),
                creditScore: parseFloat(formData.creditScore)
            };
            const res = await api.put('/users/profile', payload);
            updateUser(res.data.user);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleBudgetsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const numericBudgets = {};
            for (const key in budgets) numericBudgets[key] = parseFloat(budgets[key]) || 0;

            const res = await api.put('/users/profile', { budgetLimits: numericBudgets });
            updateUser(res.data.user);
            toast.success('Budget limits updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update budgets');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await api.put('/users/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password updated successfully');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div className="page-header mb-32">
                <h1 className="page-title">Profile Settings</h1>
                <p className="page-subtitle">Manage your account, financial goals, and budgets.</p>
            </div>

            <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'start' }}>
                {/* Sidebar */}
                <div className="card" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, marginBottom: 24, padding: '0 8px' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7 0%, #8b5cf6 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700,
                            flexShrink: 0, boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                        }}>
                            {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                        </div>
                        <div style={{ width: '100%' }}>
                            <div style={{ fontWeight: 700, fontSize: 18, color: '#fff', lineHeight: 1.2 }}>{formData.firstName} {formData.lastName}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis' }}>{formData.email}</div>
                        </div>
                    </div>

                    <button
                        className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, textAlign: 'left', fontWeight: 500, background: activeTab === 'general' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'general' ? '#fff' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <User size={18} /> General
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('budgets')}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, textAlign: 'left', fontWeight: 500, background: activeTab === 'budgets' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'budgets' ? '#fff' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <Target size={18} /> Budget Limits
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, textAlign: 'left', fontWeight: 500, background: activeTab === 'security' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'security' ? '#fff' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <Lock size={18} /> Security
                    </button>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {activeTab === 'general' && (
                        <div className="card">
                            <form onSubmit={handleGeneralSubmit}>
                                <h3 className="section-title mb-24">Personal Information</h3>
                                <div className="grid-2 mb-24">
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input type="text" className="form-input" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input type="text" className="form-input" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="form-group mb-32">
                                    <label className="form-label">Email Address (Cannot be changed)</label>
                                    <input type="email" className="form-input" value={formData.email} disabled style={{ opacity: 0.6 }} />
                                </div>

                                <h3 className="section-title mb-24">Financial Details</h3>
                                <div className="grid-2 mb-24">
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={15} /> Monthly Income</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--color-text-muted)' }}>$</span>
                                            <input type="number" className="form-input" style={{ paddingLeft: 30 }} value={formData.incomeMonthly} onChange={e => setFormData({ ...formData, incomeMonthly: e.target.value })} required min="0" step="100" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={15} /> Job Title / Income Source</label>
                                        <input type="text" className="form-input" value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="e.g. Software Engineer" />
                                    </div>
                                </div>
                                <div className="form-group mb-32">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Target size={15} /> Monthly Savings Goal</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--color-text-muted)' }}>$</span>
                                        <input type="number" className="form-input" style={{ paddingLeft: 30 }} value={formData.savingsGoal} onChange={e => setFormData({ ...formData, savingsGoal: e.target.value })} min="0" step="50" />
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>Target amount you wish to save each month.</p>
                                </div>

                                <h3 className="section-title mb-24">Credit Profile</h3>
                                <div className="form-group mb-32">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CreditCard size={15} /> Current Credit Score</label>
                                    <input type="number" className="form-input" value={formData.creditScore} onChange={e => setFormData({ ...formData, creditScore: e.target.value })} min="300" max="850" placeholder="e.g. 720" />
                                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>Enter your current credit score to receive tailored insights and recommendations.</p>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'budgets' && (
                        <div className="card">
                            <form onSubmit={handleBudgetsSubmit}>
                                <div className="flex-between mb-24">
                                    <h3 className="section-title mb-0">Monthly Category Budgets</h3>
                                </div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>
                                    Set limit alerts for each category. If your spending exceeds these limits, your financial score may decrease and you'll receive warnings.
                                </p>

                                <div className="grid-2 mb-32">
                                    {CATEGORIES.map(cat => (
                                        <div key={cat.id} className="form-group">
                                            <label className="form-label">{cat.label}</label>
                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--color-text-muted)' }}>$</span>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ paddingLeft: 30 }}
                                                    value={budgets[cat.id]}
                                                    onChange={e => setBudgets({ ...budgets, [cat.id]: e.target.value })}
                                                    min="0" step="10"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <Save size={16} /> {loading ? 'Saving...' : 'Update Budgets'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="card">
                            <form onSubmit={handlePasswordSubmit}>
                                <h3 className="section-title mb-24">Update Password</h3>
                                <div className="form-group mb-20">
                                    <label className="form-label">Current Password</label>
                                    <input type="password" className="form-input" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required minLength="6" />
                                </div>
                                <div className="form-group mb-20">
                                    <label className="form-label">New Password</label>
                                    <input type="password" className="form-input" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength="6" />
                                </div>
                                <div className="form-group mb-32">
                                    <label className="form-label">Confirm New Password</label>
                                    <input type="password" className="form-input" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} required minLength="6" />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <Lock size={16} /> {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
