import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../../services/productService';
import { createOrder } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import {
    Loader2, Plus, Trash2, ShoppingCart, IndianRupee,
    Package, AlertTriangle, CheckCircle2, XCircle, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const GST_RATE = 0.09; // 9% CGST + 9% SGST = 18% total
const EMPTY_ROW = { product_id: '', variant_id: '', quantity: '' };

// ── Small reusable helpers ────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const StockBadge = ({ qty }) => {
    if (qty === undefined || qty === null) return null;
    const n = Number(qty);
    if (n <= 0) return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px',
            borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#b91c1c',
            border: '1px solid #fecaca', textTransform: 'uppercase', letterSpacing: '0.04em'
        }}>
            <XCircle size={10} /> Out of Stock
        </span>
    );
    if (n <= 10) return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px',
            borderRadius: '9999px', backgroundColor: '#fef3c7', color: '#b45309',
            border: '1px solid #fde68a', textTransform: 'uppercase', letterSpacing: '0.04em'
        }}>
            <AlertTriangle size={10} /> Low Stock ({n})
        </span>
    );
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px',
            borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#166534',
            border: '1px solid #bbf7d0', textTransform: 'uppercase', letterSpacing: '0.04em'
        }}>
            <CheckCircle2 size={10} /> In Stock ({n})
        </span>
    );
};

