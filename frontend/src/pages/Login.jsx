import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { loginUser } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { Boxes } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const response = await loginUser(formData);
      login(response.data.user, response.data.token); // Save to global context
      if (response.data.user.role === 'customer') {
        navigate('/my-orders'); // Redirect customer to their orders page
      } else {
        navigate('/'); // Redirect to owner/employee dashboard
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '85vh',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic glow backdrops */}
      <div style={{ position: 'absolute', top: '15%', left: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0) 70%)', zIndex: 0, filter: 'blur(30px)' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, rgba(255, 255, 255, 0) 70%)', zIndex: 0, filter: 'blur(40px)' }} />

      <div className="glass-panel" style={{
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '460px',
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

        <h2 style={{ textAlign: 'center', color: '#0f172a', marginBottom: '0.5rem', marginTop: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Outfit', sans-serif" }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: '500', lineHeight: 1.5 }}>
          Login to your Hari Krupa Engineering account.<br/>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>(Hint: test@example.com / password)</span>
        </p>
        
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '0.85rem', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Email Address" 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="test@example.com" 
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
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.75rem', marginTop: '-0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#10b981', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#059669'} onMouseOut={e => e.target.style.color = '#10b981'}>Forgot password?</span>
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
            Sign In
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
          Don't have an account? <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
