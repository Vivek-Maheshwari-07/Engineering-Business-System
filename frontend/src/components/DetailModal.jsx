import React from 'react';
import { X, Calendar, FileText, User, ShoppingBag, CreditCard } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, title, data, type }) => {
    if (!isOpen || !data) return null;

    const renderInvoiceDetails = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Invoice No
                    </p>
                    <p className="text-sm font-bold text-slate-900">{data.invoice_number}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Date
                    </p>
                    <p className="text-sm font-bold text-slate-900">{new Date(data.created_at).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <User className="h-3 w-3" /> Customer
                    </p>
                    <p className="text-sm font-bold text-slate-900">{data.customer_name}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> Status
                    </p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        data.status === 'paid' ? 'bg-green-100 text-green-700' : 
                        data.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                        {data.status}
                    </span>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Line Items
                </h4>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold text-slate-600">Item</th>
                                <th className="px-4 py-2 text-right font-semibold text-slate-600">Qty</th>
                                <th className="px-4 py-2 text-right font-semibold text-slate-600">Rate</th>
                                <th className="px-4 py-2 text-right font-semibold text-slate-600">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(data.items || []).map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 text-slate-700 font-medium">{item.description || item.product_name}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">₹{Number(item.price || item.unit_price).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">₹{Number(item.amount).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold">
                            <tr className="border-t border-slate-200">
                                <td colSpan="3" className="px-4 py-2 text-right text-slate-500">Subtotal</td>
                                <td className="px-4 py-2 text-right text-slate-900">₹{Number(data.subtotal).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="px-4 py-2 text-right text-slate-500">GST ({data.gst_rate}%)</td>
                                <td className="px-4 py-2 text-right text-slate-900">₹{Number(data.gst_amount).toLocaleString()}</td>
                            </tr>
                            <tr className="bg-blue-50 text-blue-700 text-lg">
                                <td colSpan="3" className="px-4 py-3 text-right">Grand Total</td>
                                <td className="px-4 py-3 text-right">₹{Number(data.total).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderInventoryDetails = () => (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    {data.category || 'General'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    data.status === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {data.status?.replace('_', ' ')}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SKU / HSN</p>
                    <p className="text-lg font-bold text-slate-900">{data.sku} / {data.hsn_code || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Stock</p>
                    <p className="text-lg font-bold text-slate-900">{data.quantity} {data.unit || 'pcs'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit Price</p>
                    <p className="text-lg font-bold text-slate-900">₹{Number(data.price).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Minimum Stock Level</p>
                    <p className="text-lg font-bold text-slate-900">{data.min_stock || 0} {data.unit || 'pcs'}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                    {data.description || 'No description provided for this item.'}
                </div>
            </div>

            <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Supplier Information</p>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{data.supplier || 'N/A'}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform transition-all animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                        <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">{type === 'invoice' ? 'Transaction Record' : 'Inventory Asset'}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {type === 'invoice' ? renderInvoiceDetails() : renderInventoryDetails()}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all hover:shadow-sm"
                    >
                        Close
                    </button>
                    {type === 'invoice' && (
                        <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                            Download PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailModal;
