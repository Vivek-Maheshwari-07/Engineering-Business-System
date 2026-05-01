import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopProducts } from '../../services/reportService';
import { Loader2, Trophy, ChevronLeft, Medal } from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
const fmtNum = (n) => Number(n || 0).toLocaleString('en-IN');

const RANK_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];
const RANK_MEDALS = ['🥇', '🥈', '🥉'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ backgroundColor: '#1f2937', color: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '700', color: '#d1fae5' }}>{label}</p>
            <p style={{ margin: 0 }}>Units Sold: <strong>{fmtNum(payload[0]?.value)}</strong></p>
            {payload[1] && <p style={{ margin: '0.15rem 0 0 0', color: '#fde68a' }}>Revenue: <strong>{fmtINR(payload[1]?.value)}</strong></p>}
        </div>
    );
};

const TopProducts = () => {
    const [data, setData]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit]   = useState(10);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await getTopProducts(limit);
                setData(Array.isArray(res.data) ? res.data : []);
            } catch {
                toast.error('Failed to load top products.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [limit]);

    const totalSold    = data.reduce((s, d) => s + d.total_sold, 0);
    const totalRevenue = data.reduce((s, d) => s + d.total_revenue, 0);

    if (loading) return (
        <div style={{ display: 'flex', height: '400px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Loader2 size={44} style={{ animation: 'spin 1.2s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <Link to="/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                        <ChevronLeft size={15} /> Back to Dashboard
                    </Link>
                    <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '2rem', fontWeight: '900', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={28} color="#16a34a" /> Top Selling Products
                    </h1>
                    <p style={{ margin: 0, color: '#6b7280' }}>Ranked by total units sold across all orders.</p>
                </div>
                {/* Limit Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                    <span style={{ fontWeight: '600' }}>Show top</span>
                    {[5, 10, 20].map(n => (
                        <button key={n} onClick={() => setLimit(n)}
                            style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s', backgroundColor: limit === n ? '#16a34a' : '#ffffff', color: limit === n ? '#ffffff' : '#374151', borderColor: limit === n ? '#16a34a' : '#d1d5db' }}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: `Total Products Ranked`, value: data.length, color: '#374151' },
                    { label: 'Total Units Sold',      value: fmtNum(totalSold),    color: '#16a34a' },
                    { label: 'Total Revenue',          value: fmtINR(totalRevenue), color: '#3b82f6' },
                ].map(c => (
                    <div key={c.label} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.72rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: c.color }}>{c.value}</p>
                    </div>
                ))}
            </div>

            {data.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '4rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
                    <Trophy size={48} style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>No sales data available yet.</p>
                </div>
            ) : (
                <>
                    {/* Horizontal Bar Chart */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: '700', color: '#1f2937' }}>Units Sold Comparison</h3>
                        <ResponsiveContainer width="100%" height={Math.max(data.length * 48, 240)}>
                            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="product_name" width={150} tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="total_sold" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fill: '#6b7280', formatter: v => fmtNum(v) }}>
                                    {data.map((_, i) => (
                                        <Cell key={i} fill={RANK_COLORS[Math.min(i, RANK_COLORS.length - 1)]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Rankings Table */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Medal size={16} color="#16a34a" /> Full Rankings
                            </h3>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={th}>Rank</th>
                                    <th style={th}>Product</th>
                                    <th style={th}>Category</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Units Sold</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Revenue</th>
                                    <th style={{ ...th, textAlign: 'right' }}>% Share</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => {
                                    const share = totalSold > 0 ? ((row.total_sold / totalSold) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i < 3 ? '#f0fdf4' : 'transparent', transition: 'background 0.12s' }}
                                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                            onMouseOut={e => e.currentTarget.style.backgroundColor = i < 3 ? '#f0fdf4' : 'transparent'}>
                                            <td style={td}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '800', color: i < 3 ? '#16a34a' : '#6b7280' }}>
                                                    {RANK_MEDALS[i] || `#${i + 1}`}
                                                </span>
                                            </td>
                                            <td style={td}><span style={{ fontWeight: '700', color: '#1f2937' }}>{row.product_name}</span></td>
                                            <td style={td}><span style={{ fontSize: '0.8rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{row.category}</span></td>
                                            <td style={{ ...td, textAlign: 'right', fontWeight: '800', color: '#111827' }}>{fmtNum(row.total_sold)}</td>
                                            <td style={{ ...td, textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>{fmtINR(row.total_revenue)}</td>
                                            <td style={{ ...td, textAlign: 'right', color: '#6b7280' }}>{share}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0);} }`}</style>
        </div>
    );
};

const th = { padding: '0.85rem 1.5rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700', backgroundColor: '#f9fafb' };
const td = { padding: '1rem 1.5rem', color: '#4b5563', fontSize: '0.9rem' };

export default TopProducts;
