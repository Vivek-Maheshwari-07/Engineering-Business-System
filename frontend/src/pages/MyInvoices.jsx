import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, Eye, Search, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const MyInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const fetchMyInvoices = async () => {
        try {
            const res = await api.get('/invoices/my');
            setInvoices(res.data);
        } catch {
            console.error('Failed to load your invoices.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMyInvoices(); }, []);

    const statusStyle = {
        'sent': 'bg-blue-100 text-blue-700',
        'paid': 'bg-green-100 text-green-700',
        'overdue': 'bg-red-100 text-red-700',
        'draft': 'bg-slate-100 text-slate-600',
    };

    const filtered = invoices.filter(i => 
        i.invoice_number?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">My Invoices</h1>
                <p className="text-sm text-slate-500 mt-1">View and download your billing statements.</p>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by invoice number..." 
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> :
                filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <FileText className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                        <p className="font-medium">No invoices found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-600 underline">#{inv.invoice_number}</td>
                                        <td className="px-6 py-4 text-slate-600">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">₹{Number(inv.total).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[inv.status]}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyInvoices;
