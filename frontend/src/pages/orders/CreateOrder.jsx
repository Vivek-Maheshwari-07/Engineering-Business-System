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
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px',
            borderRadius: '9999px', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)',
            border: '1px solid rgba(239, 68, 68, 0.1)', textTransform: 'uppercase', letterSpacing: '0.04em'
        }}>
            <XCircle size={12} /> Out of Stock
        </span>
    );
    if (n <= 10) return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px',
            borderRadius: '9999px', backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)',
            border: '1px solid rgba(245, 158, 11, 0.1)', textTransform: 'uppercase', letterSpacing: '0.04em'
        }}>
            <AlertTriangle size={12} /> Low Stock ({n})
        </span>
    );
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px',
            borderRadius: '9999px', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)',
            border: '1px solid rgba(16, 185, 129, 0.1)', textTransform: 'uppercase', letterSpacing: '0.04em'
        }}>
            <CheckCircle2 size={12} /> In Stock ({n})
        </span>
    );
};

const SummaryRow = ({ label, value, bold, large, accent }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: large ? '1.15rem' : '0.9rem',
        fontWeight: bold ? '700' : '500',
        color: accent || (bold ? 'var(--color-black)' : 'var(--color-gray-dark)'),
        padding: large ? '0.75rem 0 0' : '0',
        fontFamily: large ? "'Outfit', sans-serif" : "'Inter', sans-serif"
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
    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        console.log("Place Order button clicked!");

        const validItems = enrichedRows.filter(r => r.variant_id && r.qty > 0);
        console.log("Valid items:", validItems);

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

        try {
            const confirmed = window.confirm(
                `Place order for ₹${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (incl. 18% GST)?`
            );
            if (!confirmed) {
                console.log("Order placement cancelled by user.");
                return;
            }
        } catch (err) {
            console.warn("window.confirm blocked or failed, proceeding anyway", err);
        }

        console.log("Proceeding to API call...");
        setSubmitting(true);
        try {
            const items = validItems.map(r => ({ variant_id: Number(r.variant_id), quantity: r.qty }));
            const payload = { items };
            console.log("API Payload:", payload);
            await createOrder(payload);
            toast.success('Order placed successfully!');
            navigate('/orders');
        } catch (err) {
            console.error("API call failed:", err);
            toast.error(err?.response?.data?.message || 'Failed to place order.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading state ──────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '420px', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <Loader2 size={44} color="var(--color-primary)" style={{ animation: 'spin 1.2s linear infinite' }} />
            <p style={{ color: 'var(--color-gray-dark)', fontWeight: '500', margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem' }}>Loading product catalogue…</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div style={{ animation: 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)', fontFamily: "'Inter', sans-serif" }}>
            {/* Page header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--color-black)' }}>
                    Create New Order
                </h1>
                <p style={{ margin: 0, color: 'var(--color-gray-dark)', fontSize: '1rem', fontWeight: '400' }}>
                    Select products, pick a variant, enter quantity — GST is calculated automatically.
                </p>
            </div>

            <div className="order-grid">

                {/* ── LEFT: Item cards ─────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Column labels (hidden on smaller screens where cards stack) */}
                    <div className="order-labels" style={{
                        display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 44px',
                        gap: '1rem', padding: '0 0.5rem',
                        fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-gray-dark)',
                        textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>
                        <span>Product</span>
                        <span>Variant / Size</span>
                        <span>Qty</span>
                        <span />
                    </div>

                    {enrichedRows.map((row, index) => (
                        <div key={index} className={`item-card ${row.variant_id && !row.stockOk ? 'item-card-out-of-stock' : ''}`}>
                            <div className="item-card-grid">

                                {/* Product select */}
                                <div>
                                    <div style={{ position: 'relative' }}>
                                        <Package size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-dark)', pointerEvents: 'none' }} />
                                        <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-dark)', pointerEvents: 'none' }} />
                                        <select
                                            value={row.product_id}
                                            onChange={e => updateRow(index, 'product_id', e.target.value)}
                                            style={{
                                                width: '100%', paddingLeft: '2.5rem', paddingRight: '2.25rem',
                                                appearance: 'none', cursor: 'pointer', boxSizing: 'border-box'
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
                                <div style={{ opacity: row.product_id ? 1 : 0.6, transition: 'opacity 0.2s' }}>
                                    <div style={{ position: 'relative' }}>
                                        <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-dark)', pointerEvents: 'none' }} />
                                        <select
                                            value={row.variant_id}
                                            onChange={e => updateRow(index, 'variant_id', e.target.value)}
                                            disabled={!row.product_id}
                                            style={{
                                                width: '100%', paddingRight: '2.25rem',
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
                                        <div style={{ marginTop: '6px', display: 'flex' }}>
                                            <StockBadge qty={row.stock} />
                                        </div>
                                    )}
                                </div>

                                {/* Quantity input */}
                                <div>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={row.quantity}
                                        onChange={e => updateRow(index, 'quantity', e.target.value)}
                                        disabled={!row.variant_id || !row.stockOk}
                                        placeholder="Qty"
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            cursor: (row.variant_id && row.stockOk) ? 'text' : 'not-allowed',
                                            borderColor: row.qty > (row.stock ?? Infinity) ? 'var(--color-danger) !important' : ''
                                        }}
                                    />
                                </div>

                                {/* Remove row */}
                                <button
                                    onClick={() => removeRow(index)}
                                    className="trash-btn"
                                    title="Remove Item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Out-of-stock warning inline */}
                            {row.variant_id && !row.stockOk && (
                                <div style={{
                                    marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.65rem',
                                    padding: '0.75rem 1rem', backgroundColor: 'var(--color-danger-light)',
                                    borderRadius: 'var(--radius-control)', border: '1px solid rgba(239, 68, 68, 0.15)'
                                }}>
                                    <XCircle size={15} color="var(--color-danger)" />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: '600' }}>
                                        This variant is currently out of stock. Please choose another product or variant.
                                    </span>
                                </div>
                            )}

                            {/* Subtotal row */}
                            {row.subtotal > 0 && row.stockOk && (
                                <div style={{
                                    marginTop: '1rem', paddingTop: '1rem',
                                    borderTop: '1px dashed rgba(15, 23, 42, 0.08)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-gray-dark)' }}>
                                        {row.qty} {row.variant?.unit} × ₹{fmt(row.price)}
                                    </span>
                                    <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-primary-hover)', fontFamily: "'Outfit', sans-serif" }}>
                                        ₹{fmt(row.subtotal)}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add row button */}
                    <button
                        onClick={addRow}
                        className="plus-btn"
                    >
                        <Plus size={18} /> Add Another Item
                    </button>
                </div>

                {/* ── RIGHT: Bill summary card ─────────────────────────── */}
                <div className="checkout-sidebar">
                    <div className="glass-panel" style={{ overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                        {/* Card header */}
                        <div style={{
                            padding: '1.25rem 1.5rem', backgroundColor: 'var(--color-primary-light)',
                            borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
                            display: 'flex', alignItems: 'center', gap: '0.75rem'
                        }}>
                            <ShoppingCart size={18} color="var(--color-primary)" />
                            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Bill Summary
                            </h3>
                        </div>

                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <SummaryRow label="Items in order" value={enrichedRows.filter(r => r.subtotal > 0).length} />
                            <SummaryRow label="Taxable Amount" value={`₹${fmt(taxableAmount)}`} />

                            <div style={{ height: '1px', backgroundColor: 'rgba(15, 23, 42, 0.05)' }} />

                            {/* GST block */}
                            <div style={{
                                backgroundColor: 'rgba(15, 23, 42, 0.02)', borderRadius: 'var(--radius-control)',
                                padding: '1rem', border: '1px solid rgba(15, 23, 42, 0.04)',
                                display: 'flex', flexDirection: 'column', gap: '0.65rem'
                            }}>
                                <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-gray-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    GST Breakdown (18%)
                                </p>
                                <SummaryRow label="CGST (9%)" value={`₹${fmt(cgst)}`} />
                                <SummaryRow label="SGST (9%)" value={`₹${fmt(sgst)}`} />
                                <div style={{ height: '1px', backgroundColor: 'rgba(15, 23, 42, 0.06)' }} />
                                <SummaryRow label="Total GST" value={`₹${fmt(totalTax)}`} bold />
                            </div>

                            {/* Grand total */}
                            <div style={{ borderTop: '2px solid var(--color-primary)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-black)', fontFamily: "'Outfit', sans-serif" }}>Grand Total</span>
                                <span style={{ fontWeight: '900', fontSize: '1.8rem', color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', gap: '2px', fontFamily: "'Outfit', sans-serif" }}>
                                    <IndianRupee size={22} style={{ strokeWidth: 2.5 }} />{fmt(finalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Out-of-stock warning summary */}
                    {hasOutOfStock && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            padding: '1rem', backgroundColor: 'var(--color-danger-light)',
                            border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-control)',
                            animation: 'shake 0.4s ease'
                        }}>
                            <XCircle size={18} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-danger)', lineHeight: '1.5', fontWeight: '600' }}>
                                One or more items are out of stock. Remove or replace them before placing the order.
                            </p>
                        </div>
                    )}

                    {/* No items hint */}
                    {!hasItems && !hasOutOfStock && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            padding: '1rem', backgroundColor: 'var(--color-warning-light)',
                            border: '1px solid rgba(245, 158, 11, 0.12)', borderRadius: 'var(--radius-control)'
                        }}>
                            <AlertTriangle size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', lineHeight: '1.5', fontWeight: '500' }}>
                                Select a product, variant and quantity to see live pricing and place your order.
                            </p>
                        </div>
                    )}

                    {/* Place order button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !hasItems || hasOutOfStock}
                        style={{
                            width: '100%', padding: '1.1rem',
                            backgroundColor: (submitting || !hasItems || hasOutOfStock) ? 'var(--color-primary-light)' : 'var(--color-primary)',
                            color: (submitting || !hasItems || hasOutOfStock) ? 'var(--color-gray-dark)' : 'white',
                            border: 'none', borderRadius: 'var(--radius-control)',
                            fontWeight: '700', fontSize: '1rem',
                            fontFamily: "'Outfit', sans-serif",
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem',
                            cursor: (submitting || !hasItems || hasOutOfStock) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: (hasItems && !hasOutOfStock) ? '0 10px 24px -4px rgba(16, 185, 129, 0.35)' : 'none',
                            position: 'relative', zIndex: 50, pointerEvents: 'auto'
                        }}
                        onMouseOver={e => { if (!submitting && hasItems && !hasOutOfStock) { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px -4px rgba(16, 185, 129, 0.45)'; } }}
                        onMouseOut={e => { if (!submitting && hasItems && !hasOutOfStock) { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 24px -4px rgba(16, 185, 129, 0.35)'; } }}
                    >
                        {submitting ? <Loader2 size={20} className="spin-loader" /> : <ShoppingCart size={20} />}
                        {submitting ? 'Placing Order…' : 'Place Order'}
                    </button>

                    {hasItems && !hasOutOfStock && (
                        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-gray-dark)' }}>
                            A confirmation dialog will appear before submitting.
                        </p>
                    )}
                </div>
            </div>

            <style>{`
                .order-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 2rem;
                    align-items: start;
                }
                
                @media (max-width: 1024px) {
                    .order-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    .order-labels {
                        display: none !important;
                    }
                }
                
                .item-card {
                    background: var(--color-white);
                    border: 1px solid rgba(15, 23, 42, 0.06);
                    border-radius: var(--radius-premium);
                    padding: 1.5rem;
                    box-shadow: var(--shadow-premium);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .item-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-premium-hover);
                    border-color: rgba(16, 185, 129, 0.15);
                }
                
                .item-card-out-of-stock {
                    border-color: var(--color-danger) !important;
                    box-shadow: 0 4px 24px rgba(239, 68, 68, 0.06) !important;
                }
                
                .item-card-grid {
                    display: grid;
                    grid-template-columns: 2fr 2fr 1.2fr 44px;
                    gap: 1.25rem;
                    align-items: center;
                }
                
                @media (max-width: 768px) {
                    .item-card-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                    }
                    .item-card-grid > :nth-child(1) {
                        grid-column: span 2;
                    }
                    .item-card-grid > :nth-child(2) {
                        grid-column: span 2;
                    }
                    .item-card-grid > :nth-child(4) {
                        grid-column: span 2;
                        justify-self: stretch;
                        width: 100% !important;
                    }
                }
                
                .trash-btn {
                    width: 44px;
                    height: 44px;
                    border: 1px solid rgba(239, 68, 68, 0.1);
                    border-radius: var(--radius-control);
                    background-color: var(--color-danger-light);
                    color: var(--color-danger);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .trash-btn:hover {
                    background-color: var(--color-danger);
                    color: var(--color-white);
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
                }
                
                .trash-btn:active {
                    transform: scale(0.95);
                }
                
                .plus-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 1.1rem;
                    border: 2px dashed rgba(16, 185, 129, 0.25);
                    border-radius: var(--radius-control);
                    background-color: transparent;
                    color: var(--color-primary);
                    cursor: pointer;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .plus-btn:hover {
                    border-color: var(--color-primary);
                    background-color: var(--color-primary-light);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
                }
                
                .plus-btn:active {
                    transform: translateY(0);
                }
                
                .checkout-sidebar {
                    position: sticky;
                    top: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                
                .spin-loader {
                    animation: spin 1.2s linear infinite;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
            `}</style>
        </div>
    );
};

export default CreateOrder;
