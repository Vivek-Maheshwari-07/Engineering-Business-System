import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { registerUser } from '../services/auth';
import { Boxes } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerUser(formData);
      // Simulating passing the email to the next page
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '90vh',
      padding: '2.4rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient glowing backdrops */}
      <div style={{ position: 'absolute', top: '10%', right: '15%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, rgba(255, 255, 255, 0) 70%)', zIndex: 0, filter: 'blur(30px)' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '15%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 0) 70%)', zIndex: 0, filter: 'blur(40px)' }} />

      <div className="glass-panel" style={{
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.8)'
      }}>
        {/* Logo Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)' }}>
            <Boxes color="#ffffff" size={24} />
          </div>
        </div>

        <h2 style={{ textAlign: 'center', color: '#0f172a', marginBottom: '0.5rem', marginTop: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Outfit', sans-serif" }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2.2rem', fontSize: '0.9rem', fontWeight: '500' }}>Get started with Hari Krupa Engineering ERP.</p>
        
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '0.85rem', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Full Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="John Doe" 
            required 
          />
          <Input 
            label="Email Address" 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="john@example.com" 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="••••••••" 
            required 
          />
          
          <div style={{ marginBottom: '1.75rem', width: '100%' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>
              Choose Portal Access <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                outline: 'none',
                fontSize: '0.95rem',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              required
            >
              <option value="Owner">Owner</option>
              <option value="Employee">Employee</option>
              <option value="Customer">Customer</option>
            </select>
          </div>

          <Button 
            type="submit" 
            loading={loading} 
            variant="primary" 
            style={{ 
              borderRadius: '12px', 
              padding: '0.85rem', 
              fontWeight: '600', 
              backgroundColor: 'var(--color-primary)', 
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            Create Account
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
          Already have an account? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
