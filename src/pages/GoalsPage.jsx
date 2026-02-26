import { useState } from 'react';
import { Target, Plus, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/formatCurrency';

export default function GoalsPage() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const locale = i18n.language === 'te' ? 'te-IN' : 'en-US';
    const currency = user?.income?.currency || 'USD';
    const [goals, setGoals] = useState([
        { id: 1, title: 'Emergency Fund', target: 5000, current: 1500, deadline: '2027-01-01', status: 'active' },
        { id: 2, title: 'New Car Downpayment', target: 8000, current: 8000, deadline: '2026-05-01', status: 'completed' },
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', target: '', current: 0, deadline: '' });

    const handleAddGoal = (e) => {
        e.preventDefault();
        setGoals([...goals, { ...newGoal, id: Date.now(), current: Number(newGoal.current), target: Number(newGoal.target), status: 'active' }]);
        setIsAdding(false);
        setNewGoal({ title: '', target: '', current: 0, deadline: '' });
    };

    return (
        <div className="page-container">
            <div className="page-header flex-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">{t('goals_title')}</h1>
                    <p className="page-subtitle">{t('goals_subtitle')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
                    <Plus size={16} /> {t('goals_new_goal')}
                </button>
            </div>

            {isAdding && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <h3 className="section-title mb-16">{t('goals_create_new')}</h3>
                    <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <label className="form-label">{t('goals_name_lbl')}</label>
                            <input type="text" className="form-input" required value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="e.g. Vacation" />
                        </div>
                        <div style={{ flex: '1 1 150px' }}>
                            <label className="form-label">{t('goals_target_amount')}</label>
                            <input type="number" className="form-input" required value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} placeholder="e.g. 2000" />
                        </div>
                        <div style={{ flex: '1 1 200px' }}>
                            <label className="form-label">{t('goals_target_date')}</label>
                            <input type="date" className="form-input" required value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} />
                        </div>
                        <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>{t('goals_cancel')}</button>
                            <button type="submit" className="btn btn-primary">{t('goals_save')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid-2">
                {goals.map(goal => {
                    const progress = Math.min(100, (goal.current / goal.target) * 100);
                    const isCompleted = progress >= 100;
                    return (
                        <div key={goal.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                            {isCompleted && <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: 'rgba(16, 185, 129, 0.1)', borderBottomLeftRadius: 60 }} />}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 142, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isCompleted ? <CheckCircle size={20} color="#10b981" /> : <Target size={20} color="#4f8ef7" />}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{goal.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>
                                            <Clock size={12} /> {t('goals_target_lbl')} {new Date(goal.deadline).toLocaleDateString(locale)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{t('goals_progress')}</span>
                                    <span style={{ fontWeight: 600, color: isCompleted ? '#10b981' : '#fff' }}>{formatCurrency(goal.current, currency, locale)} / {formatCurrency(goal.target, currency, locale)}</span>
                                </div>
                                <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: isCompleted ? '#10b981' : 'linear-gradient(90deg, #4f8ef7, #8b5cf6)', width: `${progress}%`, transition: 'width 1s ease' }} />
                                </div>
                            </div>

                            {!isCompleted && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    <button className="btn btn-secondary" style={{ flex: 1, padding: '8px 0', fontSize: 13 }} onClick={() => {
                                        setGoals(goals.map(g => g.id === goal.id ? { ...g, current: g.current + 100 } : g));
                                    }}>+ {formatCurrency(100, currency, locale)}</button>
                                    <button className="btn btn-secondary" style={{ flex: 1, padding: '8px 0', fontSize: 13 }} onClick={() => {
                                        setGoals(goals.map(g => g.id === goal.id ? { ...g, current: g.current + 500 } : g));
                                    }}>+ {formatCurrency(500, currency, locale)}</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
