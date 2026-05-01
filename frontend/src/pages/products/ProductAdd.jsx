import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProduct } from '../../services/productService';
import { Plus, Save, X, UploadCloud, ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/Input';

const ProductAdd = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [productData, setProductData] = useState({
    name: '',
    category: '',
    gst_percentage: 0
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [variants, setVariants] = useState([
    { size: '', quantity: 0, unit: 'KGS', price: 0 }
  ]);

  // Clean up object URLs securely to avoid native memory leak structures
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariantRow = () => {
    setVariants([...variants, { size: '', quantity: 0, unit: 'KGS', price: 0 }]);
  };

  const removeVariantRow = (index) => {
    if (variants.length === 1) {
      toast.error('Products strictly dictate minimum 1 variant configurations globally.');
      return; 
    }
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, and PNG objects structurally supported natively.');
        return;
      }

      // Strict structural 5MB client mapping evaluation
      if (file.size > 2 * 1024 * 1024) { // Matching backend 2MB bounds
        toast.error('Image mapping inherently exceeds 2MB ceiling rules natively.');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Generate dynamic ObjectURL natively
    }
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!productData.name || !productData.category) {
      toast.error('Core metrics (Name and Category) natively required.');
      setLoading(false);
      return;
    }

    const sizeSet = new Set();
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.size) {
        toast.error(`Variant row #${i + 1} size definitions internally blank.`);
        setLoading(false); return;
      }
      
      const normSize = v.size.toString().toLowerCase().trim();
      if (sizeSet.has(normSize)) {
        toast.error(`Duplicate variant configuration structurally denied: ${v.size} (Row #${i + 1}). Unique sizes explicitly required natively.`);
        setLoading(false); return;
      }
      sizeSet.add(normSize);

      if (v.quantity <= 0) {
        toast.error(`Variant row #${i + 1} quantity mathematically dictates quantities strictly greater than zero.`);
        setLoading(false); return;
      }
      if (v.price <= 0) {
        toast.error(`Variant row #${i + 1} explicit pricing must evaluate functionally greater than zero.`);
        setLoading(false); return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('category', productData.category);
      formData.append('gst_percentage', productData.gst_percentage);
      formData.append('variants', JSON.stringify(variants));

      if (imageFile) formData.append('image', imageFile);

      await createProduct(formData);
      toast.success('Matrix effectively mapped new Product Configuration!');
      navigate('/products'); 

    } catch (err) {
      toast.error(err?.response?.data?.message || 'Submission mapping faults inherently detected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
            <ChevronLeft size={16} style={{ marginRight: '0.25rem' }} /> Back to Catalog
          </Link>
          <h1 style={{ color: '#111827', margin: 0, fontSize: '1.75rem' }}>Create Product Config</h1>
        </div>
        
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
            backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', 
            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', 
            opacity: loading ? 0.7 : 1, transition: 'background-color 0.2s',
            boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)'
          }}
        >
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> : <Save size={18} />}
          {loading ? 'Committing...' : 'Store Native Product'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Content Pane mapping */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Core Basic Config Container */}
            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#374151', fontSize: '1.1rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                Identity Bounds
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Input label="System Product Name" name="name" placeholder="e.g. Forged Steel Component" value={productData.name} onChange={handleProductChange} required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <Input label="Category Classification" name="category" placeholder="Hardware" value={productData.category} onChange={handleProductChange} required />
                  <Input label="GST Levy (%)" name="gst_percentage" type="number" step="0.01" value={productData.gst_percentage} onChange={handleProductChange} />
                </div>
              </div>
            </div>

            {/* Dynamics Variants Section */}
            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, color: '#374151', fontSize: '1.1rem', fontWeight: '600' }}>Variant Configurations</h3>
                <button type="button" onClick={addVariantRow} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  <Plus size={16} /> Append Dimension
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {variants.map((variant, index) => (
                  <div key={index} style={{ 
                    display: 'grid', gridTemplateColumns: 'minmax(150px, 2fr) 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end',
                    backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '24px', height: '24px', backgroundColor: '#e2e8f0', color: '#64748b', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {index + 1}
                    </div>
                    
                    <Input label="Dimensions/Size" placeholder="165x224x35" value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} required />
                    <Input label="Quantity Config" type="number" step="0.1" min="0.1" value={variant.quantity} onChange={(e) => handleVariantChange(index, 'quantity', parseFloat(e.target.value))} required />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ color: '#4b5563', fontSize: '0.8rem', fontWeight: '600' }}>Measurement</label>
                      <select value={variant.unit} onChange={(e) => handleVariantChange(index, 'unit', e.target.value)} style={{ padding: '0.675rem', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#ffffff', width: '100%', fontSize: '0.9rem' }}>
                        <option value="KGS">KGS</option>
                        <option value="PCS">PCS</option>
                        <option value="Liters">Liters</option>
                        <option value="Meters">Meters</option>
                      </select>
                    </div>

                    <Input label="Net Price Matrix" type="number" step="0.01" min="0.01" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value))} required />

                    <button type="button" onClick={() => removeVariantRow(index)} disabled={variants.length === 1} style={{ 
                        padding: '0.675rem', borderRadius: '6px', border: '1px solid',
                        backgroundColor: variants.length === 1 ? '#f1f5f9' : '#fee2e2',
                        color: variants.length === 1 ? '#cbd5e1' : '#ef4444',
                        borderColor: variants.length === 1 ? '#e2e8f0' : '#fca5a5',
                        cursor: variants.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }} title="Delete Row Mapping">
                      <Trash2 size={16} /> {/* Generic Trash icon mapped strictly replacing explicit text X */}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Side Content Pane (Media bounds) */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', alignSelf: 'start' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#374151', fontSize: '1.1rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
              Media Structural Elements
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {imagePreview ? (
                <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <img src={imagePreview} alt="Image Active Structure Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={clearImageSelection} style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  width: '100%', height: '180px', border: '2px dashed #d1d5db', borderRadius: '8px', 
                  backgroundColor: '#f9fafb', cursor: 'pointer', transition: 'border-color 0.2s, background-color 0.2s',
                  padding: '1rem', textAlign: 'center'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                >
                  <UploadCloud size={40} color="#9ca3af" style={{ marginBottom: '0.75rem' }} />
                  <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '500', marginBottom: '0.25rem' }}>Click internally to browse</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>JPG, PNG (Max 2MB bounds natively)</span>
                  <input type="file" ref={fileInputRef} accept=".jpg,.jpeg,.png" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>
        </div>

      </form>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// Assuming lucide-react Trash2 maps directly implicitly natively in component logic bounding array
import { Trash2 } from 'lucide-react';
export default ProductAdd;
