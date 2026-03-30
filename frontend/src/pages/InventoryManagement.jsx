import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Plus, Pencil, Trash2, X, Search, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DetailModal from '../components/DetailModal';

const CATEGORIES = ['Alloy Steel', 'Raw Materials', 'Electrical', 'Mechanical', 'Civil', 'Electronics', 'Safety', 'Tools', 'Services', 'Other'];
const emptyForm = { name: '', category: '', sku: '', hsn_code: '', quantity: '', unit: 'pcs', price: '', min_stock: '5', supplier: '', description: '' };

const statusStyle = { in_stock: 'bg-green-100 text-green-700', low_stock: 'bg-amber-100 text-amber-700', out_of_stock: 'bg-red-100 text-red-700' };
const statusLabel = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };

const InventoryManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [detailItem, setDetailItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchItems = async () => {
        try {
            const res = await api.get('/inventory');
            setItems(res.data);
        } catch { setError('Failed to load inventory.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, []);

    const openAdd = () => { setEditItem(null); setForm(emptyForm); setError(''); setShowModal(true); };
    const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setError(''); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditItem(null); setForm(emptyForm); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); setError('');
        try {
            if (editItem) await api.put(`/inventory/${editItem.id}`, form);
            else await api.post('/inventory', form);
            await fetchItems();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete item "${name}"?`)) return;
        await api.delete(`/inventory/${id}`);
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const filtered = items.filter(i => {
        const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku || '').toLowerCase().includes(search.toLowerCase()) || (i.supplier || '').toLowerCase().includes(search.toLowerCase());
        const matchCategory = !categoryFilter || i.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    const lowStockCount = items.filter(i => i.status !== 'in_stock').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-sm text-slate-500 mt-1">{items.length} items total</p>
                </div>
                {isAdmin && (
                    <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <Plus className="h-4 w-4" /> Add Item
                    </button>
                )}
            </div>

            {/* Alert for low stock */}
            {lowStockCount > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <p className="text-sm font-medium">{lowStockCount} item(s) need restocking — check the highlighted rows below.</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="Search by name, SKU, supplier..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No inventory items found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Item', 'Category', 'SKU', 'HSN/SAC', 'Quantity', 'Unit Price', 'Supplier', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(item => (
                                    <tr key={item.id} className={`hover:bg-slate-50/70 transition-colors ${item.status !== 'in_stock' ? 'bg-amber-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description || ''}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{item.category || '—'}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.sku || '—'}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.hsn_code || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-semibold ${item.status === 'out_of_stock' ? 'text-red-600' : item.status === 'low_stock' ? 'text-amber-600' : 'text-slate-800'}`}>
                                                {item.quantity} {item.unit}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">₹{Number(item.price).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.supplier || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[item.status]}`}>{statusLabel[item.status]}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setDetailItem(item)}
                                                    className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                                    title="View Details"
                                                >
                                                    <ExternalLink className="h-4 w-4" /> View
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors shadow-sm"><Pencil className="h-4 w-4" /></button>
                                                        <button onClick={() => handleDelete(item.id, item.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shadow-sm"><Trash2 className="h-4 w-4" /></button>
                                                    </>
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

            {/* Modal */}
            {showModal && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Name *</label>
                                    <input required className="input-field" placeholder="e.g. Steel Rod 12mm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        <option value="">Select...</option>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                                    <input className="input-field" placeholder="SKU-001" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">HSN/SAC</label>
                                    <input className="input-field" placeholder="8480" value={form.hsn_code} onChange={e => setForm({...form, hsn_code: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                                    <input required type="number" min="0" className="input-field" placeholder="100" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                    <select className="input-field" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                                        {['pcs', 'kg', 'ltr', 'm', 'box', 'set', 'roll'].map(u => <option key={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (₹)</label>
                                    <input type="number" min="0" step="0.01" className="input-field" placeholder="250" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Min Stock Alert</label>
                                    <input type="number" min="0" className="input-field" placeholder="5" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                                    <input className="input-field" placeholder="Supplier company name" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea rows={2} className="input-field resize-none" placeholder="Optional notes..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                                    {submitting ? 'Saving...' : editItem ? 'Update' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DetailModal 
                isOpen={!!detailItem} 
                onClose={() => setDetailItem(null)} 
                title={detailItem?.name || ''}
                data={detailItem}
                type="inventory"
            />

            <style>{`.input-field { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.875rem; color: #1e293b; background: #f8fafc; outline: none; } .input-field:focus { box-shadow: 0 0 0 2px #3b82f6; border-color: #3b82f6; }`}</style>
        </div>
    );
};

export default InventoryManagement;
