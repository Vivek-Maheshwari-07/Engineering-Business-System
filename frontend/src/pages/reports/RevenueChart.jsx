import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMonthlyRevenue } from '../../services/reportService';
import { Loader2, TrendingUp, ChevronLeft, IndianRupee } from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ backgroundColor: '#1f2937', color: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '700', color: '#d1fae5' }}>{label}</p>
            <p style={{ margin: 0 }}>Revenue: <strong>{fmtINR(payload[0]?.value)}</strong></p>
        </div>
    );
};

const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const RevenueChart = () => {
    const [data, setData]     = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await getMonthlyRevenue();
                // Fill missing months with 0 for a complete 12-month view
                const map = {};
                (Array.isArray(res.data) ? res.data : []).forEach(r => { map[r.month] = r.revenue; });
                setData(MONTH_ORDER.map(m => ({ month: m, revenue: map[m] || 0 })));
            } catch {
                toast.error('Failed to load revenue data.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);
    const bestMonth    = data.reduce((best, r) => r.revenue > best.revenue ? r : best, { month: '—', revenue: 0 });

    if (loading) return (
        <div style={{ display: 'flex', height: '400px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Loader2 size={44} style={{ animation: 'spin 1.2s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '1.75rem' }}>
                <Link to="/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                    <ChevronLeft size={15} /> Back to Dashboard
                </Link>
                <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '2rem', fontWeight: '900', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={28} color="#16a34a" /> Monthly Revenue Report
                </h1>
                <p style={{ margin: 0, color: '#6b7280' }}>Revenue breakdown month-by-month for the current financial year.</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Revenue (YTD)', value: fmtINR(totalRevenue), color: '#16a34a' },
                    { label: 'Best Month', value: bestMonth.month, color: '#3b82f6' },
                    { label: 'Best Month Revenue', value: fmtINR(bestMonth.revenue), color: '#8b5cf6' },
                ].map(c => (
                    <div key={c.label} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.75rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                        <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: c.color }}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Area Chart */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#1f2937' }}>Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ r: 5, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#1f2937' }}>Monthly Comparison</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.month === bestMonth.month ? '#16a34a' : '#bbf7d0'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <IndianRupee size={16} color="#16a34a" /> Revenue by Month
                    </h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={th}>Month</th>
                            <th style={{ ...th, textAlign: 'right' }}>Revenue</th>
                            <th style={{ ...th, textAlign: 'right' }}>% of Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => {
                            const pct = totalRevenue > 0 ? ((row.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
                            return (
                                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: row.month === bestMonth.month ? '#f0fdf4' : 'transparent' }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = row.month === bestMonth.month ? '#f0fdf4' : 'transparent'}>
                                    <td style={td}><span style={{ fontWeight: row.month === bestMonth.month ? '800' : '500', color: row.month === bestMonth.month ? '#16a34a' : '#374151' }}>{row.month} {row.month === bestMonth.month && '🏆'}</span></td>
                                    <td style={{ ...td, textAlign: 'right', fontWeight: '700', color: row.revenue > 0 ? '#111827' : '#d1d5db' }}>{row.revenue > 0 ? fmtINR(row.revenue) : '—'}</td>
                                    <td style={{ ...td, textAlign: 'right', color: '#6b7280' }}>{row.revenue > 0 ? `${pct}%` : '—'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                            <td style={{ ...td, fontWeight: '800', color: '#111827' }}>Total</td>
                            <td style={{ ...td, textAlign: 'right', fontWeight: '900', color: '#16a34a', fontSize: '1rem' }}>{fmtINR(totalRevenue)}</td>
                            <td style={{ ...td, textAlign: 'right', fontWeight: '700', color: '#374151' }}>100%</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0);} }`}</style>
        </div>
    );
};

const th = { padding: '0.85rem 1.5rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700', backgroundColor: '#f9fafb' };
const td = { padding: '1rem 1.5rem', color: '#4b5563', fontSize: '0.9rem' };

export default RevenueChart;
