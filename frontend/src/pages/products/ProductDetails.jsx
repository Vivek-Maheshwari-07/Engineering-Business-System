import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import { ChevronLeft, Loader2, PackageOpen, Layers, Coins, Scale, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecificTarget = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        const fetchedData = res.data;
        setProduct(fetchedData?.data || fetchedData);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Error fetching nested structured dataset');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecificTarget();
  }, [id]);

  if (loading) return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
        <Loader2 size={48} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
        <p style={{ fontWeight: '500', color: '#4b5563' }}>Loading Structural Matrix...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
  );

  if (!product) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', color: '#9ca3af' }}>
      <PackageOpen size={64} style={{ marginBottom: '1rem' }} />
      <h2 style={{ color: '#374151', margin: '0 0 0.5rem 0' }}>Matrix Not Found</h2>
      <p>The explicit entity requested does not internally map into your database structures.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
      
      {/* Header Array Context */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '500', transition: 'color 0.2s' }}>
          <ChevronLeft size={16} style={{ marginRight: '0.25rem' }} /> Back to Master Catalog
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
            <div>
                <h1 style={{ color: '#111827', margin: '0 0 0.25rem 0', fontSize: '2rem' }}>
                    {product.name}
                </h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600' }}>
                    {product.category} Framework
                </span>
            </div>
            
            <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Database Native ID</p>
                <code style={{ backgroundColor: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '1rem', color: '#374151', fontWeight: 'bold' }}>
                    #{product.id}
                </code>
            </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Core Layout Data (Left) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: '#e5e7eb' }}>
                    
                    <div style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderTopLeftRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                            <Layers size={18} />
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>GST Base Scale</span>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{product.gst_percentage}%</span>
                    </div>

                    <div style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderTopRightRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                            <Hash size={18} />
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}>Total Variant Matrix</span>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{product.variants ? product.variants.length : 0} Bounds</span>
                    </div>

                </div>
            </div>

            {/* Variants Nested Table Bounds */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PackageOpen size={18} color="#16a34a" /> Target Properties & Variations
                    </h3>
                </div>
            
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#ffffff' }}>Scale Dimension</th>
                            <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#ffffff' }}>Extrapolated Quantity</th>
                            <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', backgroundColor: '#ffffff' }}>Internal Baseline Pricing</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(product.variants) && product.variants.length > 0 ? (
                            product.variants.map((v) => (
                            <tr key={v.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: '500' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Scale size={14} color="#9ca3af" /> {v.size}</div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: '#4b5563' }}>
                                    {v.quantity} <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginLeft: '0.2rem' }}>{v.unit}</span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: '#16a34a', fontWeight: '700' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Coins size={14} /> ₹{v.price.toLocaleString('en-IN')}</div>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                    No parameters linked directly.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Media Block (Right) */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase' }}>Visual Representation</h3>
            <div style={{ width: '100%', height: '300px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {product.image_url ? (
                    <img src={`${API_URL}${product.image_url}`} alt="Product Representation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#d1d5db' }}>
                        <PackageOpen size={64} style={{ marginBottom: '1rem' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Asset Structurally Null</span>
                    </div>
                )}
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#6b7280' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>System Created At:</strong> {new Date(product.created_at).toLocaleString()}</p>
                <p style={{ margin: 0 }}><strong>Record Status:</strong> Active Node Bound</p>
            </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
