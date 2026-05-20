import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Search } from 'lucide-react';
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
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      height: '70px',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(15, 23, 42, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Sleek Dribbble SaaS mock search bar in the left/center */}
      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        {user && (
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex', alignItems: 'center' }}>
              <Search size={15} />
            </span>
            <input 
              type="text" 
              placeholder="Search features..." 
              style={{
                width: '100%',
                padding: '0.45rem 1rem 0.45rem 2.2rem',
                borderRadius: '99px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                fontSize: '0.85rem',
                outline: 'none',
                backgroundColor: '#f1f5f9',
                color: 'var(--color-black)',
                transition: 'all 0.25s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(15, 23, 42, 0.08)';
                e.target.style.backgroundColor = '#f1f5f9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          {/* User Profile Info Structure */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '1.25rem', borderRight: '1px solid rgba(15, 23, 42, 0.08)' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #a7f3d0 0%, #10b981 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)' }}>
              <User size={18} color="#ffffff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-black)', fontWeight: '600' }}>{user.name}</span>
              <span style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>{role}</span>
            </div>
          </div>

          <Button 
            onClick={handleLogout} 
            variant="danger" 
            style={{ 
              padding: '0.45rem 1rem', 
              fontSize: '0.8rem', 
              gap: '0.4rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              boxShadow: 'none'
            }}
            className="navbar-logout-btn"
          >
            <LogOut size={14} />
            Sign Out
          </Button>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
