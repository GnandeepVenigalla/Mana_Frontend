import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Trash2, Edit2, Check, X } from 'lucide-react';

const CATEGORIES = [
    { key: 'shopping', label: 'Shopping', icon: '🛍️' },
    { key: 'groceries', label: 'Groceries', icon: '🛒' },
    { key: 'gasAndFuel', label: 'Gas & Fuel', icon: '⛽' },
    { key: 'subscriptions', label: 'Subscriptions', icon: '📺' },
    { key: 'healthInsurance', label: 'Health Insurance', icon: '⚕️' },
    { key: 'carInsurance', label: 'Car Insurance', icon: '🚗' },
    { key: 'bills', label: 'Bills', icon: '🏠' },
    { key: 'food', label: 'Food & Dining', icon: '🍔' },
    { key: 'movies', label: 'Movies & Entertainment', icon: '🎟️' },
    { key: 'savings', label: 'Savings', icon: '🏦' },
    { key: 'income', label: 'Income', icon: '💰' },
    { key: 'others', label: 'Others', icon: '📦' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CAT_ICONS = { shopping: '🛍️', groceries: '🛒', gasAndFuel: '⛽', subscriptions: '📺', healthInsurance: '⚕️', carInsurance: '🚗', bills: '🏠', food: '🍔', movies: '🎟️', savings: '🏦', income: '💰', transfer: '🔄', others: '📦' };
const CAT_LABELS = { shopping: 'Shopping', groceries: 'Groceries', gasAndFuel: 'Gas & Fuel', subscriptions: 'Subscriptions', healthInsurance: 'Health Insurance', carInsurance: 'Car Insurance', bills: 'Bills', food: 'Food', movies: 'Movies', savings: 'Savings', income: 'Income', transfer: 'Transfer', others: 'Others' };

const now = new Date();

function TransactionModal({ onClose, onSave, editTx }) {
    const [form, setForm] = useState(editTx ? {
        date: new Date(editTx.date).toISOString().split('T')[0],
        description: editTx.description,
        amount: Math.abs(editTx.amount),
        type: editTx.type,
        category: editTx.category,
        notes: editTx.notes || '',
    } : {
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        category: 'others',
        notes: '',
    });

    const handleSave = async () => {
        if (!form.description || !form.amount) { toast.error('Description and amount required'); return; }

        const payload = { ...form, amount: form.type === 'expense' ? -Math.abs(form.amount) : Math.abs(form.amount) };

        try {
            if (editTx) {
                const { data } = await api.put(`/transactions/${editTx._id}`, payload);
                toast.success('Transaction updated!');
                onSave(data.transaction);
            } else {
                const { data } = await api.post('/transactions', payload);
                toast.success('Transaction added!');
                onSave(data.transaction);
            }
        } catch (err) {
            toast.error(editTx ? 'Failed to update transaction' : 'Failed to add transaction');
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="flex-between mb-20">
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{editTx ? 'Edit Transaction' : 'Add Transaction'}</h3>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Type toggle */}
                    <div className="period-tabs">
                        {['expense', 'income'].map(t => (
                            <button key={t} className={`period-tab ${form.type === t ? 'active' : ''}`} style={{ flex: 1 }}
                                onClick={() => setForm(p => ({ ...p, type: t, category: t === 'income' ? 'income' : 'others' }))}>
                                {t === 'expense' ? '💸 Expense' : '💰 Income'}
                            </button>
                        ))}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input type="date" className="form-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description <span className="required">*</span></label>
                        <input className="form-input" placeholder="e.g. Starbucks Coffee" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Amount <span className="required">*</span></label>
                        <div className="input-group">
                            <span className="input-prefix">$</span>
                            <input type="number" className="form-input" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                        </div>
                    </div>
                    {form.type === 'expense' && (
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                {CATEGORIES.filter(c => c.key !== 'income').map(c => (
                                    <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <input className="form-input" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>{editTx ? 'Save Changes' : 'Add Transaction'}</button>
                </div>
            </div>
        </div>
    );
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterType, setFilterType] = useState('');
    const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
    const [selYear, setSelYear] = useState(now.getFullYear());
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ month: selMonth, year: selYear, page, limit: 20 });
            if (filterCat) params.set('category', filterCat);
            if (filterType) params.set('type', filterType);
            const { data } = await api.get(`/transactions?${params}`);
            setTransactions(data.transactions || []);
            setTotal(data.total || 0);
        } catch (err) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [selMonth, selYear, filterCat, filterType, page]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Deleted');
            load();
        } catch { toast.error('Failed to delete'); }
    };

    const filtered = transactions.filter(tx =>
        !search || tx.description.toLowerCase().includes(search.toLowerCase()) || (tx.merchant || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    return (
        <div className="page-container">
            <div className="page-header flex-stack" style={{ marginBottom: 28 }}>
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-subtitle">{total} transactions · {MONTHS[selMonth - 1]} {selYear}</p>
                </div>
                <button className="btn btn-primary btn-sm w-full-mobile" id="add-tx-btn" onClick={() => { setEditingTx(null); setShowModal(true); }}>
                    <Plus size={16} /> Add Transaction
                </button>
            </div>

            {/* Summary mini-cards */}
            <div className="grid-stack dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Income', value: totalIncome, color: 'var(--color-success)', icon: '💰' },
                    { label: 'Total Expenses', value: totalExpenses, color: 'var(--color-danger)', icon: '💸' },
                    { label: 'Net', value: totalIncome - totalExpenses, color: totalIncome - totalExpenses >= 0 ? 'var(--color-success)' : 'var(--color-danger)', icon: '📊' },
                ].map(c => (
                    <div key={c.label} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 24 }}>{c.icon}</span>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>${Math.abs(c.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card card-sm mb-20 filter-grid">
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input className="form-input" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, width: '100%' }} />
                </div>

                <select className="form-select" value={selMonth} onChange={e => { setSelMonth(parseInt(e.target.value)); setPage(1); }}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>

                <select className="form-select" value={selYear} onChange={e => { setSelYear(parseInt(e.target.value)); setPage(1); }}>
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                <select className="form-select" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                </select>

                <select className="form-select" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
                    <option value="">All Types</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />)}
                </div>
            ) : filtered.length > 0 ? (
                <div className="table-container">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>DATE</th>
                                    <th>DESCRIPTION</th>
                                    <th>CATEGORY</th>
                                    <th>TYPE</th>
                                    <th style={{ textAlign: 'right' }}>AMOUNT</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(tx => (
                                    <tr key={tx._id}>
                                        <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{tx.description}</div>
                                            {tx.notes && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{tx.notes}</div>}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${tx.category === 'gasAndFuel' ? 'gas' : tx.category}`}>
                                                {CAT_ICONS[tx.category]} {CAT_LABELS[tx.category] || tx.category}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`tag ${tx.type === 'income' ? 'tag-green' : 'tag-red'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                            {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingTx(tx); setShowModal(true); }} style={{ color: 'var(--color-primary)' }}>
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(tx._id)} style={{ color: 'var(--color-danger)' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="empty-state card">
                    <div className="empty-icon">💳</div>
                    <div className="empty-title">No Transactions Found</div>
                    <p className="empty-desc">No transactions match your filters. Try adjusting the month or category filter.</p>
                    <button className="btn btn-primary btn-sm" onClick={() => { setEditingTx(null); setShowModal(true); }}><Plus size={14} /> Add Manually</button>
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                    <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
                        Page {page} of {Math.ceil(total / 20)}
                    </span>
                    <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            )}

            {showModal && <TransactionModal editTx={editingTx} onClose={() => { setShowModal(false); setEditingTx(null); }} onSave={() => { setShowModal(false); setEditingTx(null); load(); }} />}
        </div>
    );
}
