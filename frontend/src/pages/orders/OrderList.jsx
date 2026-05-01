import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders } from '../../services/orderService';
import { Loader2, ShoppingCart, Plus, Eye, Clock, CheckCircle, XCircle, CreditCard, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG = {
    all:            { label: 'All Orders',     bg: '#f3f4f6', color: '#374151' },
    pending:        { label: 'Pending',        bg: '#fef3c7', color: '#b45309', border: '#fde68a',  icon: <Clock size={13} /> },
    partially_paid: { label: 'Partial',        bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe',  icon: <CreditCard size={13} /> },
    completed:      { label: 'Completed',      bg: '#dcfce7', color: '#166534', border: '#bbf7d0',  icon: <CheckCircle size={13} /> },
    cancelled:      { label: 'Cancelled',      bg: '#fee2e2', color: '#991b1b', border: '#fecaca',  icon: <XCircle size={13} /> },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border || cfg.bg}` }}>
            {cfg.icon} {status}
        </span>
    );
};

const OrderList = () => {
    const { role } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await getAllOrders();
                const data = res.data;
                setOrders(Array.isArray(data) ? data : (data?.data || []));
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Failed to load orders.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Client-side filter
    const filtered = useMemo(() => {
        if (!Array.isArray(orders)) return [];
        if (statusFilter === 'all') return orders;
        return orders.filter(o => o.status === statusFilter);
    }, [orders, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterChange = (val) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };

    const handlePage = (p) => {
        if (p >= 1 && p <= totalPages) { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };

    // Summary counts
    const counts = useMemo(() => {
        if (!Array.isArray(orders)) return {};
        return orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
    }, [orders]);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '420px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Loader2 size={44} style={{ animation: 'spin 1.2s linear infinite', marginBottom: '1rem' }} />
            <p style={{ fontWeight: '500', color: '#4b5563' }}>Loading orders...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: '#111827', margin: '0 0 0.4rem 0', fontSize: '2rem', fontWeight: '800' }}>
                        {role === 'customer' ? 'My Orders' : 'All Orders'}
                    </h1>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
                        {role === 'customer' ? 'Track your purchase history and invoices.' : 'Manage and monitor all customer orders.'}
                    </p>
                </div>
                {role === 'customer' && (
                    <Link to="/create-order" style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(22,163,74,0.35)', fontSize: '0.9rem', transition: 'background-color 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#15803d'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#16a34a'}>
                            <Plus size={18} /> New Order
                        </button>
                    </Link>
                )}
            </div>

            {/* Summary Stat Cards */}
            {!loading && orders.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { key: 'all',            label: 'Total',         value: orders.length,                       bg: '#f9fafb', color: '#374151' },
                        { key: 'pending',        label: 'Pending',       value: counts.pending        || 0,          bg: '#fffbeb', color: '#b45309' },
                        { key: 'partially_paid', label: 'Partial',       value: counts.partially_paid || 0,          bg: '#eff6ff', color: '#1d4ed8' },
                        { key: 'completed',      label: 'Completed',     value: counts.completed      || 0,          bg: '#f0fdf4', color: '#166534' },
                        { key: 'cancelled',      label: 'Cancelled',     value: counts.cancelled      || 0,          bg: '#fef2f2', color: '#991b1b' },
                    ].map(stat => (
                        <button key={stat.key} onClick={() => handleFilterChange(stat.key)}
                            style={{ padding: '1rem', backgroundColor: statusFilter === stat.key ? stat.bg : '#ffffff', border: `2px solid ${statusFilter === stat.key ? stat.color + '40' : '#e5e7eb'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: statusFilter === stat.key ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>{stat.label}</p>
                            <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: stat.color }}>{stat.value}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem', fontWeight: '600' }}>
                    <Filter size={15} /> Filter:
                </div>
                {['all', 'pending', 'partially_paid', 'completed', 'cancelled'].map(val => (
                    <button key={val} onClick={() => handleFilterChange(val)}
                        style={{
                            padding: '0.4rem 0.875rem', borderRadius: '6px', border: '1px solid', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                            backgroundColor: statusFilter === val ? (val === 'all' ? '#111827' : val === 'completed' ? '#16a34a' : val === 'cancelled' ? '#dc2626' : val === 'partially_paid' ? '#2563eb' : '#d97706') : '#ffffff',
                            color: statusFilter === val ? '#ffffff' : '#4b5563',
                            borderColor: statusFilter === val ? 'transparent' : '#d1d5db',
                        }}>
                        {val === 'all' ? 'All' : val === 'partially_paid' ? 'Partial' : val.charAt(0).toUpperCase() + val.slice(1)}
                    </button>
                ))}
                {filtered.length > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#6b7280' }}>
                        <strong>{filtered.length}</strong> {filtered.length === 1 ? 'order' : 'orders'} found
                    </span>
                )}
            </div>

            {/* Orders Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                {filtered.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
                        <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <ShoppingCart size={44} color="#9ca3af" />
                        </div>
                        <h3 style={{ color: '#1f2937', margin: '0 0 0.5rem 0' }}>No Orders Found</h3>
                        <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '360px', margin: 0 }}>
                            {statusFilter !== 'all' ? `No ${statusFilter} orders.` : 'No orders have been placed yet.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Order ID</th>
                                    <th style={thStyle}>Date</th>
                                    {(role === 'owner' || role === 'employee') && <th style={thStyle}>Customer</th>}
                                    <th style={thStyle}>Status</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Total (incl. GST)</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((order, index) => (
                                    <tr key={order.id}
                                        style={{ borderBottom: index < paginated.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background-color 0.15s' }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: '800', color: '#374151', fontFamily: 'monospace', fontSize: '0.95rem' }}>#ORD-{order.id}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>
                                                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                                                    {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        {(role === 'owner' || role === 'employee') && (
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>{order.customer_name}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{order.customer_email}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td style={tdStyle}><StatusBadge status={order.status} /></td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <span style={{ fontWeight: '800', fontSize: '1rem', color: '#111827' }}>
                                                ₹{(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                                                <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.875rem', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#4b5563', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.15s' }}
                                                    onMouseOver={e => { e.currentTarget.style.backgroundColor = '#e5e7eb'; e.currentTarget.style.color = '#111827'; }}
                                                    onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#4b5563'; }}>
                                                    <Eye size={14} /> View
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
                    <span>
                        Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–<strong>{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong>{filtered.length}</strong>
                    </span>
                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <button onClick={() => handlePage(currentPage - 1)} disabled={currentPage === 1}
                            style={{ ...pageBtn, opacity: currentPage === 1 ? 0.4 : 1 }}><ChevronLeft size={15} /></button>
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                                return <button key={p} onClick={() => handlePage(p)} style={{ ...pageBtn, backgroundColor: currentPage === p ? '#16a34a' : '#ffffff', color: currentPage === p ? '#ffffff' : '#374151', fontWeight: currentPage === p ? '700' : '500', borderColor: currentPage === p ? '#16a34a' : '#d1d5db', minWidth: '34px' }}>{p}</button>;
                            }
                            if (p === currentPage - 2 || p === currentPage + 2) return <span key={p} style={{ padding: '0 0.2rem', color: '#9ca3af' }}>…</span>;
                            return null;
                        })}
                        <button onClick={() => handlePage(currentPage + 1)} disabled={currentPage === totalPages}
                            style={{ ...pageBtn, opacity: currentPage === totalPages ? 0.4 : 1 }}><ChevronRight size={15} /></button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// Shared style objects
const thStyle = { padding: '0.9rem 1.25rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#f9fafb', fontWeight: '700' };
const tdStyle = { padding: '1.1rem 1.25rem', color: '#4b5563', verticalAlign: 'middle' };
const pageBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s' };

export default OrderList;
