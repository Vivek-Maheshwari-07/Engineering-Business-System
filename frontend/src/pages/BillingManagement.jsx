import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Plus, X, Trash2, Eye, CheckCircle, Clock, AlertCircle, Search, Download, ExternalLink } from 'lucide-react';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import DetailModal from '../components/DetailModal';


const statusStyle = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
};

const emptyItem = { description: '', hsn_code: '', quantity: 1, unit_price: '', amount: 0 };
const emptyForm = {
    customer_name: '', customer_email: '', customer_address: '', customer_gstin: '',
    gst_rate: 18, due_date: '', notes: '', status: 'draft',
};

const BillingManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [detailInvoice, setDetailInvoice] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [items, setItems] = useState([{ ...emptyItem }]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [invRes, itemsRes] = await Promise.all([
                api.get('/invoices'),
                api.get('/inventory')
            ]);
            setInvoices(invRes.data);
            setInventory(itemsRes.data);
        } catch {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        if (field === 'quantity' || field === 'unit_price') {
            updated[index].amount = (Number(updated[index].quantity) * Number(updated[index].unit_price)).toFixed(2);
        }
        setItems(updated);
    };

    const addItem = () => setItems([...items, { ...emptyItem }]);
    const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

    const subtotal = items.reduce((sum, i) => sum + Number(i.amount), 0);
    const gstAmount = ((subtotal * Number(form.gst_rate)) / 100);
    const total = subtotal + gstAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); setError('');
        try {
            await api.post('/invoices', {
                ...form,
                subtotal: subtotal.toFixed(2),
                gst_amount: gstAmount.toFixed(2),
                total: total.toFixed(2),
                items,
            });
            await fetchData();
            setShowModal(false);
            setForm(emptyForm);
            setItems([{ ...emptyItem }]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create invoice.');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this invoice?')) return;
        await api.delete(`/invoices/${id}`);
        setInvoices(prev => prev.filter(i => i.id !== id));
    };

    const handleDownload = async (id) => {
        try {
            const res = await api.get(`/invoices/${id}`);
            generateInvoicePDF(res.data);
        } catch {
            alert('Failed to generate PDF');
        }
    };

    const handleStatusChange = async (id, status) => {
        await api.patch(`/invoices/${id}/status`, { status });
        setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    };

    const handleGenerateReport = async () => {
        try {
            const res = await api.get('/invoices/report');
            const csvData = res.data.map(row => `${row.month},${row.invoice_count},${row.revenue},${row.tax_collected}`).join('\n');
            const csvContent = "data:text/csv;charset=utf-8,Month,Invoice Count,Revenue,Tax Collected\n" + csvData;
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Revenue_Report_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
        } catch {
            alert('Failed to generate report');
        }
    };

    const filtered = invoices.filter(i =>
        i.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
        i.customer_name?.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0);
    const pending = invoices.filter(i => i.status === 'sent' || i.status === 'draft').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Billing & Invoices</h1>
                    <p className="text-sm text-slate-500 mt-1">{invoices.length} invoices total</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <FileText className="h-4 w-4" /> Reports
                    </button>
                    <button 
                        onClick={() => setShowModal(true)} 
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> New Invoice
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Total Collected</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">₹{totalRevenue.toLocaleString('en-IN', {maximumFractionDigits:2})}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Pending Invoices</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{pending}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Total Invoices</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{invoices.length}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search invoices..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> :
                filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No invoices yet. Create your first one!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Invoice #', 'Customer', 'Amount', 'GST', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">{inv.invoice_number}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800">{inv.customer_name}</p>
                                            <p className="text-xs text-slate-400">{inv.customer_email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">₹{Number(inv.subtotal).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-slate-500">₹{Number(inv.gst_amount).toLocaleString('en-IN')} ({inv.gst_rate}%)</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">₹{Number(inv.total).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <select value={inv.status} onChange={e => handleStatusChange(inv.id, e.target.value)} className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${statusStyle[inv.status]}`}>
                                                {['draft','sent','paid','overdue'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">{new Date(inv.created_at).toLocaleDateString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setDetailInvoice(inv)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="View Details"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDownload(inv.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Download PDF"><Download className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Invoice Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Create New Invoice</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                            {/* Customer Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Customer Details</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Customer Name *</label>
                                        <input required className="input-field" placeholder="Customer name" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                                        <input type="email" className="input-field" placeholder="customer@email.com" value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                                        <input className="input-field" placeholder="Billing address" value={form.customer_address} onChange={e => setForm({...form, customer_address: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">GSTIN</label>
                                        <input className="input-field" placeholder="22AAAAA0000A1Z5" value={form.customer_gstin} onChange={e => setForm({...form, customer_gstin: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
                                        <input type="date" className="input-field" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Items / Services</h3>
                                <div className="space-y-2">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-4">
                                                <input className="input-field" list={`items-${idx}`} placeholder="Description" value={item.description} onChange={e => {
                                                    const val = e.target.value;
                                                    const found = inventory.find(i => i.name === val);
                                                    if (found) {
                                                        const updated = [...items];
                                                        updated[idx] = { ...updated[idx], description: found.name, unit_price: found.price, hsn_code: found.hsn_code, amount: (Number(found.price) * Number(updated[idx].quantity)).toFixed(2) };
                                                        setItems(updated);
                                                    } else {
                                                        updateItem(idx, 'description', val);
                                                    }
                                                }} />
                                                <datalist id={`items-${idx}`}>
                                                    {inventory.map(i => <option key={i.id} value={i.name}>{i.category} - ₹{i.price}</option>)}
                                                </datalist>
                                            </div>
                                            <div className="col-span-2">
                                                <input className="input-field text-xs" placeholder="HSN/SAC" value={item.hsn_code} onChange={e => updateItem(idx, 'hsn_code', e.target.value)} />
                                            </div>
                                            <div className="col-span-2">
                                                <input type="number" min="1" className="input-field" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                                            </div>
                                            <div className="col-span-2">
                                                <input type="number" min="0" step="0.01" className="input-field" placeholder="Rate" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                                            </div>
                                            <div className="col-span-1 text-right text-xs font-medium text-slate-700">₹{Number(item.amount).toLocaleString('en-IN')}</div>
                                            <div className="col-span-1 text-center">
                                                {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addItem} className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                    <Plus className="h-3.5 w-3.5" /> Add Item
                                </button>
                            </div>

                            {/* Totals */}
                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600 items-center">
                                    <span className="flex items-center gap-2">GST
                                        <select className="border border-slate-200 rounded px-2 py-0.5 text-xs" value={form.gst_rate} onChange={e => setForm({...form, gst_rate: e.target.value})}>
                                            {[0,5,12,18,28].map(r => <option key={r} value={r}>{r}%</option>)}
                                        </select>
                                    </span>
                                    <span>₹{gstAmount.toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2">
                                    <span>Total</span><span>₹{total.toLocaleString('en-IN', {maximumFractionDigits:2})}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                                <textarea rows={2} className="input-field resize-none" placeholder="Payment terms, bank details, etc." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                                    {submitting ? 'Creating...' : 'Create Invoice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Detail View Modal */}
            <DetailModal 
                isOpen={!!detailInvoice} 
                onClose={() => setDetailInvoice(null)} 
                title={detailInvoice ? `Invoice: ${detailInvoice.invoice_number}` : ''}
                data={detailInvoice}
                type="invoice"
            />

            <style>{`.input-field { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.875rem; color: #1e293b; background: #fff; outline: none; } .input-field:focus { box-shadow: 0 0 0 2px #3b82f6; border-color: #3b82f6; }`}</style>
        </div>
    );
};

export default BillingManagement;
