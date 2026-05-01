import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getInventory } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Package, Plus, History, Beaker, Archive, Search, Filter, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const InventoryList = () => {
    const { role } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Client-side Analytics and Matrix Filters
    const [searchInput, setSearchInput] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchInventoryMap = async () => {
            try {
                setLoading(true);
                const res = await getInventory();
                const fetchedData = res.data;
                setInventory(Array.isArray(fetchedData) ? fetchedData : (fetchedData?.data || []));
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Failed connecting to structural inventory logs.');
            } finally {
                setLoading(false);
            }
        };

        fetchInventoryMap();
    }, []);

    // Extract dynamic explicitly mapped categories inherently from active generic data
    const categories = useMemo(() => {
        if (!Array.isArray(inventory)) return [];
        const cats = new Set(inventory.map(item => item.category));
        return Array.from(cats).filter(Boolean).sort();
    }, [inventory]);

    // Construct unified slice mappings parsing metrics logically
    const filteredInventory = useMemo(() => {
        if (!Array.isArray(inventory)) return [];
        return inventory.filter((item) => {
            const matchesSearch = item.product_name?.toLowerCase().includes(searchInput.toLowerCase());
            const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
            return matchesSearch && matchesCategory;
        });
    }, [inventory, searchInput, categoryFilter]);

    // Final Explicit Array Sub-Selection mathematically slicing correctly
    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
    const paginatedInventory = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Strict Security Bound
    if (role === 'customer') {
        return <Navigate to="/unauthorized" />;
    }

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '400px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Loader2 size={48} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
            <p style={{ fontWeight: '500', color: '#4b5563' }}>Loading Inventory Data...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: '#111827', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Inventory Management</h1>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>Monitor and manage warehouse stock securely.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/inventory/logs" style={{ textDecoration: 'none' }}>
                        <button style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#ffffff', 
                            color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#9ca3af'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                            <History size={18} />
                            Audit Logs
                        </button>
                    </Link>
                    <Link to="/inventory/add" style={{ textDecoration: 'none' }}>
                        <button style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#15803d', 
                            color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(21, 128, 61, 0.4)'
                        }}>
                            <Plus size={18} />
                            Add Stock
                        </button>
                    </Link>
                </div>
            </div>

            {/* Matrix Advanced Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input 
                        type="text" 
                        placeholder="Search inventory items..."
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            setCurrentPage(1); // Reset bounds tracking inherently
                        }}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', color: '#1f2937', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div style={{ width: '250px', position: 'relative' }}>
                    <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', color: '#1f2937', backgroundColor: '#ffffff', boxSizing: 'border-box', cursor: 'pointer' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                {filteredInventory.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
                        <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <Archive size={48} color="#9ca3af" />
                        </div>
                        <h3 style={{ color: '#1f2937', margin: '0 0 0.5rem 0' }}>Inventory is Empty</h3>
                        <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>No items match your current filters. Adjust search parameters or add stock.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#f9fafb', fontWeight: '700' }}>Parent Config</th>
                                <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#f9fafb', fontWeight: '700' }}>Variant Bounds</th>
                                <th style={{ padding: '1rem 1.5rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#f9fafb', fontWeight: '700', textAlign: 'right' }}>Active Volume</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedInventory.map((item, index) => {
                                const isLowStock = item.quantity_available !== null && item.quantity_available < 10;
                                const isOutStock = item.quantity_available === 0;

                                return (
                                <tr key={item.variant_id} style={{ borderBottom: index < paginatedInventory.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background-color 0.2s', backgroundColor: isOutStock ? '#fef2f2' : 'transparent' }} onMouseOver={(e) => { if(!isOutStock) e.currentTarget.style.backgroundColor = '#f8fafc'; }} onMouseOut={(e) => { if(!isOutStock) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#111827' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Package size={16} color="#6b7280" /> {item.product_name}
                                                {isLowStock && !isOutStock && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#fef3c7', color: '#d97706', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        <AlertTriangle size={10} style={{ marginRight: '0.2rem' }} /> Low Stock
                                                    </span>
                                                )}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem', paddingLeft: '1.5rem' }}>{item.category}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#4b5563' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                            <Beaker size={14} color="#9ca3af" /> {item.size}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                            <span style={{ 
                                                fontSize: '1.1rem', 
                                                fontWeight: '800', 
                                                color: isOutStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#16a34a' 
                                            }}>
                                                {item.quantity_available == null ? 0 : item.quantity_available}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600' }}>{item.unit}</span>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Bound Mapping logic strictly isolated rendering dynamically smoothly inherently! */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', color: '#4b5563', fontSize: '0.9rem' }}>
                    <span>Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredInventory.length)}</strong> of <strong>{filteredInventory.length}</strong> items</span>
                    
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff', color: currentPage === 1 ? '#9ca3af' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {[...Array(totalPages)].map((_, idx) => {
                            // Smart logic intrinsically bounding explicitly avoiding massive mathematical mapping spills generic
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

export default InventoryList;
