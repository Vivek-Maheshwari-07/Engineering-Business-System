import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Search, Filter, CheckCircle, XCircle, Clock, ExternalLink, Loader2, Download } from 'lucide-react';
import DetailModal from '../components/DetailModal';
import { generateInvoicePDF } from '../utils/invoiceGenerator';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [detailOrder, setDetailOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/orders/${id}/status`, { status: newStatus });
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch {
            alert('Failed to update status');
        }
    };

    const statusStyle = {
        'pending': 'bg-amber-100 text-amber-700',
        'approved': 'bg-blue-100 text-blue-700',
        'shipped': 'bg-indigo-100 text-indigo-700',
        'delivered': 'bg-green-100 text-green-700',
        'cancelled': 'bg-red-100 text-red-700',
    };

    const filtered = orders.filter(o => {
        const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                              o.customer_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const openDetail = async (id) => {
        try {
            const res = await api.get(`/orders/${id}`);
            setDetailOrder({ ...res.data, invoice_number: res.data.order_number });
        } catch {
            alert('Failed to load order details');
        }
    };

    const handleDownload = async (id) => {
        try {
            const res = await api.get(`/orders/${id}`);
            generateInvoicePDF({ ...res.data, invoice_number: res.data.order_number });
        } catch {
            alert('Failed to generate PDF');
        }
    };

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
                <p className="text-sm text-slate-500 mt-1">Review and process customer material requests.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by order # or customer..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    {['all', 'pending', 'approved', 'shipped'].map(s => (
                        <button 
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                                statusFilter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                        <p>Syncing orders...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-20 text-center">
                        <Clock className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500">No matching orders found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Order Info</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs font-black text-blue-600">{order.order_number}</span>
                                                <span className="text-[10px] text-slate-400 mt-1">{new Date(order.created_at).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                                    {order.customer_name?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 leading-none">{order.customer_name}</span>
                                                    <span className="text-[10px] text-slate-400 mt-1">{order.customer_email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-black text-slate-900">₹{Number(order.subtotal).toLocaleString()}</td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openDetail(order.id)}
                                                    className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDownload(order.id)}
                                                    className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Download Order Copy"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                {order.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'approved')}
                                                        className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                                                        title="Approve Order"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {order.status !== 'cancelled' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                        className="p-2 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                                        title="Cancel Order"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <DetailModal 
                isOpen={!!detailOrder} 
                onClose={() => setDetailOrder(null)} 
                title={detailOrder ? `Order: ${detailOrder.order_number}` : ''}
                data={detailOrder}
                type="invoice"
            />
        </div>
    );
};

export default AdminOrders;
