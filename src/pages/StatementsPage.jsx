import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, Trash2, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const now = new Date();

function StatusBadge({ status }) {
    const configs = {
        pending: { color: 'tag-yellow', label: 'Pending', Icon: Clock },
        processing: { color: 'tag-blue', label: 'Processing', Icon: RefreshCw },
        processed: { color: 'tag-green', label: 'Processed', Icon: CheckCircle },
        failed: { color: 'tag-red', label: 'Failed', Icon: XCircle },
    };
    const { color, label, Icon } = configs[status] || configs.pending;
    return (
        <span className={`tag ${color}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon size={11} />
            {label}
        </span>
    );
}

export default function StatementsPage() {
    const { t } = useTranslation();
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadMeta, setUploadMeta] = useState({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        bankName: '',
        accountType: 'checking',
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/statements');
            setStatements(data.statements || []);
        } catch { toast.error('Failed to load statements'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'], 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
        maxSize: 10 * 1024 * 1024,
        maxFiles: 1,
        onDrop: (accepted, rejected) => {
            if (rejected.length > 0) {
                toast.error('Invalid file. Only PDF/CSV up to 10MB allowed.');
                return;
            }
            if (accepted.length > 0) setSelectedFile(accepted[0]);
        },
    });

    const handleUpload = async () => {
        if (!selectedFile) { toast.error('Please select a file first'); return; }
        setUploading(true);
        setUploadProgress(0);
        try {
            const fd = new FormData();
            fd.append('statement', selectedFile);
            fd.append('month', uploadMeta.month);
            fd.append('year', uploadMeta.year);
            fd.append('bankName', uploadMeta.bankName);
            fd.append('accountType', uploadMeta.accountType);

            await api.post('/statements/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    setUploadProgress(Math.round((e.loaded * 100) / e.total));
                },
            });

            toast.success('Statement uploaded! Analysis in progress...');
            setSelectedFile(null);
            setUploadProgress(0);
            load();

            // Poll for status after 3 seconds
            setTimeout(load, 3000);
            setTimeout(load, 7000);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this statement and all its transactions?')) return;
        try {
            await api.delete(`/statements/${id}`);
            toast.success('Statement deleted');
            load();
        } catch { toast.error('Delete failed'); }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t('stmt_title')}</h1>
                    <p className="page-subtitle">{t('stmt_subtitle')}</p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="card mb-24">
                <h3 className="section-title">{t('stmt_upload_new')}</h3>

                {/* Dropzone */}
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} style={{ marginBottom: 20 }}>
                    <input {...getInputProps()} id="statement-file-input" />
                    {selectedFile ? (
                        <>
                            <div style={{ fontSize: 40 }}>📄</div>
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{selectedFile.name}</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{formatFileSize(selectedFile.size)}</div>
                            <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelectedFile(null); }}>
                                <XCircle size={14} /> Remove
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="dropzone-icon">📂</div>
                            <div className="dropzone-title">{isDragActive ? 'Drop it here!' : t('stmt_drop')}</div>
                            <div className="dropzone-subtitle">{t('stmt_supports')}</div>
                            <button className="btn btn-secondary btn-sm" type="button">{t('stmt_browse')}</button>
                        </>
                    )}
                </div>

                {/* Metadata */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">{t('stmt_month')}</label>
                        <select className="form-select" value={uploadMeta.month} onChange={e => setUploadMeta(p => ({ ...p, month: parseInt(e.target.value) }))}>
                            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('stmt_year')}</label>
                        <select className="form-select" value={uploadMeta.year} onChange={e => setUploadMeta(p => ({ ...p, year: parseInt(e.target.value) }))}>
                            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('stmt_bank_name')}</label>
                        <input className="form-input" placeholder="e.g. Chase Bank" value={uploadMeta.bankName} onChange={e => setUploadMeta(p => ({ ...p, bankName: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('stmt_account_type')}</label>
                        <select className="form-select" value={uploadMeta.accountType} onChange={e => setUploadMeta(p => ({ ...p, accountType: e.target.value }))}>
                            <option value="checking">Checking</option>
                            <option value="savings">Savings</option>
                            <option value="credit">Credit Card</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Upload progress */}
                {uploading && (
                    <div style={{ marginBottom: 14 }}>
                        <div className="flex-between mb-8">
                            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Uploading & analyzing...</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{uploadProgress}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    id="upload-statement-btn"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                >
                    {uploading
                        ? <><div className="spinner" style={{ width: 18, height: 18 }} />Processing...</>
                        : <><Upload size={16} />{t('stmt_upload_btn')}</>}
                </button>
            </div>

            {/* Statements List */}
            <div className="card">
                <div className="flex-between mb-20">
                    <h3 className="section-title" style={{ marginBottom: 0 }}>📂 {t('stmt_history')} ({statements.length})</h3>
                    <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} /></button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
                    </div>
                ) : statements.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {statements.map(s => (
                            <div key={s._id} style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                padding: '16px 20px',
                                background: 'var(--color-surface-2)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-border)',
                                flexWrap: 'wrap',
                            }}>
                                <div style={{ fontSize: 36 }}>{s.fileType === 'pdf' ? '📑' : '📊'}</div>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{s.originalName}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <span>📅 {MONTHS[s.month - 1]} {s.year}</span>
                                        <span>🏦 {s.bankName || 'Unknown Bank'}</span>
                                        <span>💾 {formatFileSize(s.fileSize)}</span>
                                        <span>🔖 {s.accountType}</span>
                                    </div>
                                </div>
                                <StatusBadge status={s.status} />
                                {s.status === 'processed' && s.summary && (
                                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                        <div style={{ fontSize: 12 }}>
                                            <div style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>Transactions</div>
                                            <strong>{s.summary.transactionCount}</strong>
                                        </div>
                                        <div style={{ fontSize: 12 }}>
                                            <div style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>Expenses</div>
                                            <strong style={{ color: 'var(--color-danger)' }}>${s.summary.totalExpenses?.toFixed(2)}</strong>
                                        </div>
                                        <div style={{ fontSize: 12 }}>
                                            <div style={{ color: 'var(--color-text-muted)', marginBottom: 2 }}>Net Savings</div>
                                            <strong style={{ color: s.summary.netSavings >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                                ${s.summary.netSavings?.toFixed(2)}
                                            </strong>
                                        </div>
                                    </div>
                                )}
                                {s.status === 'failed' && s.errorMessage && (
                                    <div style={{ fontSize: 12, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <AlertCircle size={12} /> {s.errorMessage}
                                    </div>
                                )}
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <div className="empty-title">{t('stmt_no_stmts')}</div>
                        <p className="empty-desc">{t('stmt_no_stmts_desc')}</p>
                    </div>
                )}
            </div>

            {/* CSV Format hint */}
            <div className="card" style={{ marginTop: 20, background: 'rgba(79,142,247,0.05)', borderColor: 'rgba(79,142,247,0.2)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--color-primary)' }}>💡 CSV Format Guide</h4>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                    Your CSV file should include columns for <strong style={{ color: 'var(--color-text)' }}>Date</strong>, <strong style={{ color: 'var(--color-text)' }}>Description</strong>, and <strong style={{ color: 'var(--color-text)' }}>Amount</strong>.
                    Common bank export formats (Chase, Bank of America, Wells Fargo, Citibank) are supported automatically.
                    Transactions are categorized using AI keyword matching.
                </p>
                <div style={{ marginTop: 12, background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Date,Description,Amount<br />
                    01/15/2026,Starbucks Coffee,-4.95<br />
                    01/16/2026,Netflix Subscription,-15.99<br />
                    01/17/2026,Payroll Direct Deposit,3500.00
                </div>
            </div>
        </div>
    );
}
