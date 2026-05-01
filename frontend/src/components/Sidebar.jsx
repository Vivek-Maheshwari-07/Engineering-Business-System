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
            padding: '0.75rem 1.1rem', marginBottom: '0.15rem',
            borderRadius: '8px', textDecoration: 'none',
            color: isActive ? '#15803d' : '#4b5563',
            backgroundColor: isActive ? '#dcfce7' : 'transparent',
            fontWeight: isActive ? '600' : '500',
            fontSize: '0.9rem',
            transition: 'all 0.15s',
            borderLeft: isActive ? '3px solid #16a34a' : '3px solid transparent',
        };
    };

    const Section = ({ label }) => (
        <p style={{
            fontSize: '0.68rem', textTransform: 'uppercase', color: '#9ca3af',
            fontWeight: '800', margin: '1.25rem 0 0.4rem 0',
            paddingLeft: '1.1rem', letterSpacing: '0.08em'
        }}>{label}</p>
    );

    return (
        <aside style={{
            width: '240px', backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            display: 'flex', flexDirection: 'column',
            height: '100%', overflowY: 'auto', flexShrink: 0
        }}>
            {/* Logo */}
            <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '34px', height: '34px', backgroundColor: '#16a34a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Boxes color="#ffffff" size={20} />
                </div>
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#111827', lineHeight: 1.2 }}>Engg ERP</div>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: '500' }}>Business System</div>
                </div>
            </div>

            <nav style={{ padding: '0.75rem', flex: 1 }}>
                <Section label="General" />
                <Link to="/" style={getLinkStyle('/')}>
                    <LayoutDashboard size={18} /> Dashboard
                </Link>
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
            <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem', border: '1px solid #bbf7d0' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600' }}>Logged in as</div>
                        <div style={{ fontSize: '0.825rem', color: '#166534', fontWeight: '800', textTransform: 'capitalize' }}>{role}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
