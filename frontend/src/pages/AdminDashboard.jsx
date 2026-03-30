import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalInventory: 0,
        pendingOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/admin');
            setStats(res.data);
        } catch {
            console.error('Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        { name: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'bg-blue-50 text-blue-600', trend: '+2 new' },
        { name: 'Inventory Items', value: stats.totalInventory, icon: Package, color: 'bg-indigo-50 text-indigo-600', trend: 'Stocks ok' },
        { name: 'Pending Orders', value: stats.pendingOrders, icon: Activity, color: 'bg-amber-50 text-amber-600', trend: 'Needs action' },
        { name: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toLocaleString()}`, icon: TrendingUp, color: 'bg-green-50 text-green-600', trend: 'All-time' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Welcome back, <span className="font-bold text-blue-600 underline">{user?.name}</span>!</p>
                </div>
                <div className="hidden sm:block">
                    <button className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all">
                        Company Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.name}</p>
                                <div className={`p-2 rounded-xl ${stat.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline justify-between">
                                <p className="text-2xl font-black text-slate-900">{loading ? '...' : stat.value}</p>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Systems Status */}
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2rem] text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-40 w-40" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-wider mb-6">System Health & Operations</h2>
                    <div className="space-y-8 relative z-10">
                        <div className="flex gap-4">
                            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Server Uptime</h3>
                                <p className="text-slate-400 text-sm">99.98% stable. Last backup 2 hours ago.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Clock className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Daily Activity</h3>
                                <p className="text-slate-400 text-sm">Active employees currently online: 12</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-6">Management</h2>
                        <div className="space-y-3">
                            {['Add New Product', 'Create Invoice', 'Approve Orders'].map(act => (
                                <button key={act} className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-sm transition-all flex items-center justify-between border border-transparent hover:border-blue-100">
                                    {act} <FileText className="h-4 w-4 opacity-50" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Database</p>
                        <p className="text-xs font-bold text-slate-600 mt-1 italic">engineering_business_db</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
