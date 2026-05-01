import { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      const fetchedData = res.data;
      setUsers(Array.isArray(fetchedData) ? fetchedData : (fetchedData?.data || []));
    } catch (err) {
      setError(err?.response?.data?.message || 'Error fetching users data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    setError('');
    setSuccess('');
    
    // Safety check prevent locking oneself out
    if (user.id === id) {
      setError("Action Denied: You cannot modify your own role instance.");
      return;
    }

    try {
      await api.put(`/users/${id}`, { role: newRole });
      setSuccess(`User role appropriately updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error updating user role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (user.id === id) {
      setError("Action Denied: You cannot delete your own account.");
      return;
    }
    
    if (!window.confirm("Are you critically sure you want to purge this user?")) return;

    setError('');
    setSuccess('');

    try {
      await api.delete(`/users/${id}`);
      setSuccess("User deleted strictly from systems.");
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error deleting targeted user');
    }
  };

  if (loading) return <div>Loading native users database...</div>;

  return (
    <div>
      <h1 style={{ color: '#166534', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>User Management Portal</h1>
      <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
        Owner-specific view for controlling global permissions and access parameters.
      </p>

      {error && <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>{error}</div>}
      {success && <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #4ade80' }}>{success}</div>}

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', color: '#374151', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: '1rem', color: '#374151', fontSize: '0.85rem', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '1rem', color: '#374151', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '1rem', color: '#374151', fontSize: '0.85rem', textTransform: 'uppercase' }}>Role Context</th>
              <th style={{ padding: '1rem', color: '#374151', fontSize: '0.85rem', textTransform: 'uppercase' }}>Purge</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(users) || users.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No Users detected in Database.</td></tr>
            ) : (
              Array.isArray(users) && users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem', color: '#111827' }}>#{u.id}</td>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>{u.name}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === user?.id} // Cannot alter self structurally
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        backgroundColor: u.id === user?.id ? '#f3f4f6' : '#ffffff',
                        cursor: u.id === user?.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="owner">Owner</option>
                      <option value="employee">Employee</option>
                      <option value="customer">Customer</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Button 
                      variant="primary" 
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user?.id} // Cannot delete self structurally
                      style={{ 
                        backgroundColor: '#ef4444', 
                        padding: '0.35rem 0.75rem', 
                        fontSize: '0.8rem',
                        opacity: u.id === user?.id ? 0.5 : 1,
                        cursor: u.id === user?.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
