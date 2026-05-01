import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrderById, updateOrderStatus } from '../../services/orderService';
import { getInvoiceByOrderId } from '../../services/invoiceService';
import { addPayment, getPaymentsByOrder } from '../../services/paymentService';
import {
    Loader2, ChevronLeft, CalendarClock, ShoppingCart,
    CheckCircle, Clock, XCircle, Package, FileText,
    IndianRupee, Receipt, CreditCard, PlusCircle, History
} from 'lucide-react';
import toast from 'react-hot-toast';

const s = {
    card: { backgroundColor:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden' },
    cardHeader: { padding:'1rem 1.5rem', backgroundColor:'#f9fafb', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', gap:'0.5rem' },
    cardBody: { padding:'1.5rem' },
    label: { margin:'0 0 0.25rem 0', fontSize:'0.68rem', fontWeight:'700', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em' },
    input: { width:'100%', padding:'0.65rem 0.875rem', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'0.875rem', color:'#111827', boxSizing:'border-box', backgroundColor:'#f9fafb' },
    btnGreen: { width:'100%', padding:'0.8rem', backgroundColor:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', fontSize:'0.875rem' },
    btnRed: { width:'100%', padding:'0.75rem', backgroundColor:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'8px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', fontSize:'0.875rem' },
    btnGhost: { width:'100%', padding:'0.75rem', backgroundColor:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'8px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', fontSize:'0.875rem' },
};

const STATUS_CONFIG = {
    pending:         { bg:'#fef3c7', color:'#b45309', border:'#fde68a', icon:<Clock size={14}/> },
    partially_paid:  { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', icon:<CreditCard size={14}/> },
    completed:       { bg:'#dcfce7', color:'#166534', border:'#bbf7d0', icon:<CheckCircle size={14}/> },
    cancelled:       { bg:'#fee2e2', color:'#991b1b', border:'#fecaca', icon:<XCircle size={14}/> },
};

const fmt     = (n) => Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2});
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});

const Row = ({ label, value, bold }) => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'0.9rem'}}>
        <span style={{color:'#4b5563',fontWeight:bold?'700':'500'}}>{label}</span>
        <span style={{color:'#111827',fontWeight:bold?'800':'600'}}>{value}</span>
    </div>
);

