import { Link } from 'react-router-dom';
import Button from '../components/Button';

const Unauthorized = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '3rem',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#b91c1c', fontSize: '2.5rem', marginBottom: '1rem', marginTop: 0 }}>403 Access Denied</h1>
        <p style={{ color: '#4b5563', marginBottom: '2rem', fontSize: '1.1rem' }}>
          You do not have the required permissions to view this page. Reach out to an administrator if you believe this is an error.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
