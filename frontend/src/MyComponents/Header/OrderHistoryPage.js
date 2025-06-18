import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Chip,
  Paper,
  Alert,
  Stack
} from '@mui/material';
import { Home, ShoppingBag, CalendarToday, Payments, LocalShipping } from '@mui/icons-material';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(response.status === 401 ?
            'Please login to view your orders' :
            'Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'warning';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        {error.includes('login') && (
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            startIcon={<ShoppingBag />}
          >
            Go to Login
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Your Order History
      </Typography>

      {orders.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No orders yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Your order history will appear here once you make a purchase
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<Home />}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <List sx={{ width: '100%' }}>
          {orders.map((order) => (
            <Paper
              key={order._id}
              elevation={2}
              sx={{ mb: 3, p: 2, borderRadius: 2 }}
            >
              <ListItem alignItems="flex-start" disableGutters>
                <ListItemAvatar sx={{ mr: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ShoppingBag />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Order #{order._id.substring(0, 8).toUpperCase()}
                      </Typography>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </Stack>
                  }
                  secondary={
                    <>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <CalendarToday fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {formatDate(order.createdAt)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <Payments fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {order.paymentMethod}
                        </Typography>
                        {order.trackingNumber && (
                          <Typography variant="body2" color="text.secondary">
                            <LocalShipping fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {order.trackingNumber}
                          </Typography>
                        )}
                      </Stack>
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        ₹{order.totalAmount.toFixed(2)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/order-confirmation/${order._id}`)}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  View Details
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/')}
                  size="small"
                >
                  Buy Again
                </Button>
              </Box>
            </Paper>
          ))}
        </List>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          startIcon={<Home />}
          sx={{ px: 4 }}
        >
          Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default OrderHistoryPage;