import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Package, ShoppingCart,
    FileText, BarChart2, Boxes, CreditCard,
    IndianRupee, PlusCircle, ClipboardList
} from 'lucide-react';

const Sidebar = () => {
    const { role } = useAuth();
    const location = useLocation();

    const getLinkStyle = (path) => {
        const isActive = location.pathname.startsWith(path) && (path !== '/' || location.pathname === '/');
        return {
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1.1rem', marginBottom: '0.35rem',
            borderRadius: '14px', textDecoration: 'none',
            color: isActive ? 'var(--color-primary-dark)' : 'var(--color-gray-dark)',
            backgroundColor: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
            fontWeight: isActive ? '700' : '500',
            fontSize: '0.95rem',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            borderLeft: isActive ? '4px solid var(--color-primary)' : '4px solid transparent',
            paddingLeft: isActive ? '1.25rem' : '1.1rem',
        };
    };

    const Section = ({ label }) => (
        <p style={{
            fontSize: '0.68rem', textTransform: 'uppercase', color: '#94a3b8',
            fontWeight: '700', margin: '1.25rem 0 0.5rem 0',
            paddingLeft: '1.1rem', letterSpacing: '0.08em'
        }}>{label}</p>
    );

    return (
        <aside style={{
            width: '260px', backgroundColor: 'var(--color-white)',
            borderRight: '1px solid rgba(15, 23, 42, 0.05)',
            display: 'flex', flexDirection: 'column',
            height: '100%', overflowY: 'auto', flexShrink: 0,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.01)',
        }}>
            {/* Logo */}
            <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(15, 23, 42, 0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
                    <Boxes color="#ffffff" size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2, fontFamily: "'Outfit', sans-serif" }}>Hari Krupa</div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engineering ERP</div>
                </div>
            </div>

            <nav style={{ padding: '0.75rem', flex: 1 }}>
                <Section label="General" />
                {role !== 'customer' && (
                    <Link to="/" style={getLinkStyle('/')}>
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                )}
                <Link to="/products" style={getLinkStyle('/products')}>
                    <Package size={18} /> Product Catalog
                </Link>

                {/* ── Owner ── */}
                {role === 'owner' && (
                    <>
                        <Section label="Management" />
                        <Link to="/users" style={getLinkStyle('/users')}>
                            <Users size={18} /> User Management
                        </Link>
                        <Link to="/inventory" style={getLinkStyle('/inventory')}>
                            <Boxes size={18} /> Inventory
                        </Link>
                        <Link to="/orders" style={getLinkStyle('/orders')}>
                            <ShoppingCart size={18} /> All Orders
                        </Link>
                        <Link to="/salary" style={getLinkStyle('/salary')}>
                            <IndianRupee size={18} /> Salary Management
                        </Link>

                        <Section label="Insights" />
                        <Link to="/reports" style={getLinkStyle('/reports')}>
                            <BarChart2 size={18} /> Reports & Analytics
                        </Link>
                    </>
                )}

                {/* ── Employee ── */}
                {role === 'employee' && (
                    <>
                        <Section label="Operations" />
                        <Link to="/inventory" style={getLinkStyle('/inventory')}>
                            <Boxes size={18} /> Inventory
                        </Link>
                        <Link to="/orders" style={getLinkStyle('/orders')}>
                            <ShoppingCart size={18} /> Orders
                        </Link>

                        <Section label="My Account" />
                        <Link to="/my-salary" style={getLinkStyle('/my-salary')}>
                            <IndianRupee size={18} /> My Salary
                        </Link>
                        <Link to="/reports" style={getLinkStyle('/reports')}>
                            <BarChart2 size={18} /> Reports
                        </Link>
                    </>
                )}

                {/* ── Customer ── */}
                {role === 'customer' && (
                    <>
                        <Section label="Shopping" />
                        <Link to="/create-order" style={getLinkStyle('/create-order')}>
                            <PlusCircle size={18} /> Create Order
                        </Link>
                        <Link to="/my-orders" style={getLinkStyle('/my-orders')}>
                            <ClipboardList size={18} /> My Orders
                        </Link>
                    </>
                )}
            </nav>

            {/* Role badge */}
            <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid rgba(15, 23, 42, 0.05)' }}>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-gray-dark)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Logged in as</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-primary-dark)', fontWeight: '700', textTransform: 'capitalize' }}>{role}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
