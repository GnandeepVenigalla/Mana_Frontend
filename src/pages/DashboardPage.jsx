import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Upload, Plus, ArrowRight } from 'lucide-react';

const CATEGORY_COLORS = {
    shopping: '#8b5cf6',
    groceries: '#22c55e',
    gasAndFuel: '#f59e0b',
    subscriptions: '#ec4899',
    healthInsurance: '#10b981',
    carInsurance: '#3b82f6',
    bills: '#0ea5e9',
    food: '#f97316',
    movies: '#8b5cf6',
    savings: '#fbbf24',
    income: '#10b981',
    transfer: '#94a3b8',
    others: '#64748b',
};

const CATEGORY_LABELS = {
    shopping: 'Shopping', groceries: 'Groceries', gasAndFuel: 'Gas & Fuel',
    subscriptions: 'Subscriptions', healthInsurance: 'Health Insurance', carInsurance: 'Car Insurance',
    bills: 'Bills', food: 'Food', movies: 'Movies & Entertainment', savings: 'Savings', income: 'Income',
    transfer: 'Transfer', others: 'Others',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ScoreRing({ score, title = "Score" }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const maxScore = 850;
    const minScore = 300;
    const pct = (score - minScore) / (maxScore - minScore);
    const offset = circumference * (1 - pct);
    const color = score >= 750 ? '#10b981' : score >= 650 ? '#4f8ef7' : score >= 550 ? '#f59e0b' : '#ef4444';
    const rating = score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : score >= 550 ? 'Fair' : 'Poor';

    return (
        <div className="score-ring-container">
            <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                <circle
                    cx="70" cy="70" r={radius} fill="none"
                    stroke={color} strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="70" y="65" textAnchor="middle" fill="white" fontSize="22" fontWeight="800">{score}</text>
                <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">{title}</text>
            </svg>
            <span className={`score-rating ${rating.toLowerCase()}`}>{rating}</span>
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <div className="label">{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, fontSize: 13 }}>
                    {p.name}: <strong>${p.value?.toLocaleString('en-US', { minimumFractionDigits: 0 })}</strong>
                </div>
            ))}
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    const [summary, setSummary] = useState(null);
    const [insights, setInsights] = useState(null);
    const [recentTx, setRecentTx] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [sumRes, insRes, txRes] = await Promise.all([
                    api.get(`/transactions/summary?month=${month}&year=${year}`),
                    api.get(`/insights?month=${month}&year=${year}`),
                    api.get(`/transactions?month=${month}&year=${year}&limit=5`),
                ]);
                setSummary(sumRes.data);
                setInsights(insRes.data.insight);
                setRecentTx(txRes.data.transactions || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [month, year]);

    const income = summary?.totalIncome || user?.income?.monthly || 0;
    const expenses = summary?.totalExpenses || 0;
    const savings = income - expenses;
    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;
    const score = insights?.scoreData?.financialScore || 0;

    const pieData = (summary?.categoryBreakdown || [])
        .filter(c => c._id !== 'income' && c.total > 0)
        .map(c => ({ name: CATEGORY_LABELS[c._id] || c._id, value: parseFloat(c.total.toFixed(2)), color: CATEGORY_COLORS[c._id] || '#64748b' }));

    const trendData = (summary?.monthlyTrend || []).map(m => ({
        name: m.label,
        Income: parseFloat(m.income.toFixed(0)),
        Expenses: parseFloat(m.expenses.toFixed(0)),
        Savings: parseFloat(Math.max(0, m.income - m.expenses).toFixed(0)),
    }));

    const topInsights = (insights?.insights || []).slice(0, 3);

    if (loading) {
        return (
            <div className="page-container">
                <div className="grid-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 28 }}>
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
                </div>
                <div className="grid-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {[...Array(2)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 16 }} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ overflowX: 'hidden' }}>
            {/* Header */}
            <div className="page-header flex-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName}! 👋</h1>
                    <p className="page-subtitle">{MONTHS[month - 1]} {year} Financial Overview</p>
                </div>
                <div className="w-full-mobile" style={{ display: 'flex', gap: 12 }}>
                    <select className="form-input" style={{ flex: 1, height: 38 }} value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select className="form-input" style={{ flex: 1, height: 38 }} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                        {[now.getFullYear(), now.getFullYear() - 1].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid-4 dashboard-stats mb-24">
                <div className="stat-card">
                    <div className="stat-icon blue"><DollarSign size={22} color="#4f8ef7" /></div>
                    <div>
                        <div className="stat-label">Monthly Income</div>
                        <div className="stat-value">${income.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
                        <div className="stat-change up"><TrendingUp size={12} />{user?.income?.jobTitle || 'Total'}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon red"><TrendingDown size={22} color="#ef4444" /></div>
                    <div>
                        <div className="stat-label">Total Expenses</div>
                        <div className="stat-value" style={{ color: expenses > income ? 'var(--color-danger)' : 'inherit' }}>
                            ${expenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </div>
                        <div className="stat-change down">
                            {income > 0 ? `${((expenses / income) * 100).toFixed(1)}% of income` : 'No income set'}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green"><PiggyBank size={22} color="#10b981" /></div>
                    <div>
                        <div className="stat-label">Net Savings</div>
                        <div className="stat-value" style={{ color: savings >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {savings >= 0 ? '+' : ''}{savings.toLocaleString('en-US', { minimumFractionDigits: 0, style: 'currency', currency: 'USD' })}
                        </div>
                        <div className={`stat-change ${savings >= 0 ? 'up' : 'down'}`}>
                            {savings >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {savingsRate}% savings rate
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <span style={{ fontSize: 22 }}>📊</span>
                    </div>
                    <div>
                        <div className="stat-label">Financial Score</div>
                        <div className="stat-value" style={{ color: score >= 700 ? 'var(--color-success)' : score >= 550 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                            {score || '—'}
                        </div>
                        <div className="stat-change up">{insights?.scoreData?.spendingHealth || 'N/A'} spending health</div>
                    </div>
                </div>
            </div>

            {/* Charts row */}
            <div className="grid-2 mb-24">
                {/* Trend chart */}
                <div className="card">
                    <div className="flex-between mb-16">
                        <h3 className="section-title" style={{ marginBottom: 0 }}>Income vs Expenses</h3>
                        <div className="period-tabs">
                            <button className="period-tab active">6M</button>
                        </div>
                    </div>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="99%" height={220}>
                            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="Income" stroke="#4f8ef7" fill="url(#incGrad)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                            <div className="empty-icon">📈</div>
                            <div className="empty-title">No Trend Data Yet</div>
                            <p className="empty-desc">Upload a statement to see your spending trends over time.</p>
                        </div>
                    )}
                </div>

                {/* Pie chart */}
                <div className="card">
                    <div className="flex-between mb-16">
                        <h3 className="section-title" style={{ marginBottom: 0 }}>Spending Breakdown</h3>
                        <span className="tag tag-blue">{MONTHS[month - 1]} {year}</span>
                    </div>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="99%" height={320}>
                            <PieChart margin={{ top: 0, bottom: 20 }}>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    innerRadius={Math.min(60, window.innerWidth / 6)}
                                    outerRadius={Math.min(95, window.innerWidth / 4)}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, name]} contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} itemStyle={{ color: '#ffffff' }} />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{ paddingTop: '20px', fontSize: 10 }}
                                    formatter={v => <span style={{ color: 'var(--color-text-muted)' }}>{v}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                            <div className="empty-icon">🥧</div>
                            <div className="empty-title">No Expense Data</div>
                            <p className="empty-desc">Upload your bank statement to see spending categories.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Insights and Recent Transactions */}
            <div className="grid-2">
                {/* AI Insights preview */}
                <div className="card">
                    <div className="flex-between mb-16">
                        <h3 className="section-title" style={{ marginBottom: 0 }}>💡 AI Insights</h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/insights')} style={{ gap: 4 }}>
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    {topInsights.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {topInsights.map((insight, i) => (
                                <div key={i} className={`insight-card ${insight.type}`}>
                                    <div className="insight-icon">
                                        {insight.type === 'positive' ? '🏆' :
                                            insight.type === 'warning' ? '⚠️' :
                                                insight.type === 'unusual_expense' ? '📈' :
                                                    insight.type === 'investment' ? '💹' : '💡'}
                                    </div>
                                    <div>
                                        <div className="insight-title">{insight.title}</div>
                                        <div className="insight-message" style={{ fontSize: 12 }}>
                                            {insight.message.substring(0, 100)}...
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '30px 0' }}>
                            <div className="empty-icon">🤖</div>
                            <div className="empty-title">No Insights Yet</div>
                            <p className="empty-desc">AI insights generate automatically after uploading a statement.</p>
                        </div>
                    )}

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-around' }}>
                        {score > 0 && (
                            <ScoreRing score={score} title="Health" />
                        )}
                        {user?.creditScore > 0 && (
                            <ScoreRing score={user.creditScore} title="Credit" />
                        )}
                    </div>
                </div>

                {/* Recent transactions */}
                <div className="card">
                    <div className="flex-between mb-16">
                        <h3 className="section-title" style={{ marginBottom: 0 }}>Recent Transactions</h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')} style={{ gap: 4 }}>
                            View All <ArrowRight size={14} />
                        </button>
                    </div>
                    {recentTx.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {recentTx.map((tx) => (
                                <div key={tx._id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)', gap: 12 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: tx.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18, flexShrink: 0,
                                    }}>
                                        {tx.category === 'food' ? '🍔' : tx.category === 'movies' ? '🎟️' : tx.category === 'savings' ? '🏦' : tx.category === 'transfer' ? '🔄' : tx.category === 'groceries' ? '🛒' : tx.category === 'shopping' ? '🛍️' : tx.category === 'gasAndFuel' ? '⛽' : tx.category === 'subscriptions' ? '📺' : tx.category === 'bills' ? '🏠' : tx.category === 'healthInsurance' ? '⚕️' : tx.category === 'carInsurance' ? '🚗' : tx.type === 'income' ? '💰' : '💳'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {CATEGORY_LABELS[tx.category] || tx.category}</div>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)', flexShrink: 0 }}>
                                        {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '30px 0' }}>
                            <div className="empty-icon">💳</div>
                            <div className="empty-title">No Transactions Yet</div>
                            <p className="empty-desc">Upload a statement or add transactions manually.</p>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/statements')}>
                                <Upload size={14} /> Upload Statement
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
