/// <reference types="cypress" />

describe('Checkout Page', () => {
  beforeEach(() => {
    // Mock user login
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210'
      }));
    });
    
    // Mock cart data
    cy.intercept('GET', '/api/cart', {
      statusCode: 200,
      body: {
        success: true,
        cart: {
          items: [
            {
              _id: 'cart-item-1',
              product: {
                _id: 'product-1',
                name: 'Rice',
                price: 100,
                imageUrl: '/images/rice.jpg',
                description: 'Premium quality rice',
                stock: 50
              },
              quantity: 2,
              price: 100
            },
            {
              _id: 'cart-item-2',
              product: {
                _id: 'product-2',
                name: 'Dal',
                price: 80,
                imageUrl: '/images/dal.jpg',
                description: 'Fresh dal',
                stock: 30
              },
              quantity: 1,
              price: 80
            }
          ],
          totalAmount: 280
        }
      }
    }).as('getCart');
    
    // Mock user address
    cy.intercept('GET', '/api/users/address', {
      statusCode: 200,
      body: {
        success: true,
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '123456'
        }
      }
    }).as('getUserAddress');
    
    // Mock create order
    cy.intercept('POST', '/api/orders/create', {
      statusCode: 200,
      body: {
        success: true,
        order: {
          _id: 'order-123',
          items: [
            {
              product: {
                _id: 'product-1',
                name: 'Rice',
                price: 100
              },
              quantity: 2,
              price: 100
            },
            {
              product: {
                _id: 'product-2',
                name: 'Dal',
                price: 80
              },
              quantity: 1,
              price: 80
            }
          ],
          totalAmount: 280,
          status: 'pending',
          paymentMethod: 'card',
          shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '123456'
          }
        }
      }
    }).as('createOrder');
    
    // Visit checkout page
    cy.visit('/checkout');
    cy.wait('@getCart');
    cy.wait('@getUserAddress');
  });

  it('should display order summary correctly', () => {
    // Check checkout title
    cy.get('[data-testid="checkout-title"]').should('contain', 'Checkout');
    
    // Check order summary section
    cy.get('[data-testid="order-summary"]').should('be.visible');
    
    // Check if items are displayed in summary
    cy.get('[data-testid="summary-item"]').should('have.length', 2);
    
    // Check first item details
    cy.get('[data-testid="summary-item"]').first().within(() => {
      cy.get('[data-testid="item-name"]').should('contain', 'Rice');
      cy.get('[data-testid="item-quantity"]').should('contain', '2');
      cy.get('[data-testid="item-price"]').should('contain', '₹100');
    });
    
    // Check total amount
    cy.get('[data-testid="summary-total"]').should('contain', '₹280');
  });

  it('should pre-fill shipping address if available', () => {
    // Check if address fields are pre-filled
    cy.get('[data-testid="address-street"]').should('have.value', '123 Test Street');
    cy.get('[data-testid="address-city"]').should('have.value', 'Test City');
    cy.get('[data-testid="address-state"]').should('have.value', 'Test State');
    cy.get('[data-testid="address-zip"]').should('have.value', '123456');
  });

  it('should allow editing shipping address', () => {
    // Clear and update address fields
    cy.get('[data-testid="address-street"]').clear().type('456 New Street');
    cy.get('[data-testid="address-city"]').clear().type('New City');
    cy.get('[data-testid="address-state"]').clear().type('New State');
    cy.get('[data-testid="address-zip"]').clear().type('654321');
    
    // Mock save address
    cy.intercept('PUT', '/api/users/address', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Address updated successfully'
      }
    }).as('updateAddress');
    
    // Save address
    cy.get('[data-testid="save-address"]').click();
    cy.wait('@updateAddress');
    
    // Check success message
    cy.get('[data-testid="address-success"]').should('be.visible');
  });

  it('should validate shipping address fields', () => {
    // Clear address fields
    cy.get('[data-testid="address-street"]').clear();
    cy.get('[data-testid="address-city"]').clear();
    cy.get('[data-testid="address-state"]').clear();
    cy.get('[data-testid="address-zip"]').clear();
    
    // Try to place order
    cy.get('[data-testid="place-order-button"]').click();
    
    // Check validation errors
    cy.get('[data-testid="street-error"]').should('be.visible');
    cy.get('[data-testid="city-error"]').should('be.visible');
    cy.get('[data-testid="state-error"]').should('be.visible');
    cy.get('[data-testid="zip-error"]').should('be.visible');
  });

  it('should allow selecting payment method', () => {
    // Check if payment methods are displayed
    cy.get('[data-testid="payment-methods"]').should('be.visible');
    
    // Select card payment
    cy.get('[data-testid="payment-method-card"]').click();
    cy.get('[data-testid="payment-method-card"]').should('have.class', 'selected');
    
    // Select UPI payment
    cy.get('[data-testid="payment-method-upi"]').click();
    cy.get('[data-testid="payment-method-upi"]').should('have.class', 'selected');
    cy.get('[data-testid="payment-method-card"]').should('not.have.class', 'selected');
    
    // Select COD payment
    cy.get('[data-testid="payment-method-cod"]').click();
    cy.get('[data-testid="payment-method-cod"]').should('have.class', 'selected');
    cy.get('[data-testid="payment-method-upi"]').should('not.have.class', 'selected');
  });

  it('should place order with card payment', () => {
    // Select card payment
    cy.get('[data-testid="payment-method-card"]').click();
    
    // Mock Razorpay order creation
    cy.intercept('POST', '/api/payments/create-order', {
      statusCode: 200,
      body: {
        success: true,
        orderId: 'razorpay_order_123',
        amount: 28000,
        currency: 'INR'
      }
    }).as('createPaymentOrder');
    
    // Place order
    cy.get('[data-testid="place-order-button"]').click();
    
    // Wait for order creation
    cy.wait('@createOrder');
    
    // Wait for payment order creation
    cy.wait('@createPaymentOrder');
    
    // Mock Razorpay payment success
    cy.window().then((win) => {
      // Create a mock Razorpay handler
      win.Razorpay = function(options) {
        return {
          open: function() {
            // Simulate payment success
            setTimeout(() => {
              options.handler({
                razorpay_payment_id: 'pay_test123',
                razorpay_order_id: 'razorpay_order_123',
                razorpay_signature: 'test_signature'
              });
            }, 500);
          }
        };
      };
    });
    
    // Mock payment verification
    cy.intercept('POST', '/api/payments/verify', {
      statusCode: 200,
      body: {
        success: true,
        status: 'completed',
        message: 'Payment successful'
      }
    }).as('verifyPayment');
    
    // Verify navigation to order confirmation
    cy.url().should('include', '/order-confirmation', { timeout: 10000 });
  });

  it('should place order with COD payment', () => {
    // Select COD payment
    cy.get('[data-testid="payment-method-cod"]').click();
    
    // Place order
    cy.get('[data-testid="place-order-button"]').click();
    
    // Wait for order creation
    cy.wait('@createOrder');
    
    // Verify navigation to order confirmation
    cy.url().should('include', '/order-confirmation');
    
    // Check COD message
    cy.get('[data-testid="cod-message"]').should('contain', 'Cash on Delivery');
  });
});