const SummaryRow = ({ label, value, bold, large, accent }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: large ? '1.1rem' : '0.875rem',
        fontWeight: bold ? '800' : '500',
        color: accent || (bold ? '#111827' : '#4b5563'),
        padding: large ? '0.75rem 0 0' : '0'
    }}>
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const CreateOrder = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [products, setProducts]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rows, setRows]             = useState([{ ...EMPTY_ROW }]);

    // Load full product catalogue (with inventory stock)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res  = await getAllProducts({ limit: 1000 });
                const data = res?.data;
                setProducts(Array.isArray(data) ? data : (data?.data || []));
            } catch {
                toast.error('Failed to load product catalogue.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // ── Row helpers ────────────────────────────────────────────────────────
    const updateRow = (index, field, value) => {
        setRows(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            if (field === 'product_id') {
                next[index].variant_id = '';
                next[index].quantity   = '';
            }
            return next;
        });
    };

    const addRow    = () => setRows(prev => [...prev, { ...EMPTY_ROW }]);
    const removeRow = (i) => {
        if (rows.length === 1) { setRows([{ ...EMPTY_ROW }]); return; }
        setRows(prev => prev.filter((_, idx) => idx !== i));
    };

    // ── Per-row computed data ──────────────────────────────────────────────
    const enrichedRows = useMemo(() => rows.map(row => {
        const product  = products.find(p => p.id === Number(row.product_id));
        const variants = Array.isArray(product?.variants) ? product.variants : [];
        const variant  = variants.find(v => v.id === Number(row.variant_id));
        const qty      = parseFloat(row.quantity) || 0;
        const price    = Number(variant?.price) || 0;
        const stock    = variant ? Number(variant.quantity_available ?? 0) : undefined;
        const subtotal = qty > 0 && price > 0 ? qty * price : 0;
        const stockOk  = variant ? stock > 0 : true; // true when no variant chosen yet
        return { ...row, product, variants, variant, qty, price, stock, subtotal, stockOk };
    }), [rows, products]);

    // ── Live GST calculations ──────────────────────────────────────────────
    const taxableAmount = useMemo(() => enrichedRows.reduce((s, r) => s + r.subtotal, 0), [enrichedRows]);
    const cgst          = taxableAmount * GST_RATE;
    const sgst          = taxableAmount * GST_RATE;
    const totalTax      = cgst + sgst;
    const finalAmount   = taxableAmount + totalTax;

    const hasItems     = enrichedRows.some(r => r.variant_id && r.qty > 0);
    const hasOutOfStock = enrichedRows.some(r => r.variant_id && !r.stockOk);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const validItems = enrichedRows.filter(r => r.variant_id && r.qty > 0);
        if (validItems.length === 0) {
            toast.error('Add at least one item with a variant and quantity.');
            return;
        }
        for (const r of validItems) {
            if (!Number.isFinite(r.qty) || r.qty <= 0) {
                toast.error(`Invalid quantity for "${r.product?.name}".`);
                return;
            }
            if (r.qty > (r.stock ?? Infinity)) {
                toast.error(`"${r.product?.name}" only has ${r.stock} units available.`);
                return;
            }
            if (!r.stockOk) {
                toast.error(`"${r.product?.name} (${r.variant?.size})" is out of stock.`);
                return;
            }
        }

        const confirmed = window.confirm(
            `Place order for ₹${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (incl. 18% GST)?`
        );
        if (!confirmed) return;

        setSubmitting(true);
        try {
            const items = validItems.map(r => ({ variant_id: Number(r.variant_id), quantity: r.qty }));
            await createOrder({ items });
            toast.success('Order placed successfully!');
            navigate('/orders');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to place order.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading state ──────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '420px', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Loader2 size={44} color="#16a34a" style={{ animation: 'spin 1.2s linear infinite' }} />
            <p style={{ color: '#6b7280', fontWeight: '500', margin: 0 }}>Loading product catalogue…</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div style={{ animation: 'fadeIn 0.3s ease', fontFamily: "'Inter', sans-serif" }}>
            {/* Page header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: '0 0 0.35rem 0', fontSize: '1.875rem', fontWeight: '800', color: '#111827' }}>
                    Create New Order
                </h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.925rem' }}>
                    Select products, pick a variant, enter quantity — GST calculated automatically.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

                {/* ── LEFT: Item cards ─────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Column labels */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 110px 44px',
                        gap: '0.75rem', padding: '0 0.5rem',
                        fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af',
                        textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>
                        <span>Product</span>
                        <span>Variant / Size</span>
                        <span>Qty</span>
                        <span />
                    </div>

                    {enrichedRows.map((row, index) => (
                        <div key={index} style={{
                            backgroundColor: '#ffffff',
                            border: `1.5px solid ${row.variant_id && !row.stockOk ? '#fecaca' : '#e5e7eb'}`,
                            borderRadius: '12px',
                            padding: '1.25rem',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            transition: 'border-color 0.2s'
                        }}>
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr 110px 44px',
                                gap: '0.75rem', alignItems: 'center'
                            }}>

                                {/* Product select */}
                                <div>
                                    <div style={{ position: 'relative' }}>
                                        <Package size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                        <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                        <select
                                            value={row.product_id}
                                            onChange={e => updateRow(index, 'product_id', e.target.value)}
                                            style={{
                                                width: '100%', padding: '0.65rem 2rem 0.65rem 2.1rem',
                                                border: '1px solid #d1d5db', borderRadius: '8px',
                                                backgroundColor: '#f9fafb', fontSize: '0.875rem',
                                                color: '#111827', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box'
                                            }}
                                        >
                                            <option value="">Select product…</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Variant select */}
                                <div style={{ opacity: row.product_id ? 1 : 0.5 }}>
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                        <select
                                            value={row.variant_id}
                                            onChange={e => updateRow(index, 'variant_id', e.target.value)}
                                            disabled={!row.product_id}
                                            style={{
                                                width: '100%', padding: '0.65rem 2rem 0.65rem 0.75rem',
                                                border: '1px solid #d1d5db', borderRadius: '8px',
                                                backgroundColor: row.product_id ? '#f9fafb' : '#f3f4f6',
                                                fontSize: '0.875rem', color: '#111827',
                                                appearance: 'none', cursor: row.product_id ? 'pointer' : 'not-allowed',
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            <option value="">Select variant…</option>
                                            {row.variants.map(v => (
                                                <option key={v.id} value={v.id} disabled={!v.in_stock}>
                                                    {v.size} — ₹{Number(v.price).toLocaleString('en-IN')} / {v.unit}
                                                    {!v.in_stock ? ' (Out of Stock)' : v.quantity_available <= 10 ? ` (${v.quantity_available} left)` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Stock badge shown below variant dropdown */}
                                    {row.variant_id && (
                                        <div style={{ marginTop: '5px' }}>
                                            <StockBadge qty={row.stock} />
                                        </div>
                                    )}
                                </div>

                                {/* Quantity input */}
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={row.quantity}
                                    onChange={e => updateRow(index, 'quantity', e.target.value)}
                                    disabled={!row.variant_id || !row.stockOk}
                                    placeholder="Qty"
                                    style={{
                                        padding: '0.65rem 0.75rem',
                                        border: `1px solid ${row.qty > (row.stock ?? Infinity) ? '#fca5a5' : '#d1d5db'}`,
                                        borderRadius: '8px',
                                        backgroundColor: (row.variant_id && row.stockOk) ? '#fff' : '#f3f4f6',
                                        fontSize: '0.875rem', color: '#111827',
                                        width: '100%', boxSizing: 'border-box',
                                        cursor: (row.variant_id && row.stockOk) ? 'text' : 'not-allowed'
                                    }}
                                />

                                {/* Remove row */}
                                <button
                                    onClick={() => removeRow(index)}
                                    style={{
                                        width: '44px', height: '44px', border: '1px solid #fecaca',
                                        borderRadius: '8px', backgroundColor: '#fef2f2', color: '#ef4444',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Out-of-stock warning inline */}
                            {row.variant_id && !row.stockOk && (
                                <div style={{
                                    marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 0.875rem', backgroundColor: '#fef2f2',
                                    borderRadius: '6px', border: '1px solid #fecaca'
                                }}>
                                    <XCircle size={14} color="#b91c1c" />
                                    <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: '600' }}>
                                        This variant is out of stock. Please choose another.
                                    </span>
                                </div>
                            )}

                            {/* Subtotal row */}
                            {row.subtotal > 0 && row.stockOk && (
                                <div style={{
                                    marginTop: '0.75rem', paddingTop: '0.75rem',
                                    borderTop: '1px dashed #e5e7eb',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        {row.qty} {row.variant?.unit} × ₹{fmt(row.price)}
                                    </span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#16a34a' }}>
                                        ₹{fmt(row.subtotal)}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add row button */}
                    <button
                        onClick={addRow}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem', padding: '0.85rem',
                            border: '2px dashed #d1d5db', borderRadius: '10px',
                            backgroundColor: 'transparent', color: '#6b7280',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.color = '#16a34a'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <Plus size={18} /> Add Another Item
                    </button>
                </div>

                {/* ── RIGHT: Bill summary card ─────────────────────────── */}
                <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                        backgroundColor: '#ffffff', borderRadius: '14px',
                        border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                        overflow: 'hidden'
                    }}>
                        {/* Card header */}
                        <div style={{
                            padding: '0.875rem 1.25rem', backgroundColor: '#f0fdf4',
                            borderBottom: '1px solid #bbf7d0',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <ShoppingCart size={16} color="#16a34a" />
                            <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Bill Summary
                            </h3>
                        </div>

                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <SummaryRow label="Items in order" value={enrichedRows.filter(r => r.subtotal > 0).length} />
                            <SummaryRow label="Taxable Amount" value={`₹${fmt(taxableAmount)}`} />

                            <div style={{ height: '1px', backgroundColor: '#f3f4f6' }} />

                            {/* GST block */}
                            <div style={{
                                backgroundColor: '#f9fafb', borderRadius: '8px',
                                padding: '0.875rem', border: '1px solid #e5e7eb',
                                display: 'flex', flexDirection: 'column', gap: '0.5rem'
                            }}>
                                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.7rem', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    GST Breakdown (18%)
                                </p>
                                <SummaryRow label="CGST (9%)" value={`₹${fmt(cgst)}`} />
                                <SummaryRow label="SGST (9%)" value={`₹${fmt(sgst)}`} />
                                <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
                                <SummaryRow label="Total GST" value={`₹${fmt(totalTax)}`} bold />
                            </div>

                            {/* Grand total */}
                            <div style={{ borderTop: '2px solid #16a34a', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', fontSize: '1rem', color: '#111827' }}>Grand Total</span>
                                <span style={{ fontWeight: '900', fontSize: '1.6rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <IndianRupee size={20} />{fmt(finalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Out-of-stock warning summary */}
                    {hasOutOfStock && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                            padding: '0.875rem', backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca', borderRadius: '8px'
                        }}>
                            <XCircle size={16} color="#b91c1c" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#b91c1c', lineHeight: '1.5', fontWeight: '600' }}>
                                One or more items are out of stock. Remove or replace them before placing the order.
                            </p>
                        </div>
                    )}

                    {/* No items hint */}
                    {!hasItems && !hasOutOfStock && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                            padding: '0.875rem', backgroundColor: '#fffbeb',
                            border: '1px solid #fde68a', borderRadius: '8px'
                        }}>
                            <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#b45309', lineHeight: '1.5' }}>
                                Select a product, variant and quantity to see live pricing.
                            </p>
                        </div>
                    )}

                    {/* Place order button */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !hasItems || hasOutOfStock}
                        style={{
                            width: '100%', padding: '1rem',
                            backgroundColor: (submitting || !hasItems || hasOutOfStock) ? '#86efac' : '#16a34a',
                            color: 'white', border: 'none', borderRadius: '10px',
                            fontWeight: '700', fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            cursor: (submitting || !hasItems || hasOutOfStock) ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            boxShadow: (hasItems && !hasOutOfStock) ? '0 4px 12px rgba(22,163,74,0.4)' : 'none'
                        }}
                        onMouseOver={e => { if (!submitting && hasItems && !hasOutOfStock) e.currentTarget.style.backgroundColor = '#15803d'; }}
                        onMouseOut={e => { if (!submitting && hasItems && !hasOutOfStock) e.currentTarget.style.backgroundColor = '#16a34a'; }}
                    >
                        {submitting ? <Loader2 size={18} style={{ animation: 'spin 1.2s linear infinite' }} /> : <ShoppingCart size={18} />}
                        {submitting ? 'Placing Order…' : 'Place Order'}
                    </button>

                    {hasItems && !hasOutOfStock && (
                        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
                            A confirmation dialog will appear before submitting.
                        </p>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin   { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default CreateOrder;
