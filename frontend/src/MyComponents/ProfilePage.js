import React, { useState } from 'react';
import { useUser } from './Header/UserContext';

const ProfilePage = () => {
  const { user, updateUser } = useUser();
  const userData = user?.user || {};
  const [name, setName] = useState(userData.name || '');
  const [email, setEmail] = useState(userData.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const response = await fetch(`/api/auth/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (response.ok) {
        updateUser(data.user); // Update context
        setSuccess('Profile updated successfully!');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>My Profile</h2>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: 16 }}>
          <label><strong>Name:</strong></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label><strong>Email:</strong></label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>User ID:</strong> <span>{userData.id}</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10, borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
};

export default ProfilePage; 