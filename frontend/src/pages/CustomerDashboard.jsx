import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, CreditCard, History, LayoutDashboard, ShoppingCart, Loader2 } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        myOrders: 0,
        approvedOrders: 0,
        totalSpent: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/customer');
            setStats(res.data);
        } catch {
            console.error('Failed to fetch customer stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const cards = [
        { name: 'Your Orders', value: stats.myOrders, icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600', link: '/customer/orders' },
        { name: 'Approved Requests', value: stats.approvedOrders, icon: History, color: 'bg-green-50 text-green-600', link: '/customer/orders' },
        { name: 'Total Invested', value: `₹${Number(stats.totalSpent).toLocaleString()}`, icon: CreditCard, color: 'bg-blue-50 text-blue-600', link: '/customer/invoices' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <LayoutDashboard className="h-8 w-8 text-blue-600" /> Welcome Portal
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Hello, <span className="text-blue-600 font-bold">{user?.name}</span>. Trace your business activity here.</p>
                </div>
                <Link 
                    to="/customer/orders"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100 hover:shadow-blue-200"
                >
                    <ShoppingCart className="h-4 w-4" /> Place New Order
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link key={card.name} to={card.link} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${card.color} group-hover:scale-110 transition-transform`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Report</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{card.name}</h3>
                                <p className="text-3xl font-black text-slate-900 mt-2">{loading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : card.value}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                {/* Information Tile */}
                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                        <ShoppingBag className="h-60 w-60" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-widest mb-6 relative z-10">Material Procurement</h2>
                    <p className="text-slate-400 leading-relaxed mb-8 relative z-10 font-medium">
                        Request high-quality engineering materials directly through our portal. Track your requests in real-time from the "My Orders" tab. All requests are reviewed by our admin team before processing.
                    </p>
                    <Link to="/customer/orders" className="relative z-10 inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all">
                        Browse Materials <History className="h-4 w-4" />
                    </Link>
                </div>

                {/* Account Settings / Quick Info */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex-1">
                        <h2 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-wider">Profile Details</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
                                <span className="text-sm font-bold text-slate-700">{user?.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Type</span>
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest text-[10px]">Customer Premium</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joining Date</span>
                                <span className="text-sm font-bold text-slate-700">March 2026</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                         <div className="relative z-10">
                            <h3 className="font-black italic text-lg uppercase tracking-tighter">Need Assistance?</h3>
                            <p className="text-blue-100 text-xs mt-2 font-medium">Our helpdesk is active 24/7 for engineering material inquiries.</p>
                            <button className="mt-4 text-xs font-black uppercase tracking-widest bg-blue-700/50 px-4 py-2 rounded-xl hover:bg-blue-800 transition-all border border-blue-500/30">
                                Open Ticket
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
