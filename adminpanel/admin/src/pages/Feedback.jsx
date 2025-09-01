import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://shop-backend-92zc.onrender.com/api/feedback');
      setFeedbacks(res.data);
      setError(null);
    } catch {
      setError('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await axios.delete(`https://shop-backend-92zc.onrender.com/api/feedback/${id}`);
      setFeedbacks(feedbacks.filter(fb => fb._id !== id));
    } catch {
      alert('Failed to delete feedback');
    }
  };

  if (loading) return <div>Loading feedback...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Customer Feedback</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Order ID</th>
              <th>Message</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map(fb => (
              <tr key={fb._id} style={{ borderBottom: '1px solid #ccc' }}>
                <td>{fb.user}</td>
                <td>{fb.orderId}</td>
                <td>{fb.message}</td>
                <td>{new Date(fb.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDelete(fb._id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Feedback; 