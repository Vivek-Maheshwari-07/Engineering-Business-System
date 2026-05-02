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
    BarChart2, ArrowRight, Calendar, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtCurrency = (val) => `₹${fmt(val)}`;

const COLORS = ['#16a34a', '#d97706', '#0284c7', '#7c3aed', '#dc2626'];

// ── Components ───────────────────────────────────────────────────────────────

const SkeletonLoader = () => (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'pulse 1.5s infinite ease-in-out' }}>
        <style>{`
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .skel { background-color: #e5e7eb; border-radius: 12px; }
        `}</style>
        {/* Header skel */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skel" style={{ width: '250px', height: '40px' }} />
            <div className="skel" style={{ width: '150px', height: '40px' }} />
        </div>
        {/* Cards skel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skel" style={{ height: '140px' }} />)}
        </div>
        {/* Charts skel */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="skel" style={{ height: '350px' }} />
            <div className="skel" style={{ height: '350px' }} />
        </div>
    </div>
);

const StatCard = ({ title, value, icon, subtitle, color, link }) => (
    <Link to={link} style={{ textDecoration: 'none' }}>
        <div style={{
            backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer',
            height: '100%', boxSizing: 'border-box'
        }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
        >
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.08, transform: 'scale(2.5)', color }}>
                {icon}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: `${color}15`, color, borderRadius: '12px' }}>
                    {icon}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#6b7280' }}>{title}</span>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>
                {value}
            </h3>
            {subtitle && (
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ArrowRight size={12} /> {subtitle}
                </div>
            )}
        </div>
    </Link>
);

const EmptyState = ({ title }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#9ca3af' }}>
        <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p style={{ margin: 0, fontWeight: '500' }}>No {title} Data Available</p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>Orders or products need to be added to generate this chart.</p>
    </div>
);

// ── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    
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
                toast.error('Failed to load dashboard data.');
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
        <div style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '2rem', fontWeight: '800', color: '#111827' }}>
                        Welcome back, {user?.name || 'Admin'}
                    </h1>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
                        Here is what's happening with your business today.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#fff', padding: '0.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Calendar size={18} color="#6b7280" style={{ marginLeft: '0.5rem' }} />
                    <select 
                        value={monthsFilter} 
                        onChange={e => setMonthsFilter(Number(e.target.value))}
                        style={{ border: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: '600', color: '#111827', cursor: 'pointer', outline: 'none', paddingRight: '0.5rem' }}
                    >
                        <option value={6}>Last 6 Months</option>
                        <option value={12}>Last 12 Months</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard 
                    title="Total Revenue" 
                    value={fmtCurrency(summary.totalRevenue)} 
                    icon={<IndianRupee size={24} />} 
                    color="#16a34a" 
                    link="/reports"
                    subtitle="Lifetime business volume"
                />
                <StatCard 
                    title="Total Orders" 
                    value={fmt(summary.totalOrders)} 
                    icon={<ShoppingCart size={24} />} 
                    color="#0284c7" 
                    link="/orders"
                    subtitle="Orders processed"
                />
                <StatCard 
                    title="Active Products" 
                    value={fmt(summary.totalProducts)} 
                    icon={<Package size={24} />} 
                    color="#7c3aed" 
                    link="/products"
                    subtitle="Items in catalogue"
                />
                <StatCard 
                    title="Low Stock Alerts" 
                    value={fmt(summary.lowStockItems)} 
                    icon={<AlertTriangle size={24} />} 
                    color={summary.lowStockItems > 0 ? "#dc2626" : "#16a34a"} 
                    link="/inventory"
                    subtitle={summary.lowStockItems > 0 ? "Requires immediate attention" : "All stock levels optimal"}
                />
            </div>

            {/* Charts Section 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Revenue Line Chart */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <BarChart2 size={20} color="#16a34a" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Monthly Revenue</h3>
                    </div>
                    {filteredRevenue.length === 0 ? <EmptyState title="Revenue" /> : (
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <LineChart data={filteredRevenue} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                    <YAxis 
                                        tickFormatter={fmtCurrency} 
                                        axisLine={false} tickLine={false} 
                                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        formatter={(value) => [fmtCurrency(value), 'Revenue']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#16a34a" 
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#16a34a' }}
                                        activeDot={{ r: 6, stroke: '#15803d', strokeWidth: 2 }}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Payment Status Pie Chart */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Payment Status</h3>
                    {pieData.length === 0 ? <EmptyState title="Payment" /> : (
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%" cy="45%"
                                        innerRadius={60} outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1000}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.name === 'Paid' ? '#16a34a' :
                                                entry.name === 'Pending' ? '#d97706' :
                                                entry.name === 'Partial' ? '#0284c7' : '#dc2626'
                                            } />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => fmtCurrency(value)}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Section 2 */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Top Performing Products</h3>
                {topProducts.length === 0 ? <EmptyState title="Product" /> : (
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer>
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" tickFormatter={fmtCurrency} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis 
                                    type="category" dataKey="product_name" 
                                    axisLine={false} tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                                    width={120}
                                />
                                <Tooltip 
                                    formatter={(value) => [fmtCurrency(value), 'Revenue']}
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar 
                                    dataKey="total_revenue" 
                                    fill="#16a34a" 
                                    radius={[0, 6, 6, 0]}
                                    barSize={24}
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
