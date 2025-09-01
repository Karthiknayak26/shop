import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import axios from 'axios';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeChart, setActiveChart] = useState('sales');
  const [notifications] = useState({ messages: 3, downloads: 2 });
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    try {
      const res = await axios.get('https://shop-backend-92zc.onrender.com/api/feedback');
      setFeedbacks(res.data);
      setFeedbackError(null);
    } catch {
      setFeedbackError('Failed to fetch feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/orders');
        setOrders(res.data); // ✅ No mock transformation
      } catch (err) {
        console.error(err);
        setOrders([]); // fallback to empty
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    fetchData();
    fetchFeedbacks();
  }, []);

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await axios.delete(`https://shop-backend-92zc.onrender.com/api/feedback/${id}`);
      setFeedbacks(feedbacks.filter(fb => fb._id !== id));
    } catch {
      alert('Failed to delete feedback');
    }
  };

  // Logout handler (should match App.jsx logic)
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    setShowProfileDropdown(false);
    navigate('/'); // Redirect to login
    window.location.reload(); // Force reload to reset state
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);


  // Enhanced chart data with more variety
  const chartData = orders.slice(0, 8).map((order, index) => ({
    name: `Order ${index + 1}`,
    amount: order.totalAmount || 0, // changed from totalPrice
    profit: Math.floor((order.totalAmount || 0) * 0.3), // changed from totalPrice
    date: order.date || `2024-06-${10 + index}`
  }));

  // Dynamic status color mapping
  const statusColors = {
    Delivered: '#10B981',
    Processing: '#3B82F6',
    Pending: '#F59E0B',
    'Out for Delivery': '#F472B6',
    Cancelled: '#EF4444'
  };

  // Count orders by status
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // Generate pieData dynamically
  const pieData = Object.entries(statusCounts).map(([status, value]) => ({
    name: status,
    value,
    color: statusColors[status] || '#A3A3A3'
  }));

  // Helper: Get revenue for a given month and year
  const getMonthlyRevenue = (month, year) => {
    return orders
      .filter(order => {
        const date = order.orderDate ? new Date(order.orderDate) : null;
        return (
          date &&
          date.getMonth() === month &&
          date.getFullYear() === year
        );
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0); // changed from totalPrice
  };

  // Generate areaData for the last 6 months
  const now = new Date();
  const areaData = Array.from({ length: 6 }).map((_, i) => {
    const date = dayjs(now).subtract(5 - i, 'month');
    const month = date.month();
    const year = date.year();
    const revenue = getMonthlyRevenue(month, year);
    const expenses = Math.round(revenue * 0.6); // 60% of revenue as expenses
    return {
      month: date.format('MMM'),
      revenue,
      expenses
    };
  });

  // Calculate current month's revenue for Monthly Revenue stat
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyRevenue = getMonthlyRevenue(currentMonth, currentYear);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  }, [searchQuery]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0); // changed from totalPrice
  };

  const getOrdersGrowth = () => {
    // Simulate growth calculation
    return 32.4;
  };

  const getSalesGrowth = () => {
    // Simulate growth calculation
    return -4.4;
  };

  const adminName = localStorage.getItem('adminName') || 'Admin';

  // Greeting function based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="loading-skeleton" style={{ height: '40px', borderRadius: '12px' }}></div>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div className="loading-skeleton" style={{ height: '200px', borderRadius: '24px', marginBottom: '2rem' }}></div>
          <div className="stats-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="loading-skeleton" style={{ height: '150px', borderRadius: '20px' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Enhanced Header */}
      <header className="dashboard-header fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search orders, customers, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="search-input"
            />
            <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="header-actions">
            <button className="action-button interactive-element" title="Downloads">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {notifications.downloads > 0 && <span className="notification-dot red"></span>}
            </button>

            <button className="action-button interactive-element" title="Messages">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {notifications.messages > 0 && <span className="notification-dot green"></span>}
            </button>

            <button className="action-button interactive-element" title="Settings">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <div
              className="user-avatar interactive-element"
              title="Profile"
              ref={profileRef}
              onClick={() => setShowProfileDropdown((prev) => !prev)}
              style={{ position: 'relative' }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {showProfileDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: 'white',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    borderRadius: '10px',
                    minWidth: '140px',
                    zIndex: 100,
                    padding: '0.5rem 0',
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      padding: '0.75rem 1.5rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '1rem',
                      borderRadius: '8px',
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: '1.5rem' }}>
        {/* Enhanced Welcome Section */}
        <div className="welcome-section slide-up">
          <div className="welcome-content">
            <h1 className="welcome-title">
              {getGreeting()},<br />
              {adminName}
            </h1>
            <p className="welcome-subtitle">
              Here's what's happening with your store today. Monitor your business performance in real-time.
            </p>
            <button
              onClick={() => navigate('/add-product')}
              className="add-product-btn interactive-element"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Product
            </button>
          </div>

          <div className="welcome-illustration">
            <svg viewBox="0 0 200 150" fill="none">
              <rect x="20" y="20" width="160" height="110" rx="20" fill="rgba(255,255,255,0.2)" />
              <rect x="40" y="40" width="30" height="30" rx="8" fill="rgba(59,130,246,0.8)" />
              <rect x="80" y="40" width="30" height="30" rx="8" fill="rgba(16,185,129,0.8)" />
              <rect x="120" y="40" width="30" height="30" rx="8" fill="rgba(245,158,11,0.8)" />
              <rect x="40" y="80" width="110" height="8" rx="4" fill="rgba(255,255,255,0.4)" />
              <rect x="40" y="95" width="80" height="8" rx="4" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card slide-up interactive-element">
            <div className="stat-header">
              <div className="stat-info">
                <div className="stat-icon blue">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="stat-details">
                  <h3>New Orders</h3>
                  <p>{orders.length}</p>
                </div>
              </div>
              <div className="stat-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0, 6)}>
                    <Bar dataKey="amount" fill="#3B82F6" radius={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="stat-trend">
              <svg width="16" height="16" className={getOrdersGrowth() > 0 ? "trend-positive" : "trend-negative"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getOrdersGrowth() > 0 ? "M7 17l9.2-9.2M17 17V7H7" : "M17 17l-9.2-9.2M7 17V7h10"} />
              </svg>
              <span className={`trend-percentage ${getOrdersGrowth() > 0 ? "trend-positive" : "trend-negative"}`}>
                {getOrdersGrowth() > 0 ? "+" : ""}{getOrdersGrowth()}%
              </span>
              <span className="trend-description">vs last month</span>
            </div>
          </div>

          <div className="stat-card slide-up interactive-element">
            <div className="stat-header">
              <div className="stat-info">
                <div className="stat-icon green">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="stat-details">
                  <h3>Total Sales</h3>
                  <p>{formatCurrency(getTotalRevenue())}</p>
                </div>
              </div>
              <div className="stat-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.slice(0, 6)}>
                    <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="stat-trend">
              <svg width="16" height="16" className={getSalesGrowth() > 0 ? "trend-positive" : "trend-negative"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getSalesGrowth() > 0 ? "M7 17l9.2-9.2M17 17V7H7" : "M17 17l-9.2-9.2M7 17V7h10"} />
              </svg>
              <span className={`trend-percentage ${getSalesGrowth() > 0 ? "trend-positive" : "trend-negative"}`}>
                {getSalesGrowth() > 0 ? "+" : ""}{getSalesGrowth()}%
              </span>
              <span className="trend-description">vs last month</span>
            </div>
          </div>

          <div className="stat-card slide-up interactive-element">
            <div className="stat-header">
              <div className="stat-info">
                <div className="stat-icon purple">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="stat-details">
                  <h3>Monthly Revenue</h3>
                  <p>{formatCurrency(monthlyRevenue)}</p>
                </div>
              </div>
              <div className="stat-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData.slice(-4)}>
                    <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="stat-trend">
              <svg width="16" height="16" className="trend-positive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span className="trend-percentage trend-positive">+18.2%</span>
              <span className="trend-description">vs last month</span>
            </div>
          </div>

          <div className="stat-card slide-up interactive-element">
            <div className="stat-header">
              <div className="stat-info">
                <div className="stat-icon orange">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="stat-details">
                  <h3>Active Customers</h3>
                  <p>
                    {orders.reduce((count, order) => {
                      const customerId = order.shippingAddress?.email || order.shippingAddress?.phone;
                      return customerId ? count + 1 : count;
                    }, 0)}
                  </p>
                </div>
              </div>
              <div className="stat-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: 'Mon', customers: 12 },
                      { day: 'Tue', customers: 19 },
                      { day: 'Wed', customers: 15 },
                      { day: 'Thu', customers: 22 },
                      { day: 'Fri', customers: 18 },
                      { day: 'Sat', customers: 25 },
                      { day: 'Sun', customers: 20 }
                    ]}
                  >
                    <Bar dataKey="customers" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="stat-trend">
              <svg width="16" height="16" className="trend-positive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span className="trend-percentage trend-positive">+12.8%</span>
              <span className="trend-description">vs last week</span>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="charts-grid">
          <div className="chart-card fade-in">
            <div className="chart-title">
              <span>Sales Performance</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`action-button ${activeChart === 'sales' ? 'active' : ''}`}
                  onClick={() => setActiveChart('sales')}
                  style={{
                    background: activeChart === 'sales' ? '#3B82F6' : 'transparent',
                    color: activeChart === 'sales' ? 'white' : '#6B7280',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem'
                  }}
                >
                  Sales
                </button>
                <button
                  className={`action-button ${activeChart === 'profit' ? 'active' : ''}`}
                  onClick={() => setActiveChart('profit')}
                  style={{
                    background: activeChart === 'profit' ? '#10B981' : 'transparent',
                    color: activeChart === 'profit' ? 'white' : '#6B7280',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem'
                  }}
                >
                  Profit
                </button>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [formatCurrency(value), activeChart === 'sales' ? 'Sales' : 'Profit']}
                  />
                  <Bar
                    dataKey={activeChart === 'sales' ? 'amount' : 'profit'}
                    fill={activeChart === 'sales' ? '#3B82F6' : '#10B981'}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card fade-in">
            <div className="chart-title">
              <span>Order Status Distribution</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{
                  background: 'transparent',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  color: '#6B7280'
                }}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                {pieData.map((entry, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: entry.color,
                        borderRadius: '50%'
                      }}
                    ></div>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card fade-in chart-card-full-width">
            <div className="chart-title">
              <span>Revenue vs Expenses Trend</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', background: '#3B82F6', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Revenue</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', background: '#EF4444', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Expenses</span>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>


        {/* Recent Orders Table Section */}
        <div className="chart-card fade-in" style={{ marginTop: '1.5rem' }}>
          <div className="chart-title">
            <span>Recent Orders</span>
            <button
              className="action-button"
              onClick={() => navigate('/orders')}
              style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
            >
              View All Orders
            </button>
          </div>
          <div className="table-container">
            <table className={`recent-orders-table ${isLoading ? 'loading' : ''}`}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Shipping Address</th>
                  <th>Items (Quantity)</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-lg font-medium">No orders found</span>
                        <span className="text-sm">Orders will appear here once they are placed</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <React.Fragment key={order._id}>
                      <tr
                        tabIndex={0}
                        role="button"
                        aria-label={`Order ${order._id.substring(0, 8)} - ${order.shippingAddress?.name || 'Unknown Customer'}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            // Navigate to order details or expand row
                            navigate(`/orders`);
                          }
                        }}
                        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <td className="order-id">
                          {order._id.substring(0, 8)}...
                        </td>
                        <td className="customer-name">
                          {order.shippingAddress?.name || 'N/A'}
                        </td>
                        <td className="shipping-address">
                          {order.shippingAddress ? (
                            <>
                              <div className="address-line">{order.shippingAddress.address}</div>
                              <div className="address-line">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                              <div className="contact-info">Phone: {order.shippingAddress.phone}</div>
                              <div className="contact-info">Email: {order.shippingAddress.email}</div>
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="items-list">
                          {order.items?.slice(0, 2).map(item => (
                            <div key={item.id} className="item-row">
                              <span className="item-name">{item.name}</span>
                              <span className="item-quantity">x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div className="more-items">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </td>
                        <td className="amount">
                          ₹{order.totalAmount}
                        </td>
                        <td>
                          <span
                            className={`status ${order.status === 'Delivered' ? 'delivered' :
                              order.status === 'Processing' ? 'processing' : 'pending'
                              }`}
                            role="status"
                            aria-label={`Order status: ${order.status || 'Pending'}`}
                          >
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="order-date">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Container Section */}
        <div className="chart-card fade-in" style={{ marginTop: '1.5rem' }}>
          <div className="chart-title">
            <span>Recent Customer Feedback</span>
          </div>
          {feedbackLoading ? (
            <div>Loading feedback...</div>
          ) : feedbackError ? (
            <div style={{ color: 'red' }}>{feedbackError}</div>
          ) : feedbacks.length === 0 ? (
            <p>No feedback found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.slice(0, 5).map(fb => (
                  <tr key={fb._id} style={{ borderBottom: '1px solid #ccc' }}>
                    <td>{fb.name}</td>
                    <td>{fb.email}</td>
                    <td>{fb.message}</td>
                    <td>{new Date(fb.createdAt).toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleDeleteFeedback(fb._id)} style={{ color: 'red' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;