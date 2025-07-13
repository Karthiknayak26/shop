# Cart Persistence Implementation

## Overview

This implementation provides comprehensive cart data persistence across refresh, logout, and network disconnection scenarios. The solution uses a hybrid approach combining localStorage for immediate persistence and backend synchronization for cross-device access.

## Features

### ✅ Persistence Scenarios Handled

1. **Page Refresh**: Cart data persists using localStorage
2. **Browser Close/Reopen**: Cart data automatically loads from localStorage
3. **Logout/Login**: Cart data syncs between local and server storage
4. **Network Disconnection**: Cart continues to work offline with local storage
5. **Cross-Device Sync**: Cart data syncs across devices when user logs in
6. **Guest to User Conversion**: Local cart merges with server cart on login

### 🔧 Technical Implementation

#### Backend Components

1. **Cart Model** (`backend/models/cartModel.js`)
   - MongoDB schema with user association
   - Automatic total price and item count calculation
   - Product reference with embedded cart items

2. **Cart Controller** (`backend/controllers/cartController.js`)
   - CRUD operations for cart management
   - Cart synchronization for guest users
   - Product validation and error handling

3. **Cart Routes** (`backend/routes/cartRoutes.js`)
   - RESTful API endpoints
   - Authentication middleware protection
   - Proper HTTP status codes

#### Frontend Components

1. **Enhanced CartContext** (`frontend/src/MyComponents/Header/CartContext.js`)
   - localStorage persistence
   - Backend synchronization
   - Offline-first approach
   - Automatic sync on login

2. **API Service** (`frontend/src/services/api.js`)
   - Axios interceptors for authentication
   - Error handling and retry logic
   - Cart-specific API methods

3. **User Context** (`frontend/src/MyComponents/Header/UserContext.js`)
   - User authentication state management
   - localStorage persistence for user data
   - Automatic token management

4. **UI Components**
   - **CartSyncIndicator**: Shows sync status and allows manual sync
   - **NetworkStatus**: Displays offline status
   - **Enhanced CartPage**: Shows sync status and guest user prompts

## Usage

### For Users

1. **Guest Users**: Cart data persists locally across browser sessions
2. **Logged-in Users**: Cart syncs automatically with server
3. **Offline Mode**: Cart continues to work with local storage
4. **Cross-Device**: Login to sync cart across devices

### For Developers

#### Adding Items to Cart
```javascript
const { addToCart } = useCart();
addToCart(product); // Automatically handles local + server sync
```

#### Checking Cart Status
```javascript
const { cartItems, isLoading, isSynced } = useCart();
const { user } = useUser();

// Check if user is logged in
if (user) {
  // Cart will sync with server
} else {
  // Cart works locally only
}
```

#### Manual Sync
```javascript
const { forceSync } = useCart();
await forceSync(); // Force sync with server
```

## API Endpoints

### Cart Operations
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart
- `POST /api/cart/sync` - Sync local cart with server

### Authentication Required
All cart endpoints require valid JWT token in Authorization header.

## Data Flow

### Guest User Flow
1. User adds items → Stored in localStorage
2. Page refresh → Load from localStorage
3. User logs in → Local cart syncs with server
4. Network offline → Continue using localStorage

### Logged-in User Flow
1. User adds items → Update localStorage + server
2. Page refresh → Load from server
3. Network offline → Use localStorage, sync when online
4. Cross-device → Login to sync server cart

## Error Handling

### Offline Scenarios
- Cart operations continue with localStorage
- Server sync attempts when connection restored
- User notified of offline status

### Sync Failures
- Local changes preserved
- Automatic retry on next operation
- Manual sync option available

### Network Errors
- Graceful degradation to local storage
- User-friendly error messages
- Automatic recovery when possible

## Security Features

1. **Authentication**: All cart operations require valid JWT
2. **User Isolation**: Users can only access their own cart
3. **Input Validation**: Product existence and quantity validation
4. **Error Sanitization**: Safe error messages without data exposure

## Performance Optimizations

1. **Local Storage**: Immediate persistence without network calls
2. **Lazy Loading**: Cart loads on demand
3. **Debounced Sync**: Prevents excessive server calls
4. **Caching**: Server cart cached locally

## Browser Compatibility

- **localStorage**: Supported in all modern browsers
- **Network API**: Uses standard browser APIs
- **React Hooks**: Requires React 16.8+

## Testing Scenarios

### Manual Testing Checklist

- [ ] Add items as guest user
- [ ] Refresh page - items persist
- [ ] Close browser, reopen - items persist
- [ ] Login with existing cart - items merge
- [ ] Go offline - cart still works
- [ ] Come back online - cart syncs
- [ ] Use different device - login to sync
- [ ] Clear browser data - cart resets

### Automated Testing

```javascript
// Example test for cart persistence
test('cart persists after page refresh', () => {
  // Add items to cart
  // Refresh page
  // Verify items still present
});
```

## Troubleshooting

### Common Issues

1. **Cart not syncing**: Check authentication token
2. **Items disappearing**: Check localStorage quota
3. **Sync indicator stuck**: Check network connectivity
4. **Duplicate items**: Check cart merge logic

### Debug Information

Enable debug logging:
```javascript
localStorage.setItem('debug_cart', 'true');
```

Check localStorage contents:
```javascript
console.log('Cart data:', localStorage.getItem('kandukuru_cart'));
```

## Future Enhancements

1. **Service Worker**: Offline-first PWA capabilities
2. **Real-time Sync**: WebSocket for live updates
3. **Cart Sharing**: Share cart with other users
4. **Cart Templates**: Save cart as template
5. **Analytics**: Cart abandonment tracking

## Dependencies

### Backend
- Express.js
- MongoDB/Mongoose
- JWT authentication
- CORS middleware

### Frontend
- React 16.8+
- Axios for API calls
- localStorage API
- React Router for navigation

## Configuration

### Environment Variables
```env
MONGO_URI=mongodb://localhost:27017/kandukuru
JWT_SECRET=your_jwt_secret
API_URL=http://localhost:5000/api
```

### localStorage Keys
- `kandukuru_cart`: Cart items
- `kandukuru_user`: User data
- `authToken`: JWT token
- `kandukuru_cart_sync`: Last sync timestamp

## Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Test offline scenarios
5. Verify cross-browser compatibility

---

**Note**: This implementation provides a robust foundation for cart persistence. The offline-first approach ensures users can always manage their cart, while the server sync provides cross-device functionality for authenticated users. 