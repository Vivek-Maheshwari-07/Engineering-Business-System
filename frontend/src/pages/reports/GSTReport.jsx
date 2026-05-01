import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGSTReport } from '../../services/reportService';
import { Loader2, FileText, ChevronLeft, IndianRupee, Percent } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';

const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const GSTReport = () => {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await getGSTReport();
                setData(res.data);
            } catch {
                toast.error('Failed to load GST report.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', height: '400px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Loader2 size={44} style={{ animation: 'spin 1.2s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!data) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            <FileText size={48} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1rem', fontWeight: '600' }}>No GST data found.</p>
        </div>
    );

    const pieData = [
        { name: 'CGST (9%)', value: data.total_cgst,    fill: '#16a34a' },
        { name: 'SGST (9%)', value: data.total_sgst,    fill: '#22c55e' },
    ].filter(d => d.value > 0);

    const gstRate = data.total_taxable > 0
        ? ((data.total_tax / data.total_taxable) * 100).toFixed(1)
        : '0.0';

    const cards = [
        { label: 'Taxable Amount',    value: fmtINR(data.total_taxable), accent: '#3b82f6', icon: <IndianRupee size={22} />, sub: 'Pre-tax base value' },
        { label: 'Total CGST (9%)',   value: fmtINR(data.total_cgst),   accent: '#16a34a', icon: <Percent size={22} />,      sub: 'Central GST collected' },
        { label: 'Total SGST (9%)',   value: fmtINR(data.total_sgst),   accent: '#22c55e', icon: <Percent size={22} />,      sub: 'State GST collected' },
        { label: 'Total Tax (18%)',   value: fmtINR(data.total_tax),    accent: '#f59e0b', icon: <FileText size={22} />,     sub: 'CGST + SGST' },
    ];

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '1.75rem' }}>
                <Link to="/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                    <ChevronLeft size={15} /> Back to Dashboard
                </Link>
                <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '2rem', fontWeight: '900', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={28} color="#16a34a" /> GST Report
                </h1>
                <p style={{ margin: 0, color: '#6b7280' }}>Aggregate GST data from all issued invoices. Rate: CGST 9% + SGST 9% = 18%.</p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {cards.map(c => (
                    <div key={c.label} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '70px', height: '70px', borderRadius: '50%', backgroundColor: c.accent, opacity: 0.08 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                            <span style={{ color: c.accent, opacity: 0.7 }}>{c.icon}</span>
                        </div>
                        <p style={{ margin: '0 0 0.3rem 0', fontSize: '1.5rem', fontWeight: '900', color: c.accent }}>{c.value}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>{c.sub}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

                {/* Pie breakdown */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#1f2937' }}>Tax Composition</h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={4}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip formatter={v => fmtINR(v)} contentStyle={{ fontSize: '0.85rem', borderRadius: '8px' }} />
                                <Legend iconType="circle" iconSize={10} formatter={v => <span style={{ fontSize: '0.8rem', color: '#374151' }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                            No invoice data yet.
                        </div>
                    )}
                </div>

                {/* Summary vertical table */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#1f2937' }}>Summary Statement</h3>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { label: 'Taxable Amount',   value: fmtINR(data.total_taxable), color: '#374151' },
                            { label: 'CGST @ 9%',        value: fmtINR(data.total_cgst),   color: '#16a34a' },
                            { label: 'SGST @ 9%',        value: fmtINR(data.total_sgst),   color: '#16a34a' },
                            { label: 'Total Tax (18%)',  value: fmtINR(data.total_tax),    color: '#f59e0b', separator: true },
                            { label: 'Grand Total',      value: fmtINR(data.total_final),  color: '#166534', bold: true },
                        ].map((row, i) => (
                            <div key={i}>
                                {row.separator && <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '0.25rem 0' }} />}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: row.bold ? '700' : '500' }}>{row.label}</span>
                                    <span style={{ fontSize: row.bold ? '1.1rem' : '0.95rem', fontWeight: row.bold ? '900' : '700', color: row.color }}>{row.value}</span>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '0.5rem', padding: '0.875rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#15803d', fontWeight: '700' }}>
                                Effective GST Rate: <span style={{ fontSize: '1rem' }}>{gstRate}%</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* GSTIN Compliance Note */}
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <FileText size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: '700', color: '#b45309', fontSize: '0.9rem' }}>GST Compliance Note</p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#92400e', lineHeight: '1.5' }}>
                        Figures shown are aggregated across all completed invoices. CGST and SGST are each levied at 9% of the taxable amount under the composite GST framework. Please verify with a certified CA for official filings.
                    </p>
                </div>
            </div>

            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0);} }`}</style>
        </div>
    );
};

export default GSTReport;
