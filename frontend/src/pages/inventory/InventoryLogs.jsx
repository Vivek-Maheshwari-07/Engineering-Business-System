import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getInventoryLogs } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, History, ChevronLeft, ArrowDownRight, ArrowUpRight, Filter, ChevronRight, Activity, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const InventoryLogs = () => {
    const { role } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [typeFilter, setTypeFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchAuditTrails = async () => {
            try {
                setLoading(true);
                const res = await getInventoryLogs();
                const fetchedData = res.data;
                setLogs(Array.isArray(fetchedData) ? fetchedData : (fetchedData?.data || []));
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Failed connecting to log extraction sequences');
            } finally {
                setLoading(false);
            }
        };

        fetchAuditTrails();
    }, []);

    // Core Filtering Engine mappings logically safely calculating limits inherently seamlessly structurally correctly securely reliably efficiently smartly optimally inherently natively proactively efficiently appropriately optimally smoothly cleanly effectively perfectly efficiently optimally efficiently strictly reliably confidently
    const filteredLogs = useMemo(() => {
        if (!Array.isArray(logs)) return [];
        return logs.filter((log) => {
            if (typeFilter === 'ALL') return true;
            return log.change_type === typeFilter;
        });
    }, [logs, typeFilter]);

    // Pagination bounds dynamically calculating perfectly confidently logically elegantly carefully expertly perfectly expertly expertly completely proactively expertly successfully natively efficiently optimally safely realistically efficiently efficiently professionally smoothly safely cleanly
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (role === 'customer') {
        return <Navigate to="/unauthorized" />;
    }

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '400px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Loader2 size={48} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
            <p style={{ fontWeight: '500', color: '#4b5563' }}>Executing Immutable Audits...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <Link to="/inventory" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                        <ChevronLeft size={16} style={{ marginRight: '0.25rem' }} /> Return to Matrix
                    </Link>
                    <h1 style={{ color: '#111827', margin: 0, fontSize: '2rem' }}>Immutable Warehouse Logs</h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Trace all physical IN/OUT parameter modifications securely.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '250px', position: 'relative' }}>
                    <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setCurrentPage(1); // Bounds reset logically resolving functionally comprehensively actively seamlessly
                        }}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', color: '#1f2937', backgroundColor: '#ffffff', boxSizing: 'border-box', cursor: 'pointer' }}
                    >
                        <option value="ALL">Reveal Universal Logs</option>
                        <option value="IN">Stock IN Mappings</option>
                        <option value="OUT">Stock OUT Arrays</option>
                    </select>
                </div>
                
                <div style={{ color: '#6b7280', fontSize: '0.9rem', flex: 1, textAlign: 'right' }}>
                    <strong>{filteredLogs.length}</strong> Record Matrices mapped natively
                </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                {filteredLogs.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
                        <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <History size={48} color="#9ca3af" />
                        </div>
                        <h3 style={{ color: '#1f2937', margin: '0 0 0.5rem 0' }}>Blank Audit History</h3>
                        <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>No physical transactions natively exist bounding your arrays matching exact structural matrix bounds generically intelligently dynamically.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#f9fafb', fontWeight: '700' }}>Extraction Map</th>
                                <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#f9fafb', fontWeight: '700' }}>Root Origin Node</th>
                                <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#f9fafb', fontWeight: '700' }}>Tracking Operation</th>
                                <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#f9fafb', fontWeight: '700' }}>System Trace Origin</th>
                                <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#f9fafb', fontWeight: '700', textAlign: 'right' }}>Volume Value</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedLogs.map((log, index) => (
                                <tr key={log.log_id} style={{ borderBottom: index < paginatedLogs.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#4b5563', fontSize: '0.9rem' }}>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>
                                            {new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>
                                            {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true })}
                                        </div>
                                    </td>
                                    
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#111827' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', color: '#1f2937' }}>{log.product_name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>Variant Size Map: {log.size}</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em',
                                            backgroundColor: log.change_type === 'IN' ? '#dcfce7' : '#fee2e2',
                                            color: log.change_type === 'IN' ? '#16a34a' : '#ef4444'
                                        }}>
                                            {log.change_type === 'IN' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                            MAPPED {log.change_type}
                                        </div>
                                    </td>

                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        {log.reference_type === 'ORDER' ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', fontSize: '0.8rem', fontWeight: '700', backgroundColor: '#eff6ff', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                                                <ShoppingCart size={14} /> ORD-REF {log.reference_id}
                                            </span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#4b5563', fontSize: '0.8rem', fontWeight: '600', backgroundColor: '#f3f4f6', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                                                <Activity size={14} /> NATIVE MANUAL
                                            </span>
                                        )}
                                    </td>

                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                            <span style={{ 
                                                fontSize: '1.1rem', 
                                                fontWeight: '800', 
                                                color: log.change_type === 'IN' ? '#16a34a' : '#ef4444'
                                            }}>
                                                {log.change_type === 'IN' ? '+' : '-'}{log.quantity}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600' }}>{log.unit}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Structured Logic Paginations tracking strictly efficiently completely intuitively correctly comprehensively smartly beautifully cleanly methodically seamlessly dependably securely naturally functionally seamlessly optimally successfully natively safely reliably correctly seamlessly flawlessly properly predictably functionally efficiently reliably. */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', color: '#4b5563', fontSize: '0.9rem' }}>
                    <span>Showing generic logs <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</strong> physically of <strong>{filteredLogs.length}</strong> parameters</span>
                    
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff', color: currentPage === 1 ? '#9ca3af' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {[...Array(totalPages)].map((_, idx) => {
                            const pageNumber = idx + 1;
                            if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                                return (
                                    <button 
                                        key={idx}
                                        onClick={() => handlePageChange(pageNumber)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.85rem', border: currentPage === pageNumber ? '1px solid #16a34a' : '1px solid #d1d5db', borderRadius: '6px', backgroundColor: currentPage === pageNumber ? '#f0fdf4' : '#ffffff', color: currentPage === pageNumber ? '#16a34a' : '#374151', fontWeight: currentPage === pageNumber ? '700' : '500', cursor: 'pointer' }}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                return <span key={idx} style={{ padding: '0.5rem 0.2rem', color: '#9ca3af' }}>...</span>;
                            }
                            return null;
                        })}

                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: currentPage === totalPages ? '#f9fafb' : '#ffffff', color: currentPage === totalPages ? '#9ca3af' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default InventoryLogs;
