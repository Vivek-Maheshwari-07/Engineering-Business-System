import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import Button from './Button';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      height: '70px',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      borderBottom: '1px solid #e5e7eb',
    }}>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* User Profile Info Structure */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '1.5rem', borderRight: '1px solid #e5e7eb' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="#15803d" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', color: '#111827', fontWeight: '600' }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>{role}</span>
            </div>
          </div>

          <Button 
            onClick={handleLogout} 
            variant="outline" 
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              borderColor: '#fca5a5',
              color: '#ef4444',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </Button>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
