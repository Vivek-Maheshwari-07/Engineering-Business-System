import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { Loader2, Plus, Edit, Trash2, Eye, PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000';

const ProductList = () => {
  const { role } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters conditionally mapped
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
    setPage(1); // Reset map implicitly explicitly
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
        <Loader2 size={48} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
        <p style={{ fontWeight: '500', color: '#4b5563' }}>Loading Products...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner mapping */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#111827', margin: '0 0 0.25rem 0', fontSize: '1.75rem', fontWeight: '800' }}>Product Catalog</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Manage your inventory items, pricing, and variants.</p>
        </div>
        
        {role === 'owner' && (
          <Link to="/products/add" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', backgroundColor: '#15803d', 
              color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(21, 128, 61, 0.4)'
            }}>
              <Plus size={18} />
              Add Product
            </button>
          </Link>
        )}
      </div>

      {/* Structured Filtering Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
         <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flexGrow: 1, maxWidth: '500px' }}>
            <input 
              type="text" 
              placeholder="Search by product name..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', flexGrow: 1, fontSize: '0.95rem' }}
            />
            <button type="submit" style={{ padding: '0.65rem 1.25rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
               Search
            </button>
            {activeSearch && (
              <button type="button" onClick={() => { setSearchInput(''); setActiveSearch(''); setPage(1); }} style={{ padding: '0.65rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}>
                 Clear
              </button>
            )}
         </form>

         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Filter by Category:</span>
            <select 
              value={category} 
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '0.95rem', minWidth: '150px' }}
            >
              <option value="">All Categories</option>
              {/* Abstracted category limits purely generic assuming standard inputs natively */}
              <option value="alloy">Alloy</option>
              <option value="steel">Steel</option>
              <option value="aluminum">Aluminum</option>
              <option value="titanium">Titanium</option>
              <option value="composite">Composite</option>
              <option value="polymer">Polymer</option>
            </select>
         </div>
      </div>

      {/* Empty Generic Container Map */}
      {!Array.isArray(products) || products.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <PackageOpen size={48} color="#9ca3af" />
          </div>
          <h3 style={{ color: '#1f2937', margin: '0 0 0.5rem 0' }}>No products found</h3>
          <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px', marginBottom: '2rem' }}>No products match your current filters. Add a new product to build your catalog.</p>
          {role === 'owner' && (
             <Link to="/products/add" style={{ textDecoration: 'none' }}>
               <button style={{ padding: '0.65rem 1.25rem', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px', color: '#374151', fontWeight: '500', cursor: 'pointer' }}>
                 Add New Product
               </button>
             </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {Array.isArray(products) && products.map((p) => (
            <div key={p.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Feature Map Visuals */}
              <div style={{ height: '220px', backgroundColor: '#f9fafb', position: 'relative' }}>
                {p.image_url ? (
                  <img src={`${API_URL}${p.image_url}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', flexDirection: 'column' }}>
                    <PackageOpen size={40} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.85rem' }}>No Image</span>
                  </div>
                )}
                
                {/* Floating Category Badge */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', color: '#15803d', border: '1px solid #dcfce7', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  {p.category}
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#111827', fontSize: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                  {p.name}
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 'normal', backgroundColor: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {p.variants ? p.variants.length : 0} Variants
                  </span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.2rem' }}>GST Levy</span>
                    <strong style={{ color: '#4b5563', fontSize: '0.9rem' }}>{p.gst_percentage}%</strong>
                  </div>
                </div>

                {/* Footer UI Bounds */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                  <Link to={`/products/${p.id}`} style={{ flexGrow: 1, textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '0.5rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <Eye size={16} /> View
                    </button>
                  </Link>

                  {role === 'owner' && (
                    <>
                      <Link to={`/products/edit/${p.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '0.5rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Edit Config">
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        style={{ padding: '0.5rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extrapolated Pagination Engine */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem', gap: '1rem' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: page === 1 ? '#f3f4f6' : '#ffffff', color: page === 1 ? '#9ca3af' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '600' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '500' }}>
             Showing page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: page === totalPages ? '#f3f4f6' : '#ffffff', color: page === totalPages ? '#9ca3af' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: '600' }}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default ProductList;