// ── Payment Panel ─────────────────────────────────────────────────────────────
const PaymentPanel = ({ orderId, isSupervisor, orderStatus, onPaymentSuccess }) => {
    const [data, setData]           = useState(null);
    const [loading, setLoading]     = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm]   = useState(false);
    const [amount, setAmount]       = useState('');
    const [method, setMethod]       = useState('cash');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getPaymentsByOrder(orderId);
            setData(res.data.data);
        } catch { /* invoice may not exist yet */ }
        finally { setLoading(false); }
    }, [orderId]);

    useEffect(() => { load(); }, [load]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) { toast.error('Enter a valid amount.'); return; }
        setSubmitting(true);
        try {
            await addPayment({ order_id: Number(orderId), amount_paid: amt, payment_method: method });
            toast.success('Payment recorded!');
            setAmount(''); setShowForm(false);
            await load();
            onPaymentSuccess();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to record payment.');
        } finally { setSubmitting(false); }
    };

    if (loading) return <div style={{padding:'1rem',textAlign:'center',color:'#9ca3af',fontSize:'0.85rem'}}>Loading payment info…</div>;
    if (!data)   return null;

    const { summary, payments } = data;
    const isFullyPaid = orderStatus === 'completed';
    const canPay      = isSupervisor && !isFullyPaid && orderStatus !== 'cancelled';

    const barWidth = `${summary.percentage_paid}%`;
    const barColor = summary.percentage_paid >= 100 ? '#16a34a' : summary.percentage_paid > 0 ? '#3b82f6' : '#e5e7eb';

    return (
        <div style={s.card}>
            <div style={s.cardHeader}>
                <CreditCard size={16} color="#16a34a"/>
                <h3 style={{margin:0,fontSize:'0.875rem',fontWeight:'700',color:'#1f2937'}}>Payment Status</h3>
            </div>
            <div style={{...s.cardBody, display:'flex',flexDirection:'column',gap:'0.875rem'}}>
                {/* Progress bar */}
                <div>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem',fontSize:'0.75rem',fontWeight:'600',color:'#6b7280'}}>
                        <span>{summary.percentage_paid}% Paid</span>
                        <span>₹{fmt(summary.total_amount)}</span>
                    </div>
                    <div style={{height:'8px',backgroundColor:'#f3f4f6',borderRadius:'9999px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:barWidth,backgroundColor:barColor,borderRadius:'9999px',transition:'width 0.5s ease'}}/>
                    </div>
                </div>

                <Row label="Total Amount"  value={`₹${fmt(summary.total_amount)}`}/>
                <Row label="Total Paid"    value={`₹${fmt(summary.total_paid)}`} bold/>
                <div style={{height:'1px',backgroundColor:'#f3f4f6'}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:'700',color:'#111827',fontSize:'0.9rem'}}>Remaining</span>
                    <span style={{fontWeight:'900',fontSize:'1.2rem',color:summary.remaining_amount>0?'#dc2626':'#16a34a'}}>
                        ₹{fmt(summary.remaining_amount)}
                    </span>
                </div>

                {/* Record payment form */}
                {canPay && !showForm && (
                    <button onClick={()=>setShowForm(true)} style={s.btnGreen}>
                        <PlusCircle size={15}/> Record Payment
                    </button>
                )}
                {canPay && showForm && (
                    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'0.75rem',borderTop:'1px solid #e5e7eb',paddingTop:'0.875rem'}}>
                        <p style={{...s.label,margin:0}}>New Payment</p>
                        <div>
                            <label style={{...s.label,display:'block',marginBottom:'0.3rem'}}>Amount (₹)</label>
                            <input type="number" min="1" step="0.01"
                                placeholder={`Max ₹${fmt(summary.remaining_amount)}`}
                                value={amount} onChange={e=>setAmount(e.target.value)}
                                style={s.input} required/>
                        </div>
                        <div>
                            <label style={{...s.label,display:'block',marginBottom:'0.3rem'}}>Method</label>
                            <select value={method} onChange={e=>setMethod(e.target.value)} style={s.input}>
                                {['cash','upi','bank_transfer','cheque','card'].map(m=>(
                                    <option key={m} value={m}>{m.replace('_',' ').toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                            <button type="button" onClick={()=>setShowForm(false)}
                                style={{...s.btnRed,padding:'0.65rem'}}>Cancel</button>
                            <button type="submit" disabled={submitting}
                                style={{...s.btnGreen,padding:'0.65rem',opacity:submitting?0.6:1}}>
                                {submitting?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<CheckCircle size={14}/>}
                                {submitting?'Saving…':'Save'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Payment history */}
                {payments && payments.length > 0 && (
                    <div style={{borderTop:'1px solid #f3f4f6',paddingTop:'0.875rem'}}>
                        <p style={{...s.label,marginBottom:'0.6rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                            <History size={11}/> Payment History
                        </p>
                        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',maxHeight:'200px',overflowY:'auto'}}>
                            {payments.map(p=>(
                                <div key={p.payment_id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'0.8rem',padding:'0.5rem 0.75rem',backgroundColor:'#f9fafb',borderRadius:'6px',border:'1px solid #f3f4f6'}}>
                                    <div>
                                        <div style={{fontWeight:'700',color:'#1f2937'}}>₹{fmt(p.amount_paid)}</div>
                                        <div style={{color:'#9ca3af',fontSize:'0.7rem'}}>{p.payment_method.toUpperCase()} · {fmtDate(p.payment_date)}</div>
                                    </div>
                                    <div style={{padding:'2px 8px',backgroundColor:'#dcfce7',color:'#166534',borderRadius:'9999px',fontSize:'0.7rem',fontWeight:'700'}}>PAID</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const OrderDetails = () => {
    const { id } = useParams();
    const { role } = useAuth();
    const [order, setOrder]     = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [oRes, iRes] = await Promise.allSettled([getOrderById(id), getInvoiceByOrderId(id)]);
            if (oRes.status==='fulfilled') setOrder(oRes.value.data);
            if (iRes.status==='fulfilled') setInvoice(iRes.value.data);
        } catch { toast.error('Failed to load order details.'); }
        finally  { setLoading(false); }
    }, [id]);

    useEffect(()=>{ loadData(); },[loadData]);

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Mark this order as "${newStatus}"?`)) return;
        try {
            setUpdating(true);
            await updateOrderStatus(id, newStatus);
            toast.success(`Order marked as ${newStatus}.`);
            loadData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update status.');
        } finally { setUpdating(false); }
    };

    if (loading) return (
        <div style={{display:'flex',flexDirection:'column',height:'420px',alignItems:'center',justifyContent:'center',color:'#16a34a'}}>
            <Loader2 size={44} style={{animation:'spin 1.2s linear infinite',marginBottom:'1rem'}}/>
            <p style={{fontWeight:'500',color:'#4b5563'}}>Loading order…</p>
            <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (!order) return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem',color:'#9ca3af'}}>
            <ShoppingCart size={64} style={{marginBottom:'1rem'}}/>
            <h2 style={{color:'#374151',margin:'0 0 0.5rem 0'}}>Order Not Found</h2>
        </div>
    );

    const isSupervisor = role==='owner'||role==='employee';
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

    return (
        <div style={{maxWidth:'1060px',margin:'0 auto',animation:'fadeIn 0.3s ease-in-out'}}>

            {/* Header */}
            <div style={{marginBottom:'2rem'}}>
                <Link to={role==='customer'?'/my-orders':'/orders'}
                    style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',textDecoration:'none',color:'#6b7280',fontSize:'0.875rem',fontWeight:'500',marginBottom:'1rem'}}>
                    <ChevronLeft size={16}/> Back to Orders
                </Link>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',borderBottom:'1px solid #e5e7eb',paddingBottom:'1.25rem'}}>
                    <div>
                        <h1 style={{color:'#111827',margin:'0 0 0.5rem 0',fontSize:'2rem',fontWeight:'900',fontFamily:'monospace'}}>
                            #ORD-{order.id}
                        </h1>
                        <span style={{display:'inline-flex',alignItems:'center',gap:'0.35rem',padding:'0.3rem 0.85rem',borderRadius:'9999px',fontSize:'0.8rem',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.04em',backgroundColor:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>
                            {cfg.icon} {order.status.replace('_',' ')}
                        </span>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <p style={{margin:'0 0 0.2rem 0',fontSize:'0.72rem',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:'700'}}>Placed On</p>
                        <span style={{display:'flex',alignItems:'center',gap:'0.35rem',fontSize:'0.9rem',color:'#374151',fontWeight:'600',justifyContent:'flex-end'}}>
                            <CalendarClock size={14} color="#9ca3af"/>
                            {new Date(order.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'minmax(0,2fr) 320px',gap:'2rem',alignItems:'start'}}>

                {/* Left: Items + GST */}
                <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                    <div style={s.card}>
                        <div style={s.cardHeader}>
                            <Package size={17} color="#16a34a"/>
                            <h3 style={{margin:0,fontSize:'0.95rem',fontWeight:'700',color:'#1f2937'}}>Order Items</h3>
                            <span style={{marginLeft:'auto',fontSize:'0.75rem',color:'#6b7280',fontWeight:'600',backgroundColor:'#e5e7eb',padding:'0.2rem 0.6rem',borderRadius:'4px'}}>
                                {order.items?.length||0} item{order.items?.length!==1?'s':''}
                            </span>
                        </div>
                        <div style={{overflowX:'auto'}}>
                            <table style={{width:'100%',borderCollapse:'collapse',textAlign:'left'}}>
                                <thead>
                                    <tr>
                                        {['Product / Variant','Qty','Unit Price','Subtotal'].map((h,i)=>(
                                            <th key={h} style={{padding:'0.85rem 1.25rem',borderBottom:'1px solid #e5e7eb',color:'#6b7280',fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:'700',textAlign:i>1?'right':i===1?'center':'left'}}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(order.items)&&order.items.length>0?(
                                        order.items.map((item,index)=>{
                                            const subtotal=Number(item.subtotal)||(item.quantity*item.price);
                                            return(
                                                <tr key={item.item_id||index} style={{borderBottom:index<order.items.length-1?'1px solid #f3f4f6':'none'}}
                                                    onMouseOver={e=>e.currentTarget.style.backgroundColor='#f9fafb'}
                                                    onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                                                    <td style={{padding:'1.1rem 1.25rem'}}>
                                                        <div style={{fontWeight:'700',color:'#1f2937',fontSize:'0.9rem'}}>{item.product_name}</div>
                                                        <div style={{fontSize:'0.78rem',color:'#6b7280',marginTop:'0.15rem'}}>Size: {item.size} | {item.category}</div>
                                                    </td>
                                                    <td style={{padding:'1.1rem 1.25rem',textAlign:'center',fontWeight:'700',color:'#374151'}}>
                                                        {item.quantity} <span style={{fontSize:'0.7rem',color:'#9ca3af',fontWeight:'500'}}>{item.unit}</span>
                                                    </td>
                                                    <td style={{padding:'1.1rem 1.25rem',textAlign:'right',color:'#4b5563',fontSize:'0.875rem'}}>₹{fmt(item.price)}</td>
                                                    <td style={{padding:'1.1rem 1.25rem',textAlign:'right',fontWeight:'800',color:'#111827'}}>₹{fmt(subtotal)}</td>
                                                </tr>
                                            );
                                        })
                                    ):(
                                        <tr><td colSpan="4" style={{padding:'2rem',textAlign:'center',color:'#9ca3af'}}>No items.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {invoice&&(
                        <div style={s.card}>
                            <div style={s.cardHeader}>
                                <Receipt size={17} color="#16a34a"/>
                                <h3 style={{margin:0,fontSize:'0.95rem',fontWeight:'700',color:'#1f2937'}}>GST Breakdown</h3>
                            </div>
                            <div style={{...s.cardBody,display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                                <Row label="Taxable Amount" value={`₹${fmt(invoice.taxable_amount)}`}/>
                                <Row label="CGST (9%)" value={`₹${fmt(invoice.cgst)}`}/>
                                <Row label="SGST (9%)" value={`₹${fmt(invoice.sgst)}`}/>
                                <div style={{height:'1px',backgroundColor:'#e5e7eb'}}/>
                                <Row label="Total GST (18%)" value={`₹${fmt(invoice.total_tax)}`} bold/>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'0.75rem',borderTop:'2px solid #16a34a'}}>
                                    <span style={{fontWeight:'900',fontSize:'1.05rem',color:'#111827'}}>Grand Total</span>
                                    <span style={{fontWeight:'900',fontSize:'1.5rem',color:'#166534',display:'flex',alignItems:'center'}}>
                                        <IndianRupee size={20}/>₹{fmt(invoice.final_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>

                    {/* Customer */}
                    <div style={{...s.card,overflow:'visible'}}>
                        <div style={s.cardBody}>
                            <p style={s.label}>Customer</p>
                            <p style={{margin:'0 0 0.2rem 0',fontSize:'1.05rem',color:'#1f2937',fontWeight:'700'}}>{order.customer_name}</p>
                            <p style={{margin:0,fontSize:'0.875rem',color:'#6b7280'}}>{order.customer_email}</p>
                        </div>
                    </div>

                    {/* Invoice link */}
                    <div style={{...s.card,border:'2px solid #16a34a',boxShadow:'0 4px 12px rgba(22,163,74,0.1)'}}>
                        <div style={{padding:'1.5rem',backgroundColor:'#f0fdf4',display:'flex',flexDirection:'column',alignItems:'center',borderBottom:'1px solid #bbf7d0',gap:'0.4rem'}}>
                            <span style={{fontSize:'0.75rem',color:'#15803d',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.06em'}}>Order Total (incl. GST)</span>
                            <span style={{fontSize:'2.25rem',fontWeight:'900',color:'#166534',display:'flex',alignItems:'center'}}>
                                <IndianRupee size={26}/>{fmt(order.total_amount)}
                            </span>
                        </div>
                        <div style={{padding:'1.25rem'}}>
                            <Link to={`/invoice/${order.id}`} style={{textDecoration:'none'}}>
                                <button style={s.btnGreen}
                                    onMouseOver={e=>e.currentTarget.style.backgroundColor='#15803d'}
                                    onMouseOut={e=>e.currentTarget.style.backgroundColor='#16a34a'}>
                                    <FileText size={16}/> View Full Invoice
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Payment Panel */}
                    <PaymentPanel
                        orderId={id}
                        isSupervisor={isSupervisor}
                        orderStatus={order.status}
                        onPaymentSuccess={loadData}
                    />

                    {/* Manual status controls (only if payment module hasn't taken over) */}
                    {isSupervisor && order.status === 'pending' && (
                        <div style={{...s.card,overflow:'visible'}}>
                            <div style={s.cardBody}>
                                <p style={s.label}>Manual Status</p>
                                <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginTop:'0.5rem'}}>
                                    <button onClick={()=>handleStatusUpdate('completed')} disabled={updating} style={{...s.btnGhost,opacity:updating?0.6:1}}>
                                        {updating?<Loader2 size={15} style={{animation:'spin 1.2s linear infinite'}}/>:<CheckCircle size={15}/>}
                                        Mark as Completed
                                    </button>
                                    <button onClick={()=>handleStatusUpdate('cancelled')} disabled={updating} style={{...s.btnRed,opacity:updating?0.6:1}}>
                                        {updating?<Loader2 size={15} style={{animation:'spin 1.2s linear infinite'}}/>:<XCircle size={15}/>}
                                        Cancel Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
                @keyframes spin{100%{transform:rotate(360deg)}}
            `}</style>
        </div>
    );
};

export default OrderDetails;
