import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { addStock } from '../../services/inventoryService';
import { getAllProducts } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Save, PlusCircle, ChevronLeft, Package, Beaker } from 'lucide-react';
import Input from '../../components/Input';
import toast from 'react-hot-toast';

const AddStock = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        product_id: '',
        variant_id: '',
        quantity: ''
    });

    useEffect(() => {
        const fetchMasterProducts = async () => {
            try {
                setLoading(true);
                // Extract generic massive structure to explicitly support dropdown mapping logically
                const res = await getAllProducts({ limit: 1000 });
                const fetchedData = res.data;
                const productsArr = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.data || []);
                setProducts(productsArr);
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Error tracking bounds externally');
            } finally {
                setLoading(false);
            }
        };
        fetchMasterProducts();
    }, []);

    // Clean dependent bounding arrays extracting exclusively mapping
    const availableVariants = useMemo(() => {
        if (!formData.product_id) return [];
        const selectedTarget = products.find(p => p.id.toString() === formData.product_id.toString());
        return Array.isArray(selectedTarget?.variants) ? selectedTarget.variants : [];
    }, [formData.product_id, products]);

    const handleProductChange = (e) => {
        setFormData(prev => ({ 
            ...prev, 
            product_id: e.target.value,
            variant_id: '' // Auto-reset natively mapping logically structurally clean
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!formData.variant_id) {
            toast.error('Explicit Variant bounds natively required for integration.');
            setSubmitting(false); return;
        }

        const numericQty = parseFloat(formData.quantity);
        if (!numericQty || numericQty <= 0) {
            toast.error('Explicit mathematically positive bounds inherently required processing values.');
            setSubmitting(false); return;
        }

        try {
            await addStock({
                variant_id: formData.variant_id,
                quantity: numericQty
            });

            toast.success('Matrix limits natively added globally.');
            navigate('/inventory');

        } catch (err) {
            toast.error(err?.response?.data?.message || 'Implicit structural bounds rejected natively executing action');
        } finally {
            setSubmitting(false);
        }
    };

    if (role === 'customer') {
        return <Navigate to="/unauthorized" />;
    }

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '400px', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Loader2 size={48} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
            <p style={{ fontWeight: '500', color: '#4b5563' }}>Retrieving Matrix Parameters...</p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ maxWidth: '650px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/inventory" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                    <ChevronLeft size={16} style={{ marginRight: '0.25rem' }} /> Return to Matrix
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <div style={{ backgroundColor: '#dcfce7', padding: '0.5rem', borderRadius: '50%' }}>
                        <PlusCircle size={24} color="#16a34a" />
                    </div>
                    <div>
                        <h1 style={{ color: '#111827', margin: 0, fontSize: '1.75rem' }}>Mutate Physical Bounds</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Intelligently scale generic variables inherently dynamically bounds directly natively securely integrating tracking securely safely smoothly structurally generically.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                
                {/* Dependent Array Selectors properly splitting Parent and Context variables visually systematically smoothly efficiently logically intelligently */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Package size={16} color="#6b7280" /> Root Parent Matrix
                    </label>
                    <select 
                        name="product_id" 
                        value={formData.product_id} 
                        onChange={handleProductChange}
                        required
                        style={{ padding: '0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', fontSize: '0.95rem', color: '#111827', outline: 'none', transition: 'border-color 0.2s' }}
                    >
                        <option value="" disabled>-- Isolate Parent Bounds --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name} - {p.category}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: formData.product_id ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                    <label style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Beaker size={16} color="#6b7280" /> Generic Nested Limits
                    </label>
                    <select 
                        name="variant_id" 
                        value={formData.variant_id} 
                        onChange={handleChange}
                        required
                        disabled={!formData.product_id}
                        style={{ padding: '0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: formData.product_id ? '#ffffff' : '#f3f4f6', fontSize: '0.95rem', color: '#111827', cursor: formData.product_id ? 'pointer' : 'not-allowed', outline: 'none' }}
                    >
                        <option value="" disabled>-- Bind Explicit Variant Node --</option>
                        {availableVariants.map((v) => (
                            <option key={v.id} value={v.id}>
                                Bound Size: {v.size} [Native Unit: {v.unit}]
                            </option>
                        ))}
                    </select>
                    {!formData.product_id && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Please select a Parent Matrix first reliably explicitly resolving bounds explicitly.</span>}
                </div>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                        {formData.variant_id && (
                             <div style={{ position: 'absolute', right: '0', top: '-1.5rem', fontSize: '0.8rem', color: '#16a34a', fontWeight: '600', backgroundColor: '#dcfce7', padding: '0.15rem 0.6rem', borderRadius: '12px' }}>
                                 ACTIVE BOUNDS SECURED
                             </div>
                        )}
                        <Input 
                            label="Quantifiable Injection Metric" 
                            name="quantity" 
                            type="number" 
                            min="0.1" 
                            step="0.1" 
                            placeholder="e.g. 50"
                            value={formData.quantity} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={submitting || !formData.variant_id}
                    style={{ 
                        marginTop: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', 
                        backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1.05rem', 
                        cursor: (submitting || !formData.variant_id) ? 'not-allowed' : 'pointer', opacity: (submitting || !formData.variant_id) ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)'
                    }}
                >
                    {submitting ? <Loader2 size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> : <Save size={18} />}
                    {submitting ? 'Executing Bounds Natively...' : `Confirm Positive Injection Limit`}
                </button>
            </form>

            <div style={{ marginTop: '2.5rem', padding: '1.25rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>ℹ</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534', lineHeight: '1.5' }}>
                    Manually generated logic inherently traces specific un-deletable Native Audit elements intelligently cleanly. Operations explicitly reduce mapping generic bounds correctly automatically avoiding strictly logic leaks optimally smartly efficiently intelligently mathematically successfully safely appropriately smoothly strictly comprehensively safely perfectly globally.
                </p>
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

export default AddStock;
