import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    getReportSummary,
    getMonthlyRevenue,
    getTopProducts,
    getPaymentSummary
} from '../services/reportService';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    IndianRupee, ShoppingCart, Package, AlertTriangle,
    BarChart2, ArrowRight, Calendar, FileText, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtCurrency = (val) => `₹${fmt(val)}`;

const COLORS = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'];

// ── Components ───────────────────────────────────────────────────────────────

const SkeletonLoader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
        {/* Header skel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div className="skeleton-pulse" style={{ width: '280px', height: '32px', marginBottom: '8px' }} />
                <div className="skeleton-pulse" style={{ width: '380px', height: '16px' }} />
            </div>
            <div className="skeleton-pulse" style={{ width: '160px', height: '40px' }} />
        </div>
        {/* Cards skel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-pulse" style={{ height: '150px', borderRadius: '24px' }} />
            ))}
        </div>
        {/* Charts skel */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="skeleton-pulse" style={{ height: '380px', borderRadius: '24px' }} />
            <div className="skeleton-pulse" style={{ height: '380px', borderRadius: '24px' }} />
        </div>
    </div>
);

const StatCard = ({ title, value, icon, subtitle, color, link }) => (
    <Link to={link} style={{ textDecoration: 'none' }}>
        <div className="premium-card" style={{
            padding: '1.75rem', display: 'flex', flexDirection: 'column',
            position: 'relative', cursor: 'pointer',
            height: '100%', boxSizing: 'border-box',
            background: 'var(--color-white)',
            border: '1px solid rgba(15, 23, 42, 0.05)',
            boxShadow: 'var(--shadow-premium)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
        }}
        onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
            e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.05)';
        }}
        >
            {/* Glowing accent circle */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: `radial-gradient(circle, ${color}0c 0%, rgba(255,255,255,0) 70%)`, pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.6rem', backgroundColor: `${color}0f`, color: color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>{title}</span>
            </div>
            
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', fontFamily: "'Outfit', sans-serif" }}>
                {value}
            </h3>
            
            {subtitle && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 'auto', fontWeight: '500' }}>
                    <ArrowRight size={12} color="#10b981" /> {subtitle}
                </div>
            )}
        </div>
    </Link>
);

const EmptyState = ({ title }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', color: '#94a3b8' }}>
        <FileText size={44} style={{ marginBottom: '1rem', opacity: 0.4 }} />
        <p style={{ margin: 0, fontWeight: '600', color: '#475569' }}>No {title} Data Available</p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', maxWidth: '300px' }}>Orders or products need to be added to generate this chart.</p>
    </div>
);

// ── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    
    // Customer specific landing experience
    if (user?.role === 'customer') {
        return (
            <div style={{ paddingBottom: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ margin: '0 0 0.35rem 0', fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                            Welcome, {user?.name}
                        </h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
                            Access your personal customer portal. Track your orders, invoices, and catalog.
                        </p>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <StatCard 
                        title="My Order History" 
                        value="View Details" 
                        icon={<ShoppingCart size={22} />} 
                        color="#6366f1" 
                        link="/my-orders"
                        subtitle="Track pending & past orders"
                    />
                    <StatCard 
                        title="New Order Catalog" 
                        value="Browse & Shop" 
                        icon={<Package size={22} />} 
                        color="#10b981" 
                        link="/create-order"
                        subtitle="Browse catalog & order instantly"
                    />
                </div>
            </div>
        );
    }
    
    // Data States
    const [summary, setSummary] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, lowStockItems: 0 });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [paymentSummary, setPaymentSummary] = useState([]);
    
    // Filters
    const [monthsFilter, setMonthsFilter] = useState(6); // 6 or 12

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [sumRes, revRes, prodRes, payRes] = await Promise.all([
                    getReportSummary(),
                    getMonthlyRevenue(),
                    getTopProducts(5),
                    getPaymentSummary()
                ]);

                setSummary(sumRes.data || {});
                setMonthlyRevenue(revRes.data || []);
                setTopProducts(prodRes.data || []);
                setPaymentSummary(payRes.data || []);
            } catch (error) {
                toast.error('Failed to load dashboard statistics.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Prepare chart data
    const filteredRevenue = useMemo(() => {
        return monthlyRevenue.slice(-monthsFilter);
    }, [monthlyRevenue, monthsFilter]);

    const pieData = useMemo(() => {
        const mapped = paymentSummary.map(p => ({
            name: p.status === 'completed' ? 'Paid' 
                : p.status === 'partially_paid' ? 'Partial' 
                : p.status === 'pending' ? 'Pending' 
                : 'Cancelled',
            value: Number(p.total_value),
            count: p.count
        }));
        return mapped.filter(m => m.value > 0);
    }, [paymentSummary]);

    if (loading) return <SkeletonLoader />;

    return (
        <div style={{ paddingBottom: '2.5rem', animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.35rem 0', fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        Dashboard Overview
                    </h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
                        Real-time tracking of Hari Krupa Engineering sales volume, inventory levels, and orders.
                    </p>
                </div>
                <div style={{ 
                    display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 0.75rem', 
                    borderRadius: '16px', backgroundColor: 'var(--color-white)', border: '1px solid rgba(15, 23, 42, 0.05)',
                    boxShadow: 'var(--shadow-premium-sm)'
                }}>
                    <Calendar size={16} color="#64748b" style={{ marginLeft: '0.25rem' }} />
                    <select 
                        value={monthsFilter} 
                        onChange={e => setMonthsFilter(Number(e.target.value))}
                        style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: '700', color: '#475569', cursor: 'pointer', outline: 'none', paddingRight: '0.25rem', boxShadow: 'none', padding: '2px 0 !important' }}
                    >
                        <option value={6}>Last 6 Months</option>
                        <option value={12}>Last 12 Months</option>
                    </select>
                </div>
            </div>

            {/* KPI Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard 
                    title="Total Revenue" 
                    value={fmtCurrency(summary.totalRevenue)} 
                    icon={<IndianRupee size={20} />} 
                    color="#10b981" 
                    link="/reports"
                    subtitle="Lifetime business volume"
                />
                <StatCard 
                    title="Total Orders" 
                    value={fmt(summary.totalOrders)} 
                    icon={<ShoppingCart size={20} />} 
                    color="#6366f1" 
                    link="/orders"
                    subtitle="Customer orders processed"
                />
                <StatCard 
                    title="Active Catalog" 
                    value={fmt(summary.totalProducts)} 
                    icon={<Package size={20} />} 
                    color="#0ea5e9" 
                    link="/products"
                    subtitle="Items listed in catalogue"
                />
                <StatCard 
                    title="Low Stock Alerts" 
                    value={fmt(summary.lowStockItems)} 
                    icon={<AlertTriangle size={20} />} 
                    color={summary.lowStockItems > 0 ? "#ef4444" : "#10b981"} 
                    link="/inventory"
                    subtitle={summary.lowStockItems > 0 ? "Requires restock immediate" : "All warehouse stocks optimal"}
                />
            </div>

            {/* Charts Section 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Revenue Line Chart */}
                <div className="premium-card" style={{ padding: '2rem', backgroundColor: 'var(--color-white)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>Monthly Revenue Trends</h3>
                    </div>
                    {filteredRevenue.length === 0 ? <EmptyState title="Revenue" /> : (
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <LineChart data={filteredRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '500' }} dy={10} />
                                    <YAxis 
                                        tickFormatter={(val) => `₹${Number(val/1000).toFixed(0)}k`} 
                                        axisLine={false} tickLine={false} 
                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '500' }} 
                                        dx={-5}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [fmtCurrency(value), 'Revenue']}
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: '1px solid rgba(16, 185, 129, 0.1)', 
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                            padding: '10px 14px'
                                        }}
                                        labelStyle={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}
                                        itemStyle={{ color: '#10b981', fontWeight: '600', fontSize: '13px' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="url(#revenueGrad)" 
                                        strokeWidth={4}
                                        dot={{ r: 4, strokeWidth: 3, fill: '#ffffff', stroke: '#10b981' }}
                                        activeDot={{ r: 7, stroke: '#059669', strokeWidth: 3, fill: '#ffffff' }}
                                        animationDuration={1500}
                                    />
                                    <defs>
                                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#34d399" />
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Payment Status Pie Chart */}
                <div className="premium-card" style={{ padding: '2rem', backgroundColor: 'var(--color-white)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#6366f1', boxShadow: '0 0 8px #6366f1' }} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>Payment Distribution</h3>
                    </div>
                    {pieData.length === 0 ? <EmptyState title="Payment" /> : (
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%" cy="45%"
                                        innerRadius={70} outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                        animationDuration={1000}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.name === 'Paid' ? '#10b981' :
                                                entry.name === 'Pending' ? '#f59e0b' :
                                                entry.name === 'Partial' ? '#38bdf8' : '#ef4444'
                                            } />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => fmtCurrency(value)}
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: '1px solid rgba(15, 23, 42, 0.08)', 
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
                                            padding: '10px 14px'
                                        }}
                                        itemStyle={{ fontWeight: '600', fontSize: '13px' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontWeight: '600', color: '#475569' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Section 2 */}
            <div className="premium-card" style={{ padding: '2rem', backgroundColor: 'var(--color-white)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0ea5e9', boxShadow: '0 0 8px #0ea5e9' }} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>Top Performing Material Products</h3>
                </div>
                {topProducts.length === 0 ? <EmptyState title="Product" /> : (
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer>
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" tickFormatter={(val) => `₹${Number(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: '500' }} />
                                <YAxis 
                                    type="category" dataKey="product_name" 
                                    axisLine={false} tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#475569', fontWeight: '600' }}
                                    width={120}
                                />
                                <Tooltip 
                                    formatter={(value) => [fmtCurrency(value), 'Revenue']}
                                    cursor={{ fill: 'rgba(16, 185, 129, 0.02)' }}
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: '1px solid rgba(15, 23, 42, 0.08)', 
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
                                        padding: '10px 14px'
                                    }}
                                    itemStyle={{ fontWeight: '600', fontSize: '13px' }}
                                />
                                <Bar 
                                    dataKey="total_revenue" 
                                    fill="#10b981" 
                                    radius={[0, 8, 8, 0]}
                                    barSize={20}
                                    animationDuration={1500}
                                >
                                    {topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
