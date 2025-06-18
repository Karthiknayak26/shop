import React, { useEffect, useState, useCallback } from 'react';
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

// Enhanced mock data with more realistic information
const mockOrders = [
  { _id: '1', customerName: 'John Doe', totalPrice: 1250, status: 'Delivered', date: '2024-06-10' },
  { _id: '2', customerName: 'Jane Smith', totalPrice: 890, status: 'Pending', date: '2024-06-12' },
  { _id: '3', customerName: 'Mike Johnson', totalPrice: 2100, status: 'Processing', date: '2024-06-11' },
  { _id: '4', customerName: 'Sarah Wilson', totalPrice: 1560, status: 'Delivered', date: '2024-06-09' },
  { _id: '5', customerName: 'Tom Brown', totalPrice: 780, status: 'Pending', date: '2024-06-13' },
  { _id: '6', customerName: 'Lisa Davis', totalPrice: 1890, status: 'Delivered', date: '2024-06-08' },
  { _id: '7', customerName: 'Alex Chen', totalPrice: 3200, status: 'Processing', date: '2024-06-14' },
  { _id: '8', customerName: 'Maria Garcia', totalPrice: 950, status: 'Delivered', date: '2024-06-07' }
];

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeChart, setActiveChart] = useState('sales');
  const [notifications] = useState({ messages: 3, downloads: 2 });
  const navigate = useNavigate();

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
  }, []);


  // Enhanced chart data with more variety
  const chartData = orders.slice(0, 8).map((order, index) => ({
    name: `Order ${index + 1}`,
    amount: order.totalPrice || 0,
    profit: Math.floor((order.totalPrice || 0) * 0.3),
    date: order.date || `2024-06-${10 + index}`
  }));

  const pieData = [
    { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, color: '#10B981' },
    { name: 'Processing', value: orders.filter(o => o.status === 'Processing').length, color: '#3B82F6' },
    { name: 'Pending', value: orders.filter(o => o.status === 'Pending').length, color: '#F59E0B' }
  ];

  const areaData = [
    { month: 'Jan', revenue: 12000, expenses: 8000 },
    { month: 'Feb', revenue: 15000, expenses: 9500 },
    { month: 'Mar', revenue: 18000, expenses: 11000 },
    { month: 'Apr', revenue: 22000, expenses: 13500 },
    { month: 'May', revenue: 25000, expenses: 15000 },
    { month: 'Jun', revenue: 28000, expenses: 16500 }
  ];

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
    return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  };

  const getOrdersGrowth = () => {
    // Simulate growth calculation
    return 32.4;
  };

  const getSalesGrowth = () => {
    // Simulate growth calculation
    return -4.4;
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

            <div className="user-avatar interactive-element" title="Profile">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: '1.5rem' }}>
        {/* Enhanced Welcome Section */}
        <div className="welcome-section slide-up">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Good Morning,<br />
              Cameron 👋
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
                  <p>{formatCurrency(getTotalRevenue() * 0.8)}</p>
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

          <div className="chart-card fade-in" style={{ gridColumn: 'span 2' }}>
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


        // In the recent orders table section, replace the existing table with this:

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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Order ID</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Shipping Address</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Items (Quantity)</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <React.Fragment key={order._id}>
                    <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.75rem', color: '#111827', fontSize: '0.875rem' }}>
                        {order._id.substring(0, 8)}...
                      </td>
                      <td style={{ padding: '0.75rem', color: '#111827', fontSize: '0.875rem' }}>
                        {order.shippingAddress?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#111827', fontSize: '0.875rem' }}>
                        <div style={{ maxWidth: '200px', lineHeight: '1.4' }}>
                          {order.shippingAddress ? (
                            <>
                              <div>{order.shippingAddress.address}</div>
                              <div>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                              <div>Phone: {order.shippingAddress.phone}</div>
                              <div>Email: {order.shippingAddress.email}</div>
                            </>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#111827', fontSize: '0.875rem' }}>
                        <div style={{ maxWidth: '250px' }}>
                          {order.items?.slice(0, 2).map(item => (
                            <div key={item.id} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{item.name}</span>
                              <span style={{ fontWeight: '600', marginLeft: '8px' }}>x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#111827', fontSize: '0.875rem', fontWeight: '600' }}>
                        ₹{order.totalAmount}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            background: order.status === 'Delivered' ? '#D1FAE5' :
                              order.status === 'Processing' ? '#DBEAFE' : '#FEF3C7',
                            color: order.status === 'Delivered' ? '#065F46' :
                              order.status === 'Processing' ? '#1E40AF' : '#92400E'
                          }}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6B7280', fontSize: '0.875rem' }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;