import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvoiceByOrderId } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Printer, Download, ChevronLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Company Profile ───────────────────────────────────────────────────────────
const COMPANY = {
    name:    'HARI KRUPA ENGINEERING SYSTEM',
    tagline: 'IMPORTER & STOCKIST OF ALLOY STEEL, MS, SS & FABRICATION MATERIALS',
    gstin:   '24DREPA098.2D1ZA',
    pan:     'DREPA0982D',
    address: 'B-9, Shree Ram Industrial Estate, B/H. Bileshwar Estate,',
    address2:'Nr. Madhuram Estate, Nr. Girvar Globe, S.P. Ring Road, Odhav, Kathawada',
    city:    'Vadodara, Gujarat, India - 390020',
    phone:   '+91 9979771298, +91 9712170297',
    email:   'harikrupaengg@gmail.com',
    bank:    { name: 'ICICI BANK', branch: 'S.P. Ring Road, Odhav Branch', acc: '230905500894', ifsc: 'ICIC0002309' }
};

// HSN map for common engineering materials
const HSN_MAP = {
    default: '72044900',
    'steel': '72042100', 'rod': '72142000', 'bar': '72142000',
    'bearing': '84821010', 'bolt': '73181590', 'wire': '85444200',
    'gloves': '39262010', 'helmet': '65061010', 'compressor': '84143019',
    'drill': '84641000', 'pump': '84136019', 'plate': '72084000',
    'pipe': '73063019', 'sheet': '72091800',
};

const getHSN = (name = '') => {
    const lower = name.toLowerCase();
    for (const [key, code] of Object.entries(HSN_MAP)) {
        if (lower.includes(key)) return code;
    }
    return HSN_MAP.default;
};

// ── Amount in Words ──────────────────────────────────────────────────────────
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
               'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

const toWordsUnder1000 = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : '') + ' ';
    return ones[Math.floor(n/100)] + ' Hundred ' + toWordsUnder1000(n % 100);
};

const amountToWords = (amount) => {
    const n = Math.round(amount);
    if (n === 0) return 'Zero Rupees Only';
    let result = '';
    if (n >= 10000000) { result += toWordsUnder1000(Math.floor(n/10000000)) + 'Crore '; }
    if (n >= 100000)   { result += toWordsUnder1000(Math.floor((n%10000000)/100000)) + 'Lakh '; }
    if (n >= 1000)     { result += toWordsUnder1000(Math.floor((n%100000)/1000)) + 'Thousand '; }
    result += toWordsUnder1000(n % 1000);
    return result.trim() + ' Rupees Only';
};

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtINR  = (n) => Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});

// ── Styles & Classes (Pure Clean Layout) ───────────────────────────────────────
// Replaced legacy plain style object with high-fidelity, responsive CSS styles inside the component return.

