import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    LogOut, 
    Settings, 
    Users, 
    Package, 
    FileText,
    Building2,
    ShoppingCart,
    X
} from 'lucide-react';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    const { user, logout } = useAuth();

    // Define links based on user role
    const getLinks = () => {
        const baseLinks = [
            { name: 'Dashboard', to: `/${user?.role || 'customer'}/dashboard`, icon: LayoutDashboard },
        ];

        if (user?.role === 'admin') {
            baseLinks.push(
                { name: 'Employees', to: '/admin/employees', icon: Users },
                { name: 'Inventory', to: '/admin/inventory', icon: Package },
                { name: 'Orders', to: '/admin/orders', icon: ShoppingCart },
                { name: 'Billing', to: '/admin/billing', icon: FileText },
                { name: 'Settings', to: '/admin/settings', icon: Settings }
            );
        } else if (user?.role === 'employee') {
            baseLinks.push(
                { name: 'Inventory Logs', to: '/employee/inventory', icon: Package },
                { name: 'Assigned Tasks', to: '/employee/tasks', icon: FileText }
            );
        } else {
            baseLinks.push(
                { name: 'My Orders', to: '/customer/orders', icon: Package },
                { name: 'Invoices', to: '/customer/invoices', icon: FileText }
            );
        }

        return baseLinks;
    };

    const links = getLinks();

    return (
        <>
            {/* Mobile backdrop */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity" 
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar component */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 text-blue-600">
                        <Building2 className="h-8 w-8" />
                        <span className="text-xl font-bold tracking-tight text-slate-800">EBM System</span>
                    </div>
                    <button 
                        className="lg:hidden text-slate-500 hover:text-slate-700"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4">
                    <nav className="flex-1 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={link.name}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                                        group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                                        ${isActive 
                                            ? 'bg-blue-50 text-blue-700' 
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'}
                                    `}
                                >
                                    <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                                        window.location.pathname.includes(link.to) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                                    }`} />
                                    {link.name}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 mb-4 border border-slate-100">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {user?.name || 'User Name'}
                            </p>
                            <p className="text-xs text-slate-500 truncate capitalize">
                                {user?.role || 'Role'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-400 group-hover:text-red-600 transition-colors" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
