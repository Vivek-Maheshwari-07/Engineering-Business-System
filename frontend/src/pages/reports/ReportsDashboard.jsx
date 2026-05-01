import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    getReportSummary, getMonthlyRevenue,
    getTopProducts, getOrderStatusReport
} from '../../services/reportService';
import {
    ShoppingCart, IndianRupee, Package, AlertTriangle,
    Loader2, TrendingUp, BarChart2, FileText, Boxes,
    ArrowRight, ArrowUpRight
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import toast from 'react-hot-toast';

// ── Formatters ──────────────────────────────────────────────────────────────
const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtNum = (n) => Number(n || 0).toLocaleString('en-IN');

// ── Status colours for pie chart ────────────────────────────────────────────
const STATUS_COLORS = { pending: '#f59e0b', completed: '#16a34a', cancelled: '#ef4444' };

// ── Reusable KPI Card ────────────────────────────────────────────────────────
const KPICard = ({ title, value, sub, icon, accent, link }) => (
    <Link to={link || '#'} style={{ textDecoration: 'none' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {/* Background blob */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: accent, opacity: 0.08 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                    <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
                    <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: '#111827', lineHeight: 1 }}>{value}</h2>
                    {sub && <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.78rem', color: '#9ca3af' }}>{sub}</p>}
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: `${accent}18`, color: accent }}>
                    {icon}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600', color: accent }}>
                View Details <ArrowUpRight size={14} />
            </div>
        </div>
    </Link>
);

// ── Chart wrapper card ────────────────────────────────────────────────────────
const ChartCard = ({ title, children, action }) => (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1f2937' }}>{title}</h3>
            {action}
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
    </div>
);

// ── Custom Tooltip for Area chart ─────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ backgroundColor: '#1f2937', color: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '700' }}>{label}</p>
            <p style={{ margin: 0, color: '#86efac' }}>{fmtINR(payload[0]?.value)}</p>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ReportsDashboard = () => {
    const { user, role } = useAuth();
    const [summary, setSummary]     = useState(null);
    const [monthly, setMonthly]     = useState([]);
    const [topProds, setTopProds]   = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [sumRes, monRes, topRes, statRes] = await Promise.allSettled([
                    getReportSummary(),
                    getMonthlyRevenue(),
                    getTopProducts(5),
                    getOrderStatusReport(),
                ]);
                if (sumRes.status  === 'fulfilled') setSummary(sumRes.value.data);
                if (monRes.status  === 'fulfilled') setMonthly(Array.isArray(monRes.value.data) ? monRes.value.data : []);
                if (topRes.status  === 'fulfilled') setTopProds(Array.isArray(topRes.value.data) ? topRes.value.data : []);
                if (statRes.status === 'fulfilled') setOrderStatus(Array.isArray(statRes.value.data) ? statRes.value.data : []);
            } catch {
                toast.error('Failed to load analytics data.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '500px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Loader2 size={48} style={{ animation: 'spin 1.2s linear infinite', marginBottom: '1rem' }} />
            <p style={{ fontWeight: '600', color: '#4b5563', fontSize: '1rem' }}>Loading analytics...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const kpis = [
        { title: 'Total Orders',    value: fmtNum(summary?.totalOrders),   icon: <ShoppingCart size={26} />, accent: '#3b82f6', link: '/orders',    sub: 'All time orders' },
        { title: 'Total Revenue',   value: fmtINR(summary?.totalRevenue),  icon: <IndianRupee size={26} />,  accent: '#16a34a', link: '/orders',    sub: 'From invoices (incl. GST)' },
        { title: 'Total Products',  value: fmtNum(summary?.totalProducts), icon: <Package size={26} />,      accent: '#8b5cf6', link: '/products',  sub: 'Active products' },
        { title: 'Low Stock Items', value: fmtNum(summary?.lowStockItems), icon: <AlertTriangle size={26} />,accent: '#ef4444', link: '/reports/inventory', sub: 'Below 10 units' },
    ];

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '2rem', fontWeight: '900', color: '#111827' }}>Analytics Dashboard</h1>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
                        Hello, <strong style={{ color: '#15803d' }}>{user?.name || role}</strong> — here's your business performance overview.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Revenue', icon: <TrendingUp size={15} />, to: '/reports/revenue' },
                        { label: 'Products', icon: <BarChart2 size={15} />, to: '/reports/top-products' },
                        { label: 'GST',     icon: <FileText size={15} />,  to: '/reports/gst' },
                        { label: 'Stock',   icon: <Boxes size={15} />,     to: '/reports/inventory' },
                    ].map(btn => (
                        <Link key={btn.label} to={btn.to} style={{ textDecoration: 'none' }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '7px', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.15s' }}
                                onMouseOver={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.backgroundColor = '#ffffff'; }}>
                                {btn.icon} {btn.label}
                            </button>
                        </Link>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {kpis.map(k => <KPICard key={k.title} {...k} />)}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

                {/* Monthly Revenue Area Chart */}
                <ChartCard title="Monthly Revenue (This Year)"
                    action={
                        <Link to="/reports/revenue" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600', color: '#16a34a' }}>
                            Full Report <ArrowRight size={14} />
                        </Link>
                    }>
                    {monthly.length === 0 ? (
                        <EmptyChart message="No revenue data for this year yet." />
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={monthly} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<RevenueTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                {/* Order Status Pie */}
                <ChartCard title="Orders by Status">
                    {orderStatus.length === 0 ? (
                        <EmptyChart message="No orders yet." />
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={orderStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {orderStatus.map((entry, i) => (
                                        <Cell key={i} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v, n]} />
                                <Legend iconType="circle" iconSize={10} formatter={v => <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: '#374151' }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <ChartCard title="Top 5 Products by Units Sold"
                action={
                    <Link to="/reports/top-products" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600', color: '#16a34a' }}>
                        Full Report <ArrowRight size={14} />
                    </Link>
                }>
                {topProds.length === 0 ? (
                    <EmptyChart message="No sales data available." />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={topProds} layout="vertical" margin={{ left: 10, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="product_name" width={120} tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v) => [v, 'Units Sold']} contentStyle={{ fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                <Bar dataKey="total_sold" radius={[0, 6, 6, 0]}>
                                    {topProds.map((_, i) => (
                                        <Cell key={i} fill={i === 0 ? '#16a34a' : i === 1 ? '#22c55e' : i === 2 ? '#4ade80' : '#86efac'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Rank Table */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {topProds.map((p, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: i === 0 ? '#f0fdf4' : '#f9fafb', borderRadius: '8px', border: i === 0 ? '1px solid #bbf7d0' : '1px solid #f3f4f6' }}>
                                    <span style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: i === 0 ? '#16a34a' : '#e5e7eb', color: i === 0 ? '#fff' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', flexShrink: 0 }}>
                                        {i + 1}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontWeight: '700', color: '#1f2937', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.product_name}</p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{p.category}</p>
                                    </div>
                                    <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '0.95rem', flexShrink: 0 }}>{fmtNum(p.total_sold)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </ChartCard>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

const EmptyChart = ({ message }) => (
    <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: '0.5rem' }}>
        <BarChart2 size={36} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>{message}</p>
    </div>
);

export default ReportsDashboard;
