/**
 * Admin users seed data for Kandukuru Supermarket
 */

module.exports = [
  {
    username: 'superadmin',
    email: 'admin@kandukuru-supermarket.com',
    password: 'Admin@123456', // Will be hashed during seeding
    fullName: 'Super Administrator',
    role: 'super_admin',
    permissions: {
      products: { create: true, read: true, update: true, delete: true },
      orders: { read: true, update: true, delete: true },
      users: { read: true, update: true, delete: true },
      categories: { create: true, read: true, update: true, delete: true },
      analytics: { read: true },
      settings: { read: true, update: true }
    },
    isActive: true,
    phone: '+91-9876543210',
    address: {
      street: 'Kandukuru Main Road',
      city: 'Kandukuru',
      state: 'Andhra Pradesh',
      pincode: '518123'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: true
      }
    }
  },
  {
    username: 'storemanager',
    email: 'manager@kandukuru-supermarket.com',
    password: 'Manager@123', // Will be hashed during seeding
    fullName: 'Store Manager',
    role: 'manager',
    permissions: {
      products: { create: true, read: true, update: true, delete: false },
      orders: { read: true, update: true, delete: false },
      users: { read: true, update: false, delete: false },
      categories: { create: true, read: true, update: true, delete: false },
      analytics: { read: true },
      settings: { read: true, update: false }
    },
    isActive: true,
    phone: '+91-9876543211',
    address: {
      street: 'Near Market Area',
      city: 'Kandukuru',
      state: 'Andhra Pradesh',
      pincode: '518123'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  },
  {
    username: 'cashier',
    email: 'cashier@kandukuru-supermarket.com',
    password: 'Cashier@123', // Will be hashed during seeding
    fullName: 'Store Cashier',
    role: 'staff',
    permissions: {
      products: { create: false, read: true, update: true, delete: false },
      orders: { read: true, update: true, delete: false },
      users: { read: true, update: false, delete: false },
      categories: { create: false, read: true, update: false, delete: false },
      analytics: { read: false },
      settings: { read: false, update: false }
    },
    isActive: true,
    phone: '+91-9876543212',
    address: {
      street: 'Kandukuru Village',
      city: 'Kandukuru',
      state: 'Andhra Pradesh',
      pincode: '518123'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        sms: false
      }
    }
  }
];
