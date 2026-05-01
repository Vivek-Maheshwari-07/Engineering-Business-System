import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Package, ShoppingCart, IndianRupee, ArrowRight,
    Loader2, TrendingUp, AlertTriangle, CreditCard,
    BarChart2, Users, PlusCircle, ClipboardList,
    Boxes, Wallet
} from 'lucide-react';
import { getAllProducts } from '../services/productService';
import { getAllOrders } from '../services/orderService';
import toast from 'react-hot-toast';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, link, color, sub }) => (
    <Link to={link} style={{ textDecoration: 'none' }}>
        <div style={{
            backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb',
            display: 'flex', flexDirection: 'column', position: 'relative',
            overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
        }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
        >
            {/* Decorative circle */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '90px', height: '90px', backgroundColor: color, opacity: 0.08, borderRadius: '50%', transform: 'translate(30%,-30%)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, fontWeight: '600' }}>{title}</p>
                <div style={{ padding: '0.65rem', backgroundColor: `${color}18`, borderRadius: '10px', color, display: 'flex' }}>
                    {icon}
                </div>
            </div>
            <h3 style={{ margin: '0 0 0.4rem 0', color: '#111827', fontSize: '1.875rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{value}</h3>
            {sub && <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>{sub}</p>}
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color, fontSize: '0.8rem', fontWeight: '700' }}>
                View details <ArrowRight size={13} />
            </div>
        </div>
    </Link>
);

// ── Quick action card ─────────────────────────────────────────────────────────
const ActionCard = ({ title, desc, link, icon, accent }) => (
    <Link to={link || '#'} style={{ textDecoration: 'none' }}>
        <div style={{
            backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px',
            border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center',
            gap: '1rem', transition: 'all 0.2s', cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
            onMouseOver={e => { e.currentTarget.style.borderColor = accent || '#16a34a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
        >
            <div style={{ padding: '0.75rem', backgroundColor: `${accent || '#16a34a'}14`, borderRadius: '10px', color: accent || '#16a34a', flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: '0 0 0.2rem 0', color: '#1f2937', fontSize: '0.95rem', fontWeight: '700' }}>{title}</h4>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</p>
            </div>
            <ArrowRight size={16} color="#d1d5db" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </div>
    </Link>
);

// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user, role } = useAuth();
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0, lowStockCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const [productRes, orderRes] = await Promise.all([
                    getAllProducts({ limit: 1000 }),
                    getAllOrders()
                ]);

                const productsArray = Array.isArray(productRes?.data)
                    ? productRes.data
                    : (productRes?.data?.data || []);

                const ordersArray = Array.isArray(orderRes?.data)
                    ? orderRes.data
                    : (orderRes?.data?.data || orderRes?.data || []);

                // Revenue = only completed orders (not cancelled)
                const revenue = ordersArray
                    .filter(o => o.status === 'completed' || o.status === 'partially_paid')
                    .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

                const pendingOrders = ordersArray.filter(o => o.status === 'pending' || o.status === 'partially_paid').length;

                // Low stock: products with any variant having quantity_available <= 10
                const lowStockCount = productsArray.filter(p =>
                    Array.isArray(p.variants) && p.variants.some(v => Number(v.quantity_available ?? 0) <= 10)
                ).length;

                setStats({ totalProducts: productsArray.length, totalOrders: ordersArray.length, totalRevenue: revenue, pendingOrders, lowStockCount });
            } catch {
                toast.error('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const roleColor = { owner: '#7c3aed', employee: '#0369a1', customer: '#16a34a' };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ color: '#111827', margin: '0 0 0.4rem 0', fontSize: '2rem', fontWeight: '900' }}>
                        {greeting()}, <span style={{ color: '#16a34a' }}>{user?.name?.split(' ')[0] || 'User'}</span> 👋
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
                        Here's what's happening in your ERP system today.
                    </p>
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.8rem',
                    fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em',
                    backgroundColor: `${roleColor[role] || '#16a34a'}15`,
                    color: roleColor[role] || '#16a34a',
                    border: `1.5px solid ${roleColor[role] || '#16a34a'}30`
                }}>
                    <span style={{ width: '7px', height: '7px', backgroundColor: roleColor[role] || '#16a34a', borderRadius: '50%' }} />
                    {role}
                </span>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '300px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                    <Loader2 size={48} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
                    <p style={{ fontWeight: '500', color: '#4b5563', margin: 0 }}>Loading dashboard…</p>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <>
                    {/* ── Low Stock Alert Banner ─────────────────────────── */}
                    {stats.lowStockCount > 0 && (role === 'owner' || role === 'employee') && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.875rem 1.25rem', marginBottom: '1.75rem',
                            backgroundColor: '#fffbeb', border: '1.5px solid #fde68a',
                            borderRadius: '10px', borderLeft: '4px solid #f59e0b'
                        }}>
                            <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                            <div>
                                <p style={{ margin: 0, fontWeight: '700', color: '#92400e', fontSize: '0.9rem' }}>
                                    Low Stock Alert — {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's' : ''} running low
                                </p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#b45309' }}>
                                    Some variants have 10 or fewer units remaining.
                                </p>
                            </div>
                            <Link to="/inventory" style={{ marginLeft: 'auto', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                                View Inventory <ArrowRight size={13} />
                            </Link>
                        </div>
                    )}

                    {/* ── Pending Orders Alert ───────────────────────────── */}
                    {stats.pendingOrders > 0 && (role === 'owner' || role === 'employee') && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.875rem 1.25rem', marginBottom: '1.75rem',
                            backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe',
                            borderRadius: '10px', borderLeft: '4px solid #3b82f6'
                        }}>
                            <ShoppingCart size={20} color="#2563eb" style={{ flexShrink: 0 }} />
                            <p style={{ margin: 0, fontWeight: '700', color: '#1e40af', fontSize: '0.9rem' }}>
                                {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} awaiting action (Pending / Partially Paid)
                            </p>
                            <Link to="/orders" style={{ marginLeft: 'auto', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                                View Orders <ArrowRight size={13} />
                            </Link>
                        </div>
                    )}

                    {/* ── KPI Stats ─────────────────────────────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                        <StatCard
                            title="Total Products"
                            value={stats.totalProducts}
                            icon={<Package size={22} />}
                            link="/products"
                            color="#3b82f6"
                            sub="Active in catalog"
                        />
                        <StatCard
                            title={role === 'customer' ? 'My Orders' : 'Total Orders'}
                            value={stats.totalOrders}
                            icon={<ShoppingCart size={22} />}
                            link={role === 'customer' ? '/my-orders' : '/orders'}
                            color="#f59e0b"
                            sub={role !== 'customer' ? `${stats.pendingOrders} pending / partially paid` : undefined}
                        />
                        <StatCard
                            title={role === 'customer' ? 'Total Spent' : 'Confirmed Revenue'}
                            value={`₹${fmt(stats.totalRevenue)}`}
                            icon={<IndianRupee size={22} />}
                            link={role === 'customer' ? '/my-orders' : '/orders'}
                            color="#10b981"
                            sub="From completed + partially paid orders"
                        />
                    </div>

                    {/* ── Quick Actions ─────────────────────────────────── */}
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1f2937', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={16} color="#16a34a" /> Quick Actions
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '0.875rem' }}>
                        {role === 'owner' && (
                            <>
                                <ActionCard title="Manage Inventory" desc="Add or adjust stock levels." icon={<Boxes size={20} />} link="/inventory" />
                                <ActionCard title="View All Orders"  desc="Process and track customer orders." icon={<ClipboardList size={20} />} link="/orders" />
                                <ActionCard title="Salary Management" desc="Generate monthly payroll for employees." icon={<Wallet size={20} />} link="/salary" accent="#7c3aed" />
                                <ActionCard title="User Management"  desc="Manage roles for staff and customers." icon={<Users size={20} />} link="/users" accent="#0369a1" />
                                <ActionCard title="Reports & Analytics" desc="GST reports, revenue trends, stock." icon={<BarChart2 size={20} />} link="/reports" accent="#d97706" />
                            </>
                        )}
                        {role === 'employee' && (
                            <>
                                <ActionCard title="View Inventory" desc="Check stock levels and add stock." icon={<Boxes size={20} />} link="/inventory" />
                                <ActionCard title="Manage Orders"  desc="Process incoming customer orders." icon={<ClipboardList size={20} />} link="/orders" />
                                <ActionCard title="My Salary"      desc="View your payslip history." icon={<Wallet size={20} />} link="/my-salary" accent="#0369a1" />
                                <ActionCard title="Reports"        desc="View analytics and business reports." icon={<BarChart2 size={20} />} link="/reports" accent="#d97706" />
                            </>
                        )}
                        {role === 'customer' && (
                            <>
                                <ActionCard title="Place New Order" desc="Browse products and create an order." icon={<PlusCircle size={20} />} link="/create-order" />
                                <ActionCard title="My Orders"       desc="Track status and view your invoices." icon={<ClipboardList size={20} />} link="/my-orders" />
                                <ActionCard title="Product Catalog" desc="Browse the full product catalog." icon={<Package size={20} />} link="/products" />
                            </>
                        )}
                    </div>
                </>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Dashboard;
