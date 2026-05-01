import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getInventoryReport } from '../../services/reportService';
import { Loader2, Boxes, ChevronLeft, AlertTriangle, XCircle, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const InventoryReport = () => {
    const [data, setData]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await getInventoryReport();
                setData(Array.isArray(res.data) ? res.data : []);
            } catch {
                toast.error('Failed to load inventory report.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = useMemo(() => {
        return data.filter(row => {
            const matchSearch = !search ||
                row.product_name.toLowerCase().includes(search.toLowerCase()) ||
                row.category.toLowerCase().includes(search.toLowerCase()) ||
                row.size.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === 'all' || row.stock_status === filter;
            return matchSearch && matchFilter;
        });
    }, [data, search, filter]);

    const counts = useMemo(() => ({
        total:        data.length,
        ok:           data.filter(d => d.stock_status === 'ok').length,
        low:          data.filter(d => d.stock_status === 'low').length,
        out_of_stock: data.filter(d => d.stock_status === 'out_of_stock').length,
    }), [data]);

    if (loading) return (
        <div style={{ display: 'flex', height: '400px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Loader2 size={44} style={{ animation: 'spin 1.2s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '1.75rem' }}>
                <Link to="/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                    <ChevronLeft size={15} /> Back to Dashboard
                </Link>
                <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '2rem', fontWeight: '900', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Boxes size={28} color="#16a34a" /> Inventory Report
                </h1>
                <p style={{ margin: 0, color: '#6b7280' }}>Real-time stock levels across all product variants. Critical items appear first.</p>
            </div>

            {/* Status summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { key: 'all',          label: 'All Variants',  value: counts.total,        icon: <Boxes size={22} />,         color: '#374151', bg: '#f9fafb', border: '#e5e7eb' },
                    { key: 'ok',           label: 'In Stock',      value: counts.ok,            icon: <CheckCircle size={22} />,   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                    { key: 'low',          label: 'Low Stock',     value: counts.low,           icon: <AlertTriangle size={22} />, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                    { key: 'out_of_stock', label: 'Out of Stock',  value: counts.out_of_stock,  icon: <XCircle size={22} />,       color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                ].map(c => (
                    <button key={c.key} onClick={() => setFilter(c.key)}
                        style={{ padding: '1.1rem', backgroundColor: filter === c.key ? c.bg : '#ffffff', border: `2px solid ${filter === c.key ? c.color + '60' : '#e5e7eb'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', boxShadow: filter === c.key ? `0 2px 8px ${c.color}20` : '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                            <span style={{ color: c.color, opacity: 0.7 }}>{c.icon}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: c.color }}>{c.value}</p>
                    </button>
                ))}
            </div>

            {/* Search + Filter bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative', maxWidth: '360px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Search product, category, size..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem', color: '#374151', backgroundColor: '#ffffff', boxSizing: 'border-box', outline: 'none' }}
                    />
                </div>
                {filtered.length > 0 && (
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: 'auto' }}>
                        <strong>{filtered.length}</strong> variants shown
                    </span>
                )}
            </div>

            {/* Inventory Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>
                        <Boxes size={44} style={{ marginBottom: '1rem' }} />
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                            {search ? 'No variants match your search.' : 'No inventory data found.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={th}>Product</th>
                                    <th style={th}>Category</th>
                                    <th style={th}>Size / Variant</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Stock Available</th>
                                    <th style={{ ...th, textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row, i) => {
                                    const isOut = row.stock_status === 'out_of_stock';
                                    const isLow = row.stock_status === 'low';
                                    const rowBg = isOut ? '#fff5f5' : isLow ? '#fffdf0' : 'transparent';
                                    return (
                                        <tr key={i}
                                            style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: rowBg, transition: 'background 0.12s' }}
                                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                            onMouseOut={e => e.currentTarget.style.backgroundColor = rowBg}>
                                            <td style={td}>
                                                <span style={{ fontWeight: '700', color: '#1f2937' }}>{row.product_name}</span>
                                            </td>
                                            <td style={td}>
                                                <span style={{ fontSize: '0.78rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                                                    {row.category}
                                                </span>
                                            </td>
                                            <td style={td}>
                                                <span style={{ fontWeight: '600', color: '#374151' }}>{row.size}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.35rem' }}>({row.unit})</span>
                                            </td>
                                            <td style={{ ...td, textAlign: 'right', color: '#4b5563' }}>
                                                ₹{Number(row.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ ...td, textAlign: 'right' }}>
                                                <span style={{ fontWeight: '800', fontSize: '1rem', color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a' }}>
                                                    {row.stock}
                                                </span>
                                                <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '0.25rem' }}>{row.unit}</span>
                                            </td>
                                            <td style={{ ...td, textAlign: 'center' }}>
                                                {isOut ? (
                                                    <span style={statusBadge('#fef2f2', '#dc2626', '#fecaca')}>
                                                        <XCircle size={12} /> Out of Stock
                                                    </span>
                                                ) : isLow ? (
                                                    <span style={statusBadge('#fffbeb', '#d97706', '#fde68a')}>
                                                        <AlertTriangle size={12} /> Low Stock
                                                    </span>
                                                ) : (
                                                    <span style={statusBadge('#f0fdf4', '#16a34a', '#bbf7d0')}>
                                                        <CheckCircle size={12} /> In Stock
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0);} }`}</style>
        </div>
    );
};

const statusBadge = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.3rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em',
    backgroundColor: bg, color, border: `1px solid ${border}`
});

const th = { padding: '0.85rem 1.5rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700', backgroundColor: '#f9fafb' };
const td = { padding: '1rem 1.5rem', color: '#4b5563', fontSize: '0.9rem' };

export default InventoryReport;
