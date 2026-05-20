import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { Loader2, Edit, Trash2, Eye, PackageOpen, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000';

const ProductList = () => {
  const { role } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts({ page, limit: 12, search: activeSearch, category });
      const fetchedData = res.data;
      setProducts(Array.isArray(fetchedData) ? fetchedData : (fetchedData?.data || []));
      if (res.total !== undefined) {
        setTotalPages(Math.max(1, Math.ceil(res.total / (res.limit || 12))));
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to fetch catalog data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, activeSearch, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); 
    setActiveSearch(searchInput);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you critically sure you want to delete this specific product? All variants will cascade and be destroyed natively.")) {
      return;
    }

    try {
      await deleteProduct(id);
      toast.success('Product successfully purged automatically.');
      fetchProducts(); // Refresh list 
    } catch (err) {
      toast.error(err?.response?.data?.message || "Purge execution explicitly failed.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '400px', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
        <Loader2 size={44} style={{ animation: 'spin 1.2s linear infinite', marginBottom: '1rem' }} />
        <p style={{ fontWeight: '600', color: '#64748b' }}>Loading Material Catalog...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: '0 0 0.35rem 0', fontSize: '2rem', fontWeight: '800', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>Product Catalog</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Manage Hari Krupa engineering materials inventory, pricing, and variants.</p>
        </div>
        
        {role === 'owner' && (
          <Link to="/products/add" style={{ textDecoration: 'none' }}>
            <button 
              className="brutal-btn"
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', 
                backgroundColor: '#10b981', color: '#ffffff', fontWeight: '600', 
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Plus size={18} />
              Add New Product
            </button>
          </Link>
        )}
      </div>

      {/* Styled Filtering Bar */}
      <div style={{ 
        backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '20px', 
        border: '1px solid rgba(15, 23, 42, 0.05)', marginBottom: '2.5rem', 
        display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', 
        justifyContent: 'space-between', boxShadow: 'var(--shadow-premium-sm)'
      }}>
         <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexGrow: 1, maxWidth: '540px' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Search materials by name..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ 
                  padding: '0.65rem 1rem 0.65rem 2.25rem !important', 
                  borderRadius: '12px !important', 
                  border: '1px solid rgba(15, 23, 42, 0.08) !important', 
                  width: '100%', 
                  fontSize: '0.9rem !important' 
                }}
              />
            </div>
            <button 
              type="submit" 
              className="brutal-btn"
              style={{ 
                padding: '0.65rem 1.25rem', backgroundColor: '#f1f5f9', 
                color: '#475569', fontWeight: '600', fontSize: '0.85rem',
                borderRadius: '12px', boxShadow: 'none'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
               Search
            </button>
            {activeSearch && (
              <button 
                type="button" 
                onClick={() => { setSearchInput(''); setActiveSearch(''); setPage(1); }} 
                className="brutal-btn"
                style={{ 
                  padding: '0.65rem 1.1rem', backgroundColor: '#fef2f2', 
                  color: '#ef4444', fontWeight: '600', fontSize: '0.85rem',
                  borderRadius: '12px', boxShadow: 'none', border: '1px solid rgba(239, 68, 68, 0.1)'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
              >
                 Clear
              </button>
            )}
         </form>

         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter:</span>
            <select 
              value={category} 
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              style={{ 
                padding: '0.65rem 2rem 0.65rem 1rem !important', 
                borderRadius: '12px !important', 
                border: '1px solid rgba(15, 23, 42, 0.08) !important', 
                backgroundColor: 'rgba(255, 255, 255, 0.8) !important', 
                fontSize: '0.9rem !important', 
                minWidth: '160px',
                cursor: 'pointer'
              }}
            >
              <option value="">All Categories</option>
              <option value="alloy">Alloy</option>
              <option value="steel">Steel</option>
              <option value="aluminum">Aluminum</option>
              <option value="titanium">Titanium</option>
              <option value="composite">Composite</option>
              <option value="polymer">Polymer</option>
            </select>
         </div>
      </div>

      {/* Empty State */}
      {!Array.isArray(products) || products.length === 0 ? (
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 2rem', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px dashed rgba(15, 23, 42, 0.12)', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageOpen size={44} color="#10b981" />
          </div>
          <h3 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>No materials listed</h3>
          <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '400px', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: '500' }}>No products match your search filters. Try clearing filters or adding a new material entry.</p>
          {role === 'owner' && (
             <Link to="/products/add" style={{ textDecoration: 'none' }}>
               <button 
                 className="brutal-btn"
                 style={{ 
                   padding: '0.65rem 1.25rem', backgroundColor: '#ffffff', 
                   color: '#475569', fontWeight: '600', fontSize: '0.85rem',
                   borderRadius: '12px', border: '1px solid rgba(15, 23, 42, 0.1)',
                   boxShadow: 'none'
                 }}
                 onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                 onMouseOut={e => e.currentTarget.style.backgroundColor = '#ffffff'}
               >
                 Add New Product
               </button>
             </Link>
          )}
        </div>
      ) : (
        /* Product Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {Array.isArray(products) && products.map((p) => (
            <div key={p.id} className="brutal-card" style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid rgba(15, 23, 42, 0.05)',
              boxShadow: 'var(--shadow-premium)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
              e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.05)';
            }}
            >
              {/* Product Visual Container */}
              <div style={{ height: '200px', backgroundColor: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                {p.image_url ? (
                  <img src={`${API_URL}${p.image_url}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column' }}>
                    <PackageOpen size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>No Material Preview</span>
                  </div>
                )}
                
                {/* Floating Glassmorphic Category Badge */}
                <div style={{ 
                  position: 'absolute', top: '14px', right: '14px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)',
                  padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.7rem', 
                  fontWeight: '700', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.15)', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.03)', textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>
                  {p.category}
                </div>
              </div>
              
              {/* Details */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>
                  <span style={{ lineHeight: '1.25' }}>{p.name}</span>
                  <span style={{ 
                    fontSize: '0.7rem', color: '#059669', fontWeight: '700', 
                    backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.2rem 0.5rem', 
                    borderRadius: '6px', flexShrink: 0, marginLeft: '0.5rem'
                  }}>
                    {p.variants ? p.variants.length : 0} Variants
                  </span>
                </h3>

                <div style={{ 
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', 
                  marginBottom: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' 
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.02em', marginBottom: '0.2rem' }}>GST Levy Rate</span>
                    <strong style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '700' }}>{p.gst_percentage}% GST</strong>
                  </div>
                </div>

                {/* Footer UI Bounds */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <Link to={`/products/${p.id}`} style={{ flexGrow: 1, textDecoration: 'none' }}>
                    <button 
                      className="brutal-btn"
                      style={{ 
                        width: '100%', padding: '0.5rem', backgroundColor: '#f8fafc', 
                        borderRadius: '10px', color: '#475569', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', gap: '0.4rem', 
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', boxShadow: 'none'
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    >
                      <Eye size={14} /> Catalog
                    </button>
                  </Link>

                  {role === 'owner' && (
                    <>
                      <Link to={`/products/edit/${p.id}`} style={{ textDecoration: 'none' }}>
                        <button 
                          className="brutal-btn"
                          style={{ 
                            padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '10px', 
                            color: '#d97706', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', cursor: 'pointer', boxShadow: 'none',
                            border: '1px solid rgba(217, 119, 6, 0.1)'
                          }} 
                          title="Edit Product"
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#fde68a'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = '#fef3c7'}
                        >
                          <Edit size={14} />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="brutal-btn"
                        style={{ 
                          padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: '10px', 
                          color: '#ef4444', display: 'flex', alignItems: 'center', 
                          justifyContent: 'center', cursor: 'pointer', boxShadow: 'none',
                          border: '1px solid rgba(239, 68, 68, 0.1)'
                        }}
                        title="Delete Product"
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Engine */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3.5rem', gap: '1.25rem' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            className="brutal-btn"
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '10px', 
              backgroundColor: page === 1 ? '#f8fafc' : '#ffffff', 
              color: page === 1 ? '#94a3b8' : '#475569', 
              cursor: page === 1 ? 'not-allowed' : 'pointer', 
              fontWeight: '700', fontSize: '0.85rem', boxShadow: 'none',
              border: '1px solid rgba(15, 23, 42, 0.08)'
            }}
            onMouseOver={e => { if (page !== 1) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseOut={e => { if (page !== 1) e.currentTarget.style.backgroundColor = '#ffffff'; }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
             Showing page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
            className="brutal-btn"
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '10px', 
              backgroundColor: page === totalPages ? '#f8fafc' : '#ffffff', 
              color: page === totalPages ? '#94a3b8' : '#475569', 
              cursor: page === totalPages ? 'not-allowed' : 'pointer', 
              fontWeight: '700', fontSize: '0.85rem', boxShadow: 'none',
              border: '1px solid rgba(15, 23, 42, 0.08)'
            }}
            onMouseOver={e => { if (page !== totalPages) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseOut={e => { if (page !== totalPages) e.currentTarget.style.backgroundColor = '#ffffff'; }}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default ProductList;
