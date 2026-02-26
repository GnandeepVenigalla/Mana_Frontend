import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { Lightbulb, TrendingUp, AlertTriangle, RefreshCw, Target, Shield, Trophy, Activity, RefreshCcw } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ScoreGauge({ score }) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const maxScore = 850;
    const minScore = 300;
    const pct = (score - minScore) / (maxScore - minScore);
    const offset = circumference * (1 - pct);
    const color = score >= 750 ? '#10b981' : score >= 650 ? '#4f8ef7' : score >= 550 ? '#f59e0b' : '#ef4444';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                <circle
                    cx="80" cy="80" r={radius} fill="none"
                    stroke={color} strokeWidth="14"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }}
                />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Score</div>
            </div>
        </div>
    );
}

export default function InsightsPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadInsights = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/insights?month=${month}&year=${year}`);
            setData(res.data.insight);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await api.post(`/insights/refresh`, { month, year });
            setData(res.data.insight);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, [month, year]);

    if (loading && !data) {
        return (
            <div className="page-container">
                <div className="skeleton" style={{ height: 100, borderRadius: 16, marginBottom: 24 }} />
                <div className="grid-2">
                    <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
                    <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
                </div>
            </div>
        );
    }

    const { insights = [], scoreData = {}, investmentSuggestions = [] } = data || {};

    const renderIcon = (type) => {
        switch (type) {
            case 'positive': return <Trophy size={20} color="#10b981" />;
            case 'warning': return <AlertTriangle size={20} color="#ef4444" />;
            case 'saving_tip': return <Target size={20} color="#4f8ef7" />;
            case 'unusual_expense': return <Activity size={20} color="#f59e0b" />;
            case 'investment': return <TrendingUp size={20} color="#8b5cf6" />;
            default: return <Lightbulb size={20} color="#06b6d4" />;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header flex-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">{t('insight_title')}</h1>
                    <p className="page-subtitle">{t('insight_subtitle')} {MONTHS[month - 1]} {year}</p>
                </div>
                <div className="flex-stack" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                        <select className="form-input" style={{ flex: 1 }} value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                            {MONTHS.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select className="form-input" style={{ flex: 1 }} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                            {[now.getFullYear(), now.getFullYear() - 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing} style={{ width: '100%', justifyContent: 'center' }}>
                        <RefreshCcw size={16} className={refreshing ? 'spin' : ''} />
                        {refreshing ? t('insight_analyzing') : t('insight_refresh')}
                    </button>
                </div>
            </div>

            {!data ? (
                <div className="empty-state card">
                    <div className="empty-icon">🤖</div>
                    <div className="empty-title">{t('insight_empty_title')}</div>
                    <p className="empty-desc">{t('insight_empty_desc')}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Score section */}
                    <div className="card flex-stack" style={{ display: 'flex', gap: 40, alignItems: 'center', textAlign: 'center', background: 'linear-gradient(145deg, var(--color-surface) 0%, rgba(30,41,59,0.5) 100%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <ScoreGauge score={scoreData?.financialScore || 0} />
                        </div>
                        <div style={{ flex: 1, width: '100%' }}>
                            <h2 className="text-center-mobile" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#fff' }}>
                                {t('insight_health_is')} {scoreData?.spendingHealth ? t(scoreData.spendingHealth, scoreData.spendingHealth.charAt(0).toUpperCase() + scoreData.spendingHealth.slice(1)) : t('insight_unknown')}
                            </h2>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                                {t('insight_score_desc_1')} <strong>{scoreData?.savingsRate}%</strong> {t('insight_score_desc_2')}
                            </p>
                            <div className="flex-stack" style={{ display: 'flex', gap: 12 }}>
                                <div className="stat-card" style={{ flex: 1, padding: '16px 20px', background: 'rgba(0,0,0,0.2)' }}>
                                    <div className="stat-label">{t('insight_savings_rate')}</div>
                                    <div className="stat-value">{scoreData?.savingsRate}%</div>
                                </div>
                                <div className="stat-card" style={{ flex: 1, padding: '16px 20px', background: 'rgba(0,0,0,0.2)' }}>
                                    <div className="stat-label">{t('insight_health_status')}</div>
                                    <div className="stat-value" style={{ textTransform: 'capitalize' }}>{scoreData?.spendingHealth ? t(scoreData.spendingHealth, scoreData.spendingHealth) : t('insight_unknown')}</div>
                                </div>
                                {user?.creditScore > 0 && (
                                    <div className="stat-card" style={{ flex: 1, padding: '16px 20px', background: 'rgba(0,0,0,0.2)' }}>
                                        <div className="stat-label">{t('insight_credit_score')}</div>
                                        <div className="stat-value">{user.creditScore}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid-2">
                        {/* Highlights & Alerts */}
                        <div className="card">
                            <h3 className="section-title mb-16" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertTriangle size={18} color="#f59e0b" /> {t('insight_alerts_title')}
                            </h3>
                            {insights.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {insights.map((insight, idx) => (
                                        <div key={idx} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 16 }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                background: insight.type === 'positive' ? 'rgba(16,185,129,0.1)' :
                                                    insight.type === 'warning' ? 'rgba(239,68,68,0.1)' :
                                                        insight.type === 'saving_tip' ? 'rgba(79,142,247,0.1)' : 'rgba(245,158,11,0.1)'
                                            }}>
                                                {renderIcon(insight.type)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{insight.title}</div>
                                                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{insight.message}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--color-text-muted)' }}>{t('insight_no_alerts')}</p>
                            )}
                        </div>

                        {/* Investments */}
                        <div className="card">
                            <h3 className="section-title mb-16" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <TrendingUp size={18} color="#8b5cf6" /> {t('insight_investment_title')}
                            </h3>
                            {investmentSuggestions && investmentSuggestions.length > 0 ? (
                                <div>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 16 }}>
                                        {t('insight_investment_desc')}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {investmentSuggestions.map((inv, idx) => (
                                            <div key={idx} style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(139,92,246,0.2)', background: 'linear-gradient(90deg, rgba(139,92,246,0.05) 0%, transparent 100%)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                    <div style={{ fontWeight: 600, color: '#fff' }}>{inv.name}</div>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                                                        {inv.expectedReturn}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>{inv.description}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{t('insight_suggested_allocation')} <strong>${(inv.amount || 0).toFixed(0)}</strong></span>
                                                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                                                    <span style={{ color: inv.riskLevel === 'low' ? '#10b981' : inv.riskLevel === 'medium' ? '#f59e0b' : '#ef4444', textTransform: 'capitalize' }}>
                                                        {inv.riskLevel} {t('insight_risk')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '40px 0' }}>
                                    <div className="empty-icon">🌱</div>
                                    <div className="empty-title">{t('insight_increase_savings')}</div>
                                    <p className="empty-desc">{t('insight_increase_savings_desc')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
