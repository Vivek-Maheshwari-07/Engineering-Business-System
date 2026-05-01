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

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
    page: { fontFamily:"'Arial',sans-serif", fontSize:'11px', color:'#000', backgroundColor:'#fff', width:'210mm', minHeight:'297mm', margin:'0 auto', padding:'8mm', boxSizing:'border-box', border:'1px solid #999' },
    th:   { border:'1px solid #000', padding:'4px 6px', backgroundColor:'#d9d9d9', fontWeight:'bold', textAlign:'center', fontSize:'10px', lineHeight:'1.3' },
    td:   { border:'1px solid #000', padding:'4px 6px', fontSize:'10px', verticalAlign:'middle' },
    tdR:  { border:'1px solid #000', padding:'4px 6px', fontSize:'10px', textAlign:'right', verticalAlign:'middle' },
    tdC:  { border:'1px solid #000', padding:'4px 6px', fontSize:'10px', textAlign:'center', verticalAlign:'middle' },
};

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
            } finally { setLoading(false); }
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
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'400px',flexDirection:'column',gap:'1rem'}}>
            <Loader2 size={40} color="#16a34a" style={{animation:'spin 1s linear infinite'}} />
            <p style={{color:'#666'}}>Loading invoice…</p>
            <style>{`@keyframes spin{100%{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (!invoice) return (
        <div style={{textAlign:'center',padding:'4rem',color:'#888'}}>
            <p style={{fontSize:'1.2rem'}}>No invoice found for this order.</p>
            <Link to="/orders" style={{color:'#16a34a'}}>← Back to Orders</Link>
        </div>
    );

    const items          = Array.isArray(invoice.items) ? invoice.items : [];
    const taxable        = Number(invoice.taxable_amount) || 0;
    const cgst           = Number(invoice.cgst)           || 0;
    const sgst           = Number(invoice.sgst)           || 0;
    const totalTax       = Number(invoice.total_tax)      || 0;
    const finalAmount    = Number(invoice.final_amount)   || 0;
    const totalQty       = items.reduce((s,i) => s + Number(i.quantity||0), 0);
    const orderDate      = invoice.order_created_at || invoice.created_at || new Date();
    const invoiceNo      = String(invoice.id || order_id).padStart(4, '0');

    // Per-item GST calc
    const rows = items.map(item => {
        const sub  = Number(item.subtotal) || (Number(item.quantity) * Number(item.price));
        const cAmt = +(sub * 0.09).toFixed(2);
        const sAmt = +(sub * 0.09).toFixed(2);
        const tot  = +(sub + cAmt + sAmt).toFixed(2);
        return { ...item, subtotal: sub, cAmt, sAmt, tot, hsn: getHSN(item.product_name) };
    });

    const totalCGST = rows.reduce((s,r) => s + r.cAmt, 0);
    const totalSGST = rows.reduce((s,r) => s + r.sAmt, 0);
    const totalAmt  = rows.reduce((s,r) => s + r.tot, 0);

    return (
        <div style={{maxWidth:'230mm',margin:'0 auto',fontFamily:"'Inter',sans-serif"}}>

            {/* ── Toolbar ── */}
            <div className="no-print" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'0.75rem'}}>
                <Link to={`/orders/${order_id}`} style={{display:'flex',alignItems:'center',gap:'4px',textDecoration:'none',color:'#555',fontWeight:'600',fontSize:'14px'}}>
                    <ChevronLeft size={16} /> Back to Order
                </Link>
                <div style={{display:'flex',gap:'0.75rem'}}>
                    <button onClick={handlePrint} style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',border:'1px solid #ccc',borderRadius:'8px',background:'#f5f5f5',cursor:'pointer',fontWeight:'600',fontSize:'13px'}}>
                        <Printer size={14}/> Print
                    </button>
                    <button onClick={handleDownloadPDF} disabled={downloading} style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 18px',border:'none',borderRadius:'8px',background: downloading?'#86efac':'#16a34a',color:'#fff',cursor:downloading?'not-allowed':'pointer',fontWeight:'700',fontSize:'13px'}}>
                        {downloading ? <><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> Generating…</> : <><Download size={14}/> Download PDF</>}
                    </button>
                </div>
            </div>

            {/* ── Invoice Document ── */}
            <div ref={invoiceRef} style={S.page}>

                {/* HEADER */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',borderBottom:'2px solid #000',paddingBottom:'6px',marginBottom:'4px'}}>
                    <div style={{flex:1}}>
                        <div style={{fontSize:'22px',fontWeight:'900',letterSpacing:'1px',color:'#000',lineHeight:'1.1'}}>{COMPANY.name}</div>
                        <div style={{fontSize:'9px',fontWeight:'bold',color:'#333',marginTop:'2px'}}>{COMPANY.tagline}</div>
                        <div style={{fontSize:'9px',marginTop:'4px',lineHeight:'1.6'}}>
                            <div>📍 {COMPANY.address}</div>
                            <div>{COMPANY.address2}, {COMPANY.city}</div>
                            <div>📞 {COMPANY.phone}</div>
                            <div>✉ {COMPANY.email}</div>
                        </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'18px',fontWeight:'900',letterSpacing:'2px',border:'2px solid #000',padding:'4px 12px',display:'inline-block',marginBottom:'6px'}}>TAX INVOICE</div>
                        <div style={{fontSize:'9px',fontWeight:'bold'}}>ORIGINAL FOR RECIPIENT</div>
                        <div style={{marginTop:'4px',fontSize:'9px'}}><strong>GSTIN:</strong> {COMPANY.gstin}</div>
                        <div style={{fontSize:'9px'}}><strong>PAN:</strong> {COMPANY.pan}</div>
                    </div>
                </div>

                {/* CUSTOMER + INVOICE META */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',border:'1px solid #000',marginBottom:'0'}}>
                    <div style={{borderRight:'1px solid #000',padding:'6px'}}>
                        <div style={{fontWeight:'bold',fontSize:'10px',borderBottom:'1px solid #ccc',paddingBottom:'2px',marginBottom:'4px'}}>Customer Detail</div>
                        <table style={{fontSize:'10px',width:'100%'}}>
                            <tbody>
                                <tr><td style={{fontWeight:'bold',width:'50px',paddingBottom:'2px'}}>M/S</td><td style={{fontWeight:'bold'}}>{invoice.customer_name}</td></tr>
                                <tr><td style={{fontWeight:'bold',paddingBottom:'2px'}}>Address</td><td>{invoice.customer_email}</td></tr>
                                <tr><td style={{fontWeight:'bold',paddingBottom:'2px'}}>Phone</td><td>—</td></tr>
                                <tr><td style={{fontWeight:'bold',paddingBottom:'2px'}}>GSTIN</td><td>—</td></tr>
                                <tr><td style={{fontWeight:'bold'}}>PAN</td><td>—</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style={{padding:'6px'}}>
                        <table style={{fontSize:'10px',width:'100%'}}>
                            <tbody>
                                <tr>
                                    <td style={{fontWeight:'bold',paddingBottom:'4px'}}>Invoice No.</td>
                                    <td style={{fontWeight:'bold',fontSize:'16px',paddingBottom:'4px'}}>{invoiceNo}</td>
                                    <td style={{fontWeight:'bold',paddingBottom:'4px'}}>Invoice Date</td>
                                    <td style={{paddingBottom:'4px'}}>{fmtDate(orderDate)}</td>
                                </tr>
                                <tr>
                                    <td style={{fontWeight:'bold',paddingTop:'4px'}}>Order Ref.</td>
                                    <td style={{fontWeight:'bold',paddingTop:'4px'}}>ORD-{order_id}</td>
                                    <td style={{fontWeight:'bold',paddingTop:'4px'}}>Due Date</td>
                                    <td style={{paddingTop:'4px'}}>{fmtDate(new Date(new Date(orderDate).getTime() + 15*86400000))}</td>
                                </tr>
                                <tr>
                                    <td style={{fontWeight:'bold',paddingTop:'8px'}}>Status</td>
                                    <td colSpan="3" style={{paddingTop:'8px'}}>
                                        <span style={{padding:'2px 10px',fontWeight:'bold',fontSize:'10px',border:'1px solid',
                                            background: invoice.order_status==='completed'?'#dcfce7': invoice.order_status==='cancelled'?'#fee2e2':'#fef3c7',
                                            borderColor: invoice.order_status==='completed'?'#166534': invoice.order_status==='cancelled'?'#991b1b':'#b45309',
                                            color: invoice.order_status==='completed'?'#166534': invoice.order_status==='cancelled'?'#991b1b':'#b45309',
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
                <table style={{width:'100%',borderCollapse:'collapse',marginTop:'0'}}>
                    <thead>
                        <tr>
                            <th style={{...S.th,width:'28px'}}>Sr. No.</th>
                            <th style={{...S.th,textAlign:'left'}}>Name of Product / Service</th>
                            <th style={{...S.th,width:'70px'}}>HSN / SAC</th>
                            <th style={{...S.th,width:'50px'}}>Qty</th>
                            <th style={{...S.th,width:'60px'}}>Rate</th>
                            <th style={{...S.th,width:'75px'}}>Taxable Value</th>
                            <th style={{...S.th,width:'28px'}}>CGST %</th>
                            <th style={{...S.th,width:'60px'}}>CGST Amt</th>
                            <th style={{...S.th,width:'28px'}}>SGST %</th>
                            <th style={{...S.th,width:'60px'}}>SGST Amt</th>
                            <th style={{...S.th,width:'75px'}}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((item, idx) => (
                            <tr key={idx}>
                                <td style={{...S.tdC}}>{idx+1}</td>
                                <td style={{...S.td}}>
                                    <div style={{fontWeight:'bold'}}>{item.product_name}</div>
                                    <div style={{fontSize:'9px',color:'#333'}}>{item.size} {item.unit ? `(${item.unit})` : ''}</div>
                                </td>
                                <td style={{...S.tdC}}>{item.hsn}</td>
                                <td style={{...S.tdC}}>{item.quantity}</td>
                                <td style={{...S.tdR}}>{fmtINR(item.price)}</td>
                                <td style={{...S.tdR}}>{fmtINR(item.subtotal)}</td>
                                <td style={{...S.tdC}}>9.00</td>
                                <td style={{...S.tdR}}>{fmtINR(item.cAmt)}</td>
                                <td style={{...S.tdC}}>9.00</td>
                                <td style={{...S.tdR}}>{fmtINR(item.sAmt)}</td>
                                <td style={{...S.tdR,fontWeight:'bold'}}>{fmtINR(item.tot)}</td>
                            </tr>
                        ))}
                        {/* Empty filler rows */}
                        {rows.length < 6 && Array.from({length: 6 - rows.length}).map((_, i) => (
                            <tr key={`empty-${i}`} style={{height:'22px'}}>
                                {Array.from({length:11}).map((_,j) => <td key={j} style={{...S.td}}>&nbsp;</td>)}
                            </tr>
                        ))}
                        {/* Totals row */}
                        <tr style={{backgroundColor:'#e8e8e8'}}>
                            <td colSpan="3" style={{...S.td,fontWeight:'bold',textAlign:'center'}}>Total</td>
                            <td style={{...S.tdC,fontWeight:'bold'}}>{totalQty}</td>
                            <td style={{...S.td}}></td>
                            <td style={{...S.tdR,fontWeight:'bold'}}>{fmtINR(taxable)}</td>
                            <td style={{...S.td}}></td>
                            <td style={{...S.tdR,fontWeight:'bold'}}>{fmtINR(totalCGST)}</td>
                            <td style={{...S.td}}></td>
                            <td style={{...S.tdR,fontWeight:'bold'}}>{fmtINR(totalSGST)}</td>
                            <td style={{...S.tdR,fontWeight:'bold'}}>{fmtINR(totalAmt)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* AMOUNT IN WORDS + TOTALS */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',border:'1px solid #000',borderTop:'none'}}>
                    <div style={{borderRight:'1px solid #000',padding:'6px'}}>
                        <div style={{fontSize:'9px',fontWeight:'bold',marginBottom:'2px'}}>Total in words</div>
                        <div style={{fontSize:'10px',fontWeight:'bold',textTransform:'uppercase',color:'#111'}}>{amountToWords(finalAmount)}</div>
                    </div>
                    <div style={{padding:'6px'}}>
                        <table style={{width:'100%',fontSize:'10px'}}>
                            <tbody>
                                <tr><td>Taxable Amount</td><td style={{textAlign:'right',fontWeight:'bold'}}>{fmtINR(taxable)}</td></tr>
                                <tr><td>Add: CGST</td><td style={{textAlign:'right'}}>{fmtINR(cgst)}</td></tr>
                                <tr><td>Add: SGST</td><td style={{textAlign:'right'}}>{fmtINR(sgst)}</td></tr>
                                <tr><td style={{fontWeight:'bold'}}>Total Tax</td><td style={{textAlign:'right',fontWeight:'bold'}}>{fmtINR(totalTax)}</td></tr>
                                <tr style={{borderTop:'2px solid #000'}}>
                                    <td style={{fontWeight:'bold',fontSize:'12px',paddingTop:'4px'}}>Total Amount After Tax</td>
                                    <td style={{textAlign:'right',fontWeight:'bold',fontSize:'13px',paddingTop:'4px'}}>₹{fmtINR(finalAmount)}</td>
                                </tr>
                                <tr><td colSpan="2" style={{fontSize:'9px',color:'#555'}}>(E. &amp; O.E)</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BANK DETAILS + TERMS + SIGNATURE */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',border:'1px solid #000',borderTop:'none',minHeight:'80px'}}>
                    <div style={{borderRight:'1px solid #000',padding:'6px'}}>
                        <div style={{fontWeight:'bold',fontSize:'10px',marginBottom:'4px',borderBottom:'1px solid #ccc',paddingBottom:'2px'}}>Bank Details</div>
                        <table style={{fontSize:'10px',width:'100%'}}>
                            <tbody>
                                <tr><td style={{fontWeight:'bold',width:'70px'}}>Name</td><td>{COMPANY.bank.name}</td></tr>
                                <tr><td style={{fontWeight:'bold'}}>Branch</td><td>{COMPANY.bank.branch}</td></tr>
                                <tr><td style={{fontWeight:'bold'}}>Acc. Number</td><td>{COMPANY.bank.acc}</td></tr>
                                <tr><td style={{fontWeight:'bold'}}>IFSC</td><td>{COMPANY.bank.ifsc}</td></tr>
                            </tbody>
                        </table>
                        <div style={{marginTop:'6px',borderTop:'1px solid #ccc',paddingTop:'4px'}}>
                            <div style={{fontWeight:'bold',fontSize:'10px',marginBottom:'2px'}}>Terms and Conditions</div>
                            <div style={{fontSize:'8.5px',lineHeight:'1.5',color:'#333'}}>
                                Subject to Vadodara Jurisdiction.<br/>
                                Our responsibility ceases as soon as goods leave our premises.<br/>
                                Goods once sold will not be taken back.<br/>
                                The processed material would not be taken back by us.<br/>
                                This is a computer generated invoice.
                            </div>
                        </div>
                    </div>
                    <div style={{padding:'6px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                        <div>
                            <div style={{fontSize:'10px',fontWeight:'bold',textAlign:'center',marginBottom:'4px'}}>Certified that the particulars given above are true and correct.</div>
                            <div style={{fontSize:'11px',fontWeight:'bold',textAlign:'center',marginTop:'8px'}}>For {COMPANY.name}</div>
                        </div>
                        <div style={{textAlign:'center',paddingBottom:'4px'}}>
                            <div style={{height:'50px',display:'flex',alignItems:'center',justifyContent:'center',color:'#999',fontSize:'9px',fontStyle:'italic'}}>[Authorised Signature]</div>
                            <div style={{borderTop:'1px solid #000',paddingTop:'2px',fontSize:'9px',fontWeight:'bold'}}>Authorised Signatory</div>
                        </div>
                    </div>
                </div>

                {/* PAGE NUMBER */}
                <div style={{textAlign:'center',marginTop:'4px',fontSize:'9px',color:'#555'}}>Page 1 of 1</div>
            </div>

            {/* PDF hint */}
            <div className="no-print" style={{marginTop:'12px',padding:'10px 14px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'8px',display:'flex',gap:'8px',alignItems:'flex-start'}}>
                <AlertTriangle size={14} color="#d97706" style={{flexShrink:0,marginTop:'1px'}}/>
                <p style={{margin:0,fontSize:'12px',color:'#92400e'}}>
                    PDF download requires <code>html2canvas</code> and <code>jspdf</code>. Run: <code style={{background:'#fef3c7',padding:'1px 6px',borderRadius:'4px'}}>npm install html2canvas jspdf</code> in your frontend folder.
                </p>
            </div>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceView;
