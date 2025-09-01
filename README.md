# 🛒 Kandukuru Supermarket - E-Commerce Platform

A full-stack e-commerce platform built with React, Node.js, and MongoDB, featuring a modern admin panel, secure payment integration, and comprehensive cart management.

![Kandukuru Supermarket](https://img.shields.io/badge/React-19.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-orange)
![Payment](https://img.shields.io/badge/Payment-Razorpay-purple)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Payment Setup](#-payment-setup)
- [Cart Persistence](#-cart-persistence)
- [Admin Panel](#-admin-panel)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🛍️ Customer Features
- **Product Browsing**: Browse products by categories with search functionality
- **Shopping Cart**: Persistent cart with offline support and cross-device sync
- **User Authentication**: Secure login/register with JWT tokens
- **Payment Integration**: Razorpay payment gateway with test/live modes
- **Order Management**: Track orders and view order history
- **User Profile**: Manage personal information and change passwords
- **Feedback System**: Submit and view product feedback
- **Location Services**: Store and manage delivery locations

### 🎛️ Admin Features
- **Dashboard**: Analytics and overview of sales, orders, and products
- **Product Management**: Add, edit, and delete products with categories
- **Order Management**: Process and track customer orders
- **User Management**: View and manage customer accounts
- **Feedback Management**: Monitor and respond to customer feedback
- **Sales Analytics**: View sales reports and trends

### 🔧 Technical Features
- **Responsive Design**: Mobile-first approach with Bootstrap and Material-UI
- **Offline Support**: Cart persistence across browser sessions
- **Real-time Sync**: Cart synchronization between devices
- **Secure Payments**: Razorpay integration with webhook support
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance**: Optimized loading and caching strategies

## 🛠️ Tech Stack

### Frontend
- **React 19.0.0** - Modern UI library
- **React Router DOM** - Client-side routing
- **Material-UI** - Component library
- **Bootstrap** - CSS framework
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Slick** - Carousel component

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Razorpay** - Payment gateway
- **CORS** - Cross-origin resource sharing

### Admin Panel
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Day.js** - Date manipulation

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📁 Project Structure

```
kandukuru-supermarket/
├── frontend/                 # React customer application
│   ├── src/
│   │   ├── Components/      # Reusable UI components
│   │   ├── MyComponents/    # Main application components
│   │   │   ├── Body/       # Home page components
│   │   │   └── Header/     # Navigation and cart
│   │   ├── services/       # API services
│   │   └── Contexts/       # React contexts
│   └── public/             # Static assets
├── backend/                 # Node.js API server
│   ├── controllers/        # Request handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Custom middleware
│   ├── config/           # Configuration files
│   └── services/         # Business logic
├── adminpanel/            # Admin dashboard
│   └── admin/            # React admin application
│       ├── src/
│       │   ├── components/ # Admin components
│       │   └── pages/     # Admin pages
│       └── public/
└── docs/                  # Documentation
```

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud)
- **Razorpay Account** (for payments)
- **Git** (for version control)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kandukuru-supermarket.git
cd kandukuru-supermarket
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install admin panel dependencies
cd ../adminpanel/admin
npm install
```

### 3. Environment Setup

#### Backend Configuration
Create a `.env` file in the `backend` folder:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/kandukuru-supermarket

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET

# Server Configuration
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

#### Frontend Configuration
Create a `.env` file in the `frontend` folder:

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
REACT_APP_API_URL=http://localhost:5000
```

#### Admin Panel Configuration
Create a `.env` file in the `adminpanel/admin` folder:

```env
VITE_API_URL=http://localhost:5000
```

## ⚙️ Configuration

### MongoDB Setup

1. **Local MongoDB**:
   ```bash
   # Install MongoDB locally
   # Start MongoDB service
   mongod
   ```

2. **MongoDB Atlas** (Cloud):
   - Create account at [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a cluster
   - Get connection string
   - Update `MONGO_URI` in backend `.env`

### Razorpay Setup

1. **Create Razorpay Account**:
   - Sign up at [razorpay.com](https://razorpay.com)
   - Complete business verification

2. **Get API Keys**:
   - Go to Dashboard → Settings → API Keys
   - Generate new key pair
   - Update keys in environment files

3. **Test Mode**:
   - Use test keys starting with `rzp_test_`
   - Test with provided test cards

## 🚀 Usage

### Development Mode

#### Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

#### Start Frontend Application
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

#### Start Admin Panel
```bash
cd adminpanel/admin
npm run dev
# Admin panel runs on http://localhost:5173
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build admin panel
cd adminpanel/admin
npm run build
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove item from cart

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Payment Endpoints
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

## 💳 Payment Setup

### Razorpay Integration

The project includes a complete Razorpay payment system with:

- **Test Mode**: Use test cards for development
- **Live Mode**: Real payments for production
- **Webhook Support**: Payment verification
- **Error Handling**: Comprehensive error management

### Test Cards

Use these test cards for development:

**Credit/Debit Cards:**
- Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

**UPI:**
- Use any UPI ID for testing

For detailed payment setup instructions, see [PAYMENT_SETUP_README.md](./PAYMENT_SETUP_README.md)

## 🛒 Cart Persistence

The application features advanced cart persistence with:

- **Local Storage**: Cart persists across browser sessions
- **Server Sync**: Cart syncs with server for logged-in users
- **Offline Support**: Cart works without internet connection
- **Cross-Device**: Cart syncs across devices on login
- **Guest to User**: Local cart merges with server cart on login

For detailed cart implementation, see [CART_PERSISTENCE_README.md](./CART_PERSISTENCE_README.md)

## 🎛️ Admin Panel

### Features
- **Dashboard**: Sales analytics and overview
- **Product Management**: CRUD operations for products
- **Order Management**: Process and track orders
- **User Management**: View and manage customers
- **Feedback Management**: Monitor customer feedback

### Access
- URL: `http://localhost:5173`
- Default admin credentials (set up in database)
- Protected routes with authentication

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- **Email**: support@kandukuru-supermarket.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/kandukuru-supermarket/issues)
- **Documentation**: See the docs folder for detailed guides

## 🙏 Acknowledgments

- **Razorpay** for payment gateway integration
- **MongoDB** for database services
- **React Team** for the amazing framework
- **Material-UI** for beautiful components
- **Tailwind CSS** for utility-first styling

---

**Made with ❤️ for Kandukuru Supermarket**

*Last updated: December 2024* 