/// <reference types="cypress" />

describe('Shopping Flow', () => {
  beforeEach(() => {
    // Visit the homepage
    cy.visit('/');
    
    // Intercept API calls
    cy.intercept('GET', '/api/products*').as('getProducts');
    cy.intercept('POST', '/api/cart/add').as('addToCart');
    cy.intercept('GET', '/api/cart').as('getCart');
    cy.intercept('POST', '/api/orders/create').as('createOrder');
  });

  it('should allow a user to browse products, add to cart, and checkout', () => {
    // Wait for products to load
    cy.wait('@getProducts');
    
    // Verify products are displayed
    cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);
    
    // Search for a specific product
    cy.get('[data-testid="search-input"]').type('Rice');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@getProducts');
    
    // Add first product to cart
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="add-to-cart-button"]').click();
    });
    
    cy.wait('@addToCart');
    
    // Verify cart notification
    cy.get('[data-testid="cart-notification"]').should('be.visible');
    
    // Go to cart page
    cy.get('[data-testid="cart-icon"]').click();
    cy.wait('@getCart');
    
    // Verify product is in cart
    cy.get('[data-testid="cart-item"]').should('have.length.at.least', 1);
    
    // Update quantity
    cy.get('[data-testid="quantity-increase"]').first().click();
    cy.wait('@addToCart');
    
    // Proceed to checkout
    cy.get('[data-testid="checkout-button"]').click();
    
    // Check if user is logged in, if not, redirect to login
    cy.url().then((url) => {
      if (url.includes('/login')) {
        // Fill login form
        cy.get('[data-testid="email-input"]').type('test@example.com');
        cy.get('[data-testid="password-input"]').type('password123');
        cy.get('[data-testid="login-button"]').click();
        
        // Should redirect back to checkout
        cy.url().should('include', '/checkout');
      }
    });
    
    // Fill shipping information
    cy.get('[data-testid="address-street"]').type('123 Test Street');
    cy.get('[data-testid="address-city"]').type('Test City');
    cy.get('[data-testid="address-state"]').type('Test State');
    cy.get('[data-testid="address-zip"]').type('123456');
    
    // Select payment method
    cy.get('[data-testid="payment-method-card"]').click();
    
    // Place order
    cy.get('[data-testid="place-order-button"]').click();
    cy.wait('@createOrder');
    
    // Mock successful payment
    cy.window().then((win) => {
      // Mock Razorpay payment success
      win.onRazorpayPaymentSuccess({
        razorpay_payment_id: 'pay_test123',
        razorpay_order_id: 'order_test123',
        razorpay_signature: 'test_signature'
      });
    });
    
    // Verify order confirmation
    cy.url().should('include', '/order-confirmation');
    cy.get('[data-testid="order-success-message"]').should('be.visible');
    cy.get('[data-testid="order-details"]').should('be.visible');
  });

  it('should handle out-of-stock products', () => {
    // Mock out-of-stock product
    cy.intercept('GET', '/api/products*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          products: [
            {
              _id: 'out-of-stock-product',
              name: 'Out of Stock Product',
              price: 100,
              description: 'This product is out of stock',
              imageUrl: '/images/product.jpg',
              category: 'Test',
              stock: 0
            }
          ]
        }
      });
    }).as('getOutOfStockProducts');
    
    // Reload page to get mocked products
    cy.visit('/');
    cy.wait('@getOutOfStockProducts');
    
    // Verify out-of-stock message
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="out-of-stock"]').should('be.visible');
      cy.get('[data-testid="add-to-cart-button"]').should('be.disabled');
    });
  });

  it('should allow users to view order history', () => {
    // Login first
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Intercept orders API
    cy.intercept('GET', '/api/orders').as('getOrders');
    
    // Go to profile/orders page
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="orders-link"]').click();
    
    cy.wait('@getOrders');
    
    // Verify orders are displayed
    cy.get('[data-testid="order-item"]').should('have.length.at.least', 1);
    
    // Click on an order to view details
    cy.get('[data-testid="order-item"]').first().click();
    
    // Verify order details
    cy.get('[data-testid="order-details"]').should('be.visible');
    cy.get('[data-testid="order-items"]').should('be.visible');
    cy.get('[data-testid="order-status"]').should('be.visible');
  });
});