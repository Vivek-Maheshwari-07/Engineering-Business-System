import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { verifyOTP, resendOTP } from '../services/auth';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await verifyOTP({ email, otp });
      setSuccess('Account verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    try {
      await resendOTP(email);
      setSuccess('A new OTP has been sent to your email.');
    } catch (err) {
      setError('Failed to resend OTP. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#166534', marginBottom: '1rem', marginTop: 0 }}>Verify Email</h2>
        <p style={{ textAlign: 'center', color: '#4b5563', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Please enter the 6-digit One Time Password sent to <br />
          <strong style={{ color: '#1f2937' }}>{email}</strong>
          <br/>
          (Hint: Try '123456')
        </p>
        
        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f87171' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #86efac' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="One Time Password (OTP)" 
            type="text" 
            name="otp" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            placeholder="Enter 6-digit OTP" 
            required 
          />

          <Button type="submit" loading={loading} variant="primary" style={{ marginTop: '0.5rem' }}>
            Verify Account
          </Button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '0.5rem' }}>Didn't receive the code?</p>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleResend} 
            loading={resending}
          >
            Resend OTP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