// ── Invoice Component ─────────────────────────────────────────────────────────
const InvoiceView = () => {
    const { id: order_id } = useParams();
    const { role } = useAuth();
    const invoiceRef = useRef(null);
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await getInvoiceByOrderId(order_id);
                setInvoice(res.data);
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Invoice not found.');
            } finally { window.scrollTo(0, 0); setLoading(false); }
        })();
    }, [order_id]);

    const handlePrint = () => window.print();

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return;
        setDownloading(true);
        try {
            const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
                import('html2canvas'), import('jspdf')
            ]);
            const canvas  = await html2canvas(invoiceRef.current, { scale:2, useCORS:true, backgroundColor:'#fff' });
            const pdf     = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
            const pageW   = pdf.internal.pageSize.getWidth();
            const imgH    = (canvas.height * pageW) / canvas.width;
            let left = imgH, pos = 0;
            pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,pos,pageW,imgH);
            left -= pdf.internal.pageSize.getHeight();
            while (left > 0) { pos -= pdf.internal.pageSize.getHeight(); pdf.addPage(); pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,pos,pageW,imgH); left -= pdf.internal.pageSize.getHeight(); }
            pdf.save(`HKE-INV-${invoice?.id || order_id}.pdf`);
            toast.success('PDF downloaded!');
        } catch (e) { toast.error('PDF generation failed. Use Print instead.'); }
        finally { setDownloading(false); }
    };

    if (loading) return (
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'400px',flexDirection:'column',gap:'1.5rem'}}>
            <Loader2 size={44} color="var(--color-primary)" style={{animation:'spin 1.2s linear infinite'}} />
            <p style={{color:'var(--color-gray-dark)', fontWeight:'500', fontFamily:"'Outfit', sans-serif", fontSize:'1.1rem'}}>Loading invoice document…</p>
            <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (!invoice) return (
        <div style={{textAlign:'center',padding:'5rem 2rem',color:'var(--color-gray-dark)', animation:'fadeIn 0.5s ease'}}>
            <p style={{fontSize:'1.25rem', fontWeight:'600', marginBottom:'1rem'}}>No invoice found for this order.</p>
            <Link to="/orders" style={{color:'var(--color-primary)', fontWeight:'700', textDecoration:'none', transition:'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary-hover)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-primary)'}>← Back to Orders</Link>
        </div>
    );

    const items     = Array.isArray(invoice.items) ? invoice.items : [];
    const totalQty  = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
    const orderDate = invoice.order_created_at || invoice.created_at || new Date();
    const invoiceNo = String(invoice.id || order_id).padStart(4, '0');
    const custPhone = invoice.customer_phone || '—';

    // Per-item GST calc (CGST 9% + SGST 9%)
    const rows = items.map(item => {
        const qty  = Number(item.quantity)  || 0;
        const rate = Number(item.price)     || 0;
        const sub  = Number(item.subtotal)  || +(qty * rate).toFixed(2);
        const cAmt = +(sub * 0.09).toFixed(2);
        const sAmt = +(sub * 0.09).toFixed(2);
        const tot  = +(sub + cAmt + sAmt).toFixed(2);
        return {
            ...item,
            product_name: item.product_name || 'Product',
            size:         item.size         || '—',
            unit:         item.unit         || '',
            subtotal: sub, cAmt, sAmt, tot,
            hsn: getHSN(item.product_name)
        };
    });

    // Computed totals from line items (authoritative, never 0)
    const totalCGST = +rows.reduce((s, r) => s + r.cAmt, 0).toFixed(2);
    const totalSGST = +rows.reduce((s, r) => s + r.sAmt, 0).toFixed(2);
    const totalAmt  = +rows.reduce((s, r) => s + r.tot,  0).toFixed(2);
    const taxable   = +rows.reduce((s, r) => s + r.subtotal, 0).toFixed(2);

    // Use DB values if available, fall back to computed
    const dbTaxable     = Number(invoice.taxable_amount) || taxable;
    const dbCGST        = Number(invoice.cgst)           || totalCGST;
    const dbSGST        = Number(invoice.sgst)           || totalSGST;
    const dbTotalTax    = Number(invoice.total_tax)      || +(totalCGST + totalSGST).toFixed(2);
    const finalAmount   = Number(invoice.final_amount)   || totalAmt;

    return (
        <div className="invoice-container" style={{maxWidth:'230mm',margin:'0 auto',fontFamily:"'Inter',sans-serif"}}>

            {/* ── Toolbar ── */}
            <div className="no-print" style={{
                display:'flex',justifyContent:'space-between',alignItems:'center',
                marginBottom:'2rem',flexWrap:'wrap',gap:'1rem',
                animation:'fadeIn 0.5s ease'
            }}>
                <Link to={`/orders/${order_id}`} style={{
                    display:'inline-flex',alignItems:'center',gap:'6px',
                    textDecoration:'none',color:'var(--color-gray-dark)',
                    fontWeight:'600',fontSize:'0.95rem',transition:'color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--color-black)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--color-gray-dark)'}
                >
                    <ChevronLeft size={16} /> Back to Order details
                </Link>
                <div style={{display:'flex',gap:'0.75rem'}}>
                    <button onClick={handlePrint} style={{
                        display:'inline-flex',alignItems:'center',gap:'6px',
                        padding:'0.65rem 1.25rem',border:'1px solid rgba(15, 23, 42, 0.08)',
                        borderRadius:'var(--radius-control)',background:'var(--color-white)',
                        cursor:'pointer',fontWeight:'600',fontSize:'0.875rem',
                        transition:'all 0.2s ease',boxShadow:'var(--shadow-premium-sm)'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--color-gray-soft)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--color-white)'; e.currentTarget.style.transform = 'none'; }}
                    >
                        <Printer size={15}/> Print Invoice
                    </button>
                    <button onClick={handleDownloadPDF} disabled={downloading} style={{
                        display:'inline-flex',alignItems:'center',gap:'6px',
                        padding:'0.65rem 1.5rem',border:'none',
                        borderRadius:'var(--radius-control)',
                        background: downloading ? 'var(--color-primary-light)' : 'var(--color-primary)',
                        color: downloading ? 'var(--color-gray-dark)' : 'white',
                        cursor: downloading ? 'not-allowed' : 'pointer',
                        fontWeight: '700', fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        boxShadow: downloading ? 'none' : '0 8px 20px -4px rgba(16, 185, 129, 0.25)'
                    }}
                    onMouseOver={e => { if(!downloading) { e.currentTarget.style.background = 'var(--color-primary-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px -4px rgba(16, 185, 129, 0.35)'; } }}
                    onMouseOut={e => { if(!downloading) { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(16, 185, 129, 0.25)'; } }}
                    >
                        {downloading ? <><Loader2 size={15} style={{animation:'spin 1.2s linear infinite'}}/> Generating…</> : <><Download size={15}/> Export PDF</>}
                    </button>
                </div>
            </div>

            {/* ── Invoice Document Wrapper for Horizontal Scroll Safety on Mobile ── */}
            <div className="invoice-scroll-wrapper" style={{width:'100%',overflowX:'auto',borderRadius:'var(--radius-premium)',paddingBottom:'1.5rem'}}>
                
                {/* ── Invoice Document Card ── */}
                <div ref={invoiceRef} className="invoice-page">

                    {/* HEADER */}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'2px solid rgba(0, 0, 0, 0.15)',paddingBottom:'10px',marginBottom:'8px'}}>
                        <div style={{flex:1}}>
                            <div style={{fontSize:'22px',fontWeight:'900',letterSpacing:'-0.02em',color:'var(--color-black)',lineHeight:'1.1',fontFamily:"'Outfit',sans-serif"}}>{COMPANY.name}</div>
                            <div style={{fontSize:'9.5px',fontWeight:'700',color:'var(--color-primary-hover)',marginTop:'3px',fontFamily:"'Outfit',sans-serif",textTransform:'uppercase',letterSpacing:'0.03em'}}>{COMPANY.tagline}</div>
                            <div style={{fontSize:'9.5px',marginTop:'8px',lineHeight:'1.6',color:'#475569'}}>
                                <div style={{display:'flex',alignItems:'center',gap:'4px'}}>📍 {COMPANY.address}</div>
                                <div style={{paddingLeft:'14px'}}>{COMPANY.address2}, {COMPANY.city}</div>
                                <div style={{display:'flex',gap:'12px',marginTop:'2px'}}><span>📞 {COMPANY.phone}</span><span>✉ {COMPANY.email}</span></div>
                            </div>
                        </div>
                        <div style={{textAlign:'right'}}>
                            <div className="invoice-tax-badge">TAX INVOICE</div>
                            <div style={{fontSize:'9px',fontWeight:'bold',color:'#64748b',letterSpacing:'0.05em',textTransform:'uppercase'}}>Original For Recipient</div>
                            <div style={{marginTop:'8px',fontSize:'9.5px',color:'#334155'}}><strong>GSTIN:</strong> <code style={{fontWeight:'700',fontFamily:'monospace',fontSize:'10px'}}>{COMPANY.gstin}</code></div>
                            <div style={{fontSize:'9.5px',color:'#334155'}}><strong>PAN:</strong> <code style={{fontWeight:'700',fontFamily:'monospace',fontSize:'10px'}}>{COMPANY.pan}</code></div>
                        </div>
                    </div>

                    {/* CUSTOMER + INVOICE META */}
                    <div className="invoice-meta-grid" style={{marginBottom:'10px'}}>
                        <div className="invoice-meta-col-left">
                            <div style={{fontWeight:'bold',fontSize:'10.5px',color:'var(--color-primary-dark)',borderBottom:'1px solid rgba(0, 0, 0, 0.08)',paddingBottom:'3px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.04em',fontFamily:"'Outfit',sans-serif"}}>Customer Details</div>
                            <table style={{fontSize:'9.5px',width:'100%',border:'none',boxShadow:'none',borderRadius:'0'}}>
                                <tbody>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'bold',width:'55px',padding:'3px 0',color:'#64748b',border:'none'}}>M/S</td><td style={{fontWeight:'800',color:'var(--color-black)',padding:'3px 0',fontSize:'10.5px',border:'none'}}>{invoice.customer_name}</td></tr>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'bold',padding:'3px 0',color:'#64748b',border:'none'}}>Email</td><td style={{padding:'3px 0',border:'none'}}>{invoice.customer_email}</td></tr>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'bold',padding:'3px 0',color:'#64748b',border:'none'}}>Phone</td><td style={{padding:'3px 0',fontWeight:'600',border:'none'}}>{custPhone}</td></tr>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'bold',padding:'3px 0',color:'#64748b',border:'none'}}>GSTIN</td><td style={{padding:'3px 0',color:'#94a3b8',border:'none'}}>—</td></tr>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'bold',padding:'3px 0',color:'#64748b',border:'none'}}>PAN</td><td style={{padding:'3px 0',color:'#94a3b8',border:'none'}}>—</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{padding:'10px 12px'}}>
                            <table style={{fontSize:'9.5px',width:'100%',border:'none',boxShadow:'none',borderRadius:'0'}}>
                                <tbody>
                                    <tr style={{background:'none'}}>
                                        <td style={{fontWeight:'bold',padding:'3px 0',color:'#64748b',border:'none'}}>Invoice No.</td>
                                        <td style={{fontWeight:'900',fontSize:'15px',color:'var(--color-primary-hover)',padding:'3px 0',fontFamily:"'Outfit',sans-serif",border:'none'}}>{invoiceNo}</td>
                                        <td style={{fontWeight:'bold',padding:'3px 0',color:'#64748b',border:'none'}}>Invoice Date</td>
                                        <td style={{padding:'3px 0',fontWeight:'600',border:'none'}}>{fmtDate(orderDate)}</td>
                                    </tr>
                                    <tr style={{background:'none'}}>
                                        <td style={{fontWeight:'bold',padding:'4px 0',color:'#64748b',border:'none'}}>Order Ref.</td>
                                        <td style={{fontWeight:'700',color:'var(--color-black)',padding:'4px 0',border:'none'}}>ORD-{order_id}</td>
                                        <td style={{fontWeight:'bold',padding:'4px 0',color:'#64748b',border:'none'}}>Due Date</td>
                                        <td style={{padding:'4px 0',fontWeight:'600',border:'none'}}>{fmtDate(new Date(new Date(orderDate).getTime() + 15*86400000))}</td>
                                    </tr>
                                    <tr style={{background:'none'}}>
                                        <td style={{fontWeight:'bold',padding:'8px 0 4px 0',color:'#64748b',border:'none'}}>Status</td>
                                        <td colSpan="3" style={{padding:'8px 0 4px 0',border:'none'}}>
                                            <span style={{
                                                padding:'3px 10px',fontWeight:'800',fontSize:'9px',borderRadius:'4px',
                                                background: invoice.order_status==='completed'?'var(--color-success-light)': invoice.order_status==='cancelled'?'var(--color-danger-light)':'var(--color-warning-light)',
                                                border:'1px solid',
                                                borderColor: invoice.order_status==='completed'?'var(--color-success)': invoice.order_status==='cancelled'?'var(--color-danger)':'var(--color-warning)',
                                                color: invoice.order_status==='completed'?'var(--color-primary-hover)': invoice.order_status==='cancelled'?'var(--color-danger)':'var(--color-warning)',
                                                letterSpacing:'0.04em'
                                            }}>
                                                {(invoice.order_status||'pending').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th style={{width:'28px',textAlign:'center'}}>Sr. No.</th>
                                <th style={{textAlign:'left'}}>Name of Product / Service</th>
                                <th style={{width:'70px',textAlign:'center'}}>HSN / SAC</th>
                                <th style={{width:'50px',textAlign:'center'}}>Qty</th>
                                <th style={{width:'65px',textAlign:'right'}}>Rate</th>
                                <th style={{width:'75px',textAlign:'right'}}>Taxable Value</th>
                                <th style={{width:'32px',textAlign:'center'}}>CGST %</th>
                                <th style={{width:'60px',textAlign:'right'}}>CGST Amt</th>
                                <th style={{width:'32px',textAlign:'center'}}>SGST %</th>
                                <th style={{width:'60px',textAlign:'right'}}>SGST Amt</th>
                                <th style={{width:'80px',textAlign:'right'}}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((item, idx) => (
                                <tr key={idx} style={{background:'none'}}>
                                    <td className="td-center">{idx+1}</td>
                                    <td className="td-left">
                                        <div style={{fontWeight:'700',color:'var(--color-black)'}}>{item.product_name}</div>
                                        <div style={{fontSize:'8.5px',color:'#64748b',marginTop:'1px'}}>{item.size} {item.unit ? `(${item.unit})` : ''}</div>
                                    </td>
                                    <td className="td-center" style={{fontFamily:'monospace',fontSize:'9px'}}>{item.hsn}</td>
                                    <td className="td-center" style={{fontWeight:'600'}}>{item.quantity}</td>
                                    <td className="td-right">{fmtINR(item.price)}</td>
                                    <td className="td-right" style={{fontWeight:'600'}}>{fmtINR(item.subtotal)}</td>
                                    <td className="td-center">9.00</td>
                                    <td className="td-right">{fmtINR(item.cAmt)}</td>
                                    <td className="td-center">9.00</td>
                                    <td className="td-right">{fmtINR(item.sAmt)}</td>
                                    <td className="td-bold td-right" style={{color:'var(--color-primary-hover)'}}>{fmtINR(item.tot)}</td>
                                </tr>
                            ))}
                            {/* Empty filler rows */}
                            {rows.length < 6 && Array.from({length: 6 - rows.length}).map((_, i) => (
                                <tr key={`empty-${i}`} style={{height:'22px', background:'none'}}>
                                    <td className="td-center">&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td className="td-center">&nbsp;</td>
                                    <td className="td-center">&nbsp;</td>
                                    <td className="td-right">&nbsp;</td>
                                    <td className="td-right">&nbsp;</td>
                                    <td className="td-center">&nbsp;</td>
                                    <td className="td-right">&nbsp;</td>
                                    <td className="td-center">&nbsp;</td>
                                    <td className="td-right">&nbsp;</td>
                                    <td className="td-right">&nbsp;</td>
                                </tr>
                            ))}
                            {/* Totals row */}
                            <tr style={{backgroundColor:'rgba(15, 23, 42, 0.03)', fontWeight:'bold'}}>
                                <td colSpan="3" style={{textAlign:'center',fontFamily:"'Outfit',sans-serif",fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.04em'}}>Total Summary</td>
                                <td className="td-center td-bold" style={{fontSize:'10.5px'}}>{totalQty}</td>
                                <td style={{border:'1px solid rgba(0, 0, 0, 0.12)'}}></td>
                                <td className="td-right td-bold" style={{fontSize:'10.5px'}}>{fmtINR(taxable)}</td>
                                <td style={{border:'1px solid rgba(0, 0, 0, 0.12)'}}></td>
                                <td className="td-right td-bold" style={{fontSize:'10.5px'}}>{fmtINR(totalCGST)}</td>
                                <td style={{border:'1px solid rgba(0, 0, 0, 0.12)'}}></td>
                                <td className="td-right td-bold" style={{fontSize:'10.5px'}}>{fmtINR(totalSGST)}</td>
                                <td className="td-right td-bold" style={{color:'var(--color-primary-hover)',fontSize:'11px'}}>{fmtINR(totalAmt)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* AMOUNT IN WORDS + TOTALS */}
                    <div className="invoice-totals-grid" style={{marginBottom:'10px'}}>
                        <div className="invoice-meta-col-left" style={{display:'flex',flexDirection:'column',justifyContent:'center'}}>
                            <div style={{fontSize:'8.5px',fontWeight:'bold',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'4px'}}>Amount in words</div>
                            <div style={{fontSize:'10px',fontWeight:'800',textTransform:'uppercase',color:'var(--color-primary-dark)',fontFamily:"'Outfit',sans-serif",lineHeight:'1.4'}}>{amountToWords(finalAmount || totalAmt)}</div>
                        </div>
                        <div style={{padding:'10px 12px'}}>
                            <table style={{width:'100%',fontSize:'9.5px',border:'none',boxShadow:'none',borderRadius:'0',background:'none'}}>
                                <tbody>
                                    <tr style={{background:'none'}}><td style={{color:'#64748b',padding:'3px 0',border:'none'}}>Taxable Amount</td><td style={{textAlign:'right',fontWeight:'700',color:'var(--color-black)',padding:'3px 0',border:'none'}}>{fmtINR(taxable)}</td></tr>
                                    <tr style={{background:'none'}}><td style={{color:'#64748b',padding:'3px 0',border:'none'}}>Add: CGST @ 9%</td><td style={{textAlign:'right',padding:'3px 0',border:'none'}}>{fmtINR(dbCGST)}</td></tr>
                                    <tr style={{background:'none'}}><td style={{color:'#64748b',padding:'3px 0',border:'none'}}>Add: SGST @ 9%</td><td style={{textAlign:'right',padding:'3px 0',border:'none'}}>{fmtINR(dbSGST)}</td></tr>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'700',color:'var(--color-black)',padding:'4px 0',border:'none'}}>Total GST (18%)</td><td style={{textAlign:'right',fontWeight:'700',color:'var(--color-black)',padding:'4px 0',border:'none'}}>{fmtINR(dbTotalTax)}</td></tr>
                                    <tr style={{borderTop:'1.5px solid rgba(0, 0, 0, 0.15)',background:'none'}}>
                                        <td style={{fontWeight:'800',fontSize:'11.5px',paddingTop:'6px',color:'var(--color-black)',fontFamily:"'Outfit',sans-serif",border:'none'}}>Amount After Tax</td>
                                        <td style={{textAlign:'right',fontWeight:'900',fontSize:'14.5px',paddingTop:'6px',color:'var(--color-primary)',fontFamily:"'Outfit',sans-serif",border:'none'}}>₹{fmtINR(finalAmount)}</td>
                                    </tr>
                                    <tr style={{background:'none'}}><td colSpan="2" style={{fontSize:'8px',color:'#94a3b8',paddingTop:'2px',border:'none'}}>(E. &amp; O.E)</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* BANK DETAILS + TERMS + SIGNATURE */}
                    <div className="invoice-footer-grid" style={{minHeight:'100px'}}>
                        <div className="invoice-footer-left">
                            <div style={{fontWeight:'bold',fontSize:'10px',color:'var(--color-primary-dark)',borderBottom:'1px solid rgba(0, 0, 0, 0.08)',paddingBottom:'3px',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.04em',fontFamily:"'Outfit',sans-serif"}}>Bank Details for RTGS/NEFT</div>
                            <table style={{fontSize:'9.5px',width:'100%',border:'none',boxShadow:'none',borderRadius:'0',background:'none'}}>
                                <tbody>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'700',width:'75px',color:'#64748b',padding:'2px 0',border:'none'}}>Bank Name</td><td style={{fontWeight:'700',color:'var(--color-black)',padding:'2px 0',border:'none'}}>{COMPANY.bank.name}</td></tr>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'700',color:'#64748b',padding:'2px 0',border:'none'}}>Branch</td><td style={{padding:'2px 0',border:'none'}}>{COMPANY.bank.branch}</td></tr>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'700',color:'#64748b',padding:'2px 0',border:'none'}}>Account No.</td><td style={{fontWeight:'800',fontFamily:'monospace',fontSize:'10.5px',color:'var(--color-black)',padding:'2px 0',border:'none'}}>{COMPANY.bank.acc}</td></tr>
                                    <tr style={{background:'none'}}><td style={{fontWeight:'700',color:'#64748b',padding:'2px 0',border:'none'}}>IFSC Code</td><td style={{fontWeight:'800',fontFamily:'monospace',fontSize:'10.5px',color:'var(--color-primary-hover)',padding:'2px 0',border:'none'}}>{COMPANY.bank.ifsc}</td></tr>
                                </tbody>
                            </table>
                            <div style={{marginTop:'8px',borderTop:'1px dashed rgba(0, 0, 0, 0.08)',paddingTop:'6px'}}>
                                <div style={{fontWeight:'bold',fontSize:'9.5px',color:'#475569',marginBottom:'3px',textTransform:'uppercase',letterSpacing:'0.03em'}}>Terms and Conditions</div>
                                <div style={{fontSize:'8.5px',lineHeight:'1.4',color:'#64748b'}}>
                                    1. Subject to Vadodara Jurisdiction.<br/>
                                    2. Our responsibility ceases as soon as goods leave our premises.<br/>
                                    3. Goods once sold will not be taken back.<br/>
                                    4. The processed material would not be taken back by us.<br/>
                                    5. This is a computer generated invoice requiring no physical signature.
                                </div>
                            </div>
                        </div>
                        <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                            <div>
                                <div style={{fontSize:'9px',fontWeight:'bold',color:'#475569',textAlign:'center',marginBottom:'6px',lineHeight:'1.3'}}>Certified that the particulars given above are true and correct.</div>
                                <div style={{fontSize:'10.5px',fontWeight:'800',color:'var(--color-black)',textAlign:'center',marginTop:'6px',fontFamily:"'Outfit',sans-serif"}}>For {COMPANY.name}</div>
                            </div>
                            <div style={{textAlign:'center',paddingBottom:'4px'}}>
                                <div style={{height:'50px',display:'flex',alignItems:'center',justifyContent:'center',color:'#cbd5e1',fontSize:'9px',fontStyle:'italic',letterSpacing:'0.05em',fontFamily:"'Outfit',sans-serif"}}>[ AUTHORIZED SIGNATURE ]</div>
                                <div style={{borderTop:'1.5px solid rgba(0, 0, 0, 0.15)',paddingTop:'4px',fontSize:'9px',fontWeight:'800',color:'var(--color-black)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Authorised Signatory</div>
                            </div>
                        </div>
                    </div>

                    {/* PAGE NUMBER */}
                    <div style={{textAlign:'center',marginTop:'8px',fontSize:'8.5px',color:'#94a3b8',letterSpacing:'0.05em'}}>Page 1 of 1</div>
                </div>
            </div>

            {/* PDF hint */}
            <div className="no-print" style={{
                marginTop:'1.5rem',padding:'1rem 1.25rem',
                background:'var(--color-primary-light)',
                border:'1px solid rgba(16, 185, 129, 0.15)',
                borderRadius:'var(--radius-control)',
                display:'flex',gap:'0.75rem',alignItems:'flex-start',
                animation:'fadeIn 0.5s ease'
            }}>
                <AlertTriangle size={16} color="var(--color-primary)" style={{flexShrink:0,marginTop:'2px'}}/>
                <p style={{margin:0,fontSize:'0.85rem',color:'var(--color-primary-dark)',lineHeight:'1.5',fontWeight:'500'}}>
                    PDF download is optimized to compile using <code>html2canvas</code> and <code>jspdf</code>. If needed, please ensure dependencies are installed by running: <code style={{background:'rgba(16, 185, 129, 0.1)',padding:'2px 6px',borderRadius:'4px',fontFamily:'monospace',fontWeight:'700'}}>npm install html2canvas jspdf</code>.
                </p>
            </div>

            <style>{`
                .invoice-page {
                    font-family: 'Inter', sans-serif;
                    color: var(--color-black);
                    background-color: var(--color-white);
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 12mm 10mm;
                    box-sizing: border-box;
                    border: 1px solid rgba(15, 23, 42, 0.08);
                    border-radius: var(--radius-premium);
                    box-shadow: var(--shadow-premium-lg);
                    position: relative;
                    overflow: hidden;
                    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .invoice-tax-badge {
                    font-family: 'Outfit', sans-serif;
                    font-size: 18px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    border: 2px solid var(--color-primary);
                    color: var(--color-primary-hover);
                    padding: 6px 16px;
                    display: inline-block;
                    margin-bottom: 6px;
                    border-radius: 4px;
                    text-transform: uppercase;
                }
                
                .invoice-meta-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    background-color: var(--color-white);
                }
                
                .invoice-meta-col-left {
                    border-right: 1px solid rgba(0, 0, 0, 0.12);
                    padding: 10px 12px;
                }
                
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse !important;
                    margin-top: 10px;
                    margin-bottom: 0;
                    border: 1px solid rgba(0, 0, 0, 0.12) !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    background-color: transparent !important;
                }
                
                .invoice-table th, .invoice-table td {
                    border: 1px solid rgba(0, 0, 0, 0.12) !important;
                    padding: 6px 8px !important;
                    font-size: 9.5px !important;
                    line-height: 1.4 !important;
                    color: var(--color-black) !important;
                    vertical-align: middle !important;
                }
                
                .invoice-table th {
                    background-color: var(--color-primary-light) !important;
                    color: var(--color-primary-dark) !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    font-family: 'Outfit', sans-serif !important;
                    letter-spacing: 0.04em !important;
                    font-size: 9px !important;
                    border-bottom: 1.5px solid rgba(0, 0, 0, 0.15) !important;
                }
                
                .td-center {
                    text-align: center !important;
                }
                
                .td-right {
                    text-align: right !important;
                }
                
                .td-left {
                    text-align: left !important;
                }
                
                .td-bold {
                    font-weight: 800 !important;
                }
                
                .invoice-table tr:hover td {
                    background-color: transparent !important;
                }
                
                .invoice-totals-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    border-top: none;
                }
                
                .invoice-footer-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    border-top: none;
                }
                
                .invoice-footer-left {
                    border-right: 1px solid rgba(0, 0, 0, 0.12);
                    padding: 10px 12px;
                }
                
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; }
                    .invoice-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .invoice-scroll-wrapper { overflow: visible !important; padding-bottom: 0 !important; border-radius: 0 !important; }
                    .invoice-page {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 8mm !important;
                        border: none !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    .invoice-tax-badge {
                        border: 2px solid #000 !important;
                        color: #000 !important;
                        border-radius: 0 !important;
                    }
                    .invoice-meta-grid {
                        border: 1px solid #000 !important;
                    }
                    .invoice-meta-col-left {
                        border-right: 1px solid #000 !important;
                    }
                    .invoice-table {
                        border: 1px solid #000 !important;
                    }
                    .invoice-table th, .invoice-table td {
                        border: 1px solid #000 !important;
                        color: #000 !important;
                    }
                    .invoice-table th {
                        background-color: #d9d9d9 !important;
                        color: #000 !important;
                        border-bottom: 1.5px solid #000 !important;
                    }
                    .invoice-totals-grid {
                        border: 1px solid #000 !important;
                        border-top: none !important;
                    }
                    .invoice-footer-grid {
                        border: 1px solid #000 !important;
                        border-top: none !important;
                    }
                    .invoice-footer-left {
                        border-right: 1px solid #000 !important;
                    }
                }
                
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default InvoiceView;



