import React, { useState } from 'react';
import { useUser } from './Header/UserContext';

const ProfileChangePassword = () => {
  const { user } = useUser();
  const userId = user?.user?.id;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Failed to change password.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label><strong>Current Password:</strong></label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label><strong>New Password:</strong></label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label><strong>Confirm New Password:</strong></label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 10, borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Saving...' : 'Change Password'}
        </button>
        {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
};

export default ProfileChangePassword; 