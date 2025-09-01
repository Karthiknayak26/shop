/// <reference types="cypress" />

describe('Cart Page', () => {
  beforeEach(() => {
    // Mock user login
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
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
    
    // Mock update cart
    cy.intercept('PUT', '/api/cart/update/*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Cart updated successfully'
      }
    }).as('updateCart');
    
    // Mock remove from cart
    cy.intercept('DELETE', '/api/cart/remove/*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Item removed from cart'
      }
    }).as('removeFromCart');
    
    // Visit cart page
    cy.visit('/cart');
    cy.wait('@getCart');
  });

  it('should display cart items correctly', () => {
    // Check cart title
    cy.get('[data-testid="cart-title"]').should('contain', 'Your Cart');
    
    // Check if cart items are displayed
    cy.get('[data-testid="cart-item"]').should('have.length', 2);
    
    // Check first item details
    cy.get('[data-testid="cart-item"]').first().within(() => {
      cy.get('[data-testid="item-name"]').should('contain', 'Rice');
      cy.get('[data-testid="item-price"]').should('contain', '₹100');
      cy.get('[data-testid="item-quantity"]').should('contain', '2');
      cy.get('[data-testid="item-total"]').should('contain', '₹200');
    });
    
    // Check total amount
    cy.get('[data-testid="cart-total"]').should('contain', '₹280');
  });

  it('should update item quantity', () => {
    // Intercept the updated cart after quantity change
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
              quantity: 3, // Increased quantity
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
          totalAmount: 380 // Updated total
        }
      }
    }).as('getUpdatedCart');
    
    // Increase quantity of first item
    cy.get('[data-testid="cart-item"]').first().within(() => {
      cy.get('[data-testid="quantity-increase"]').click();
    });
    
    cy.wait('@updateCart');
    cy.wait('@getUpdatedCart');
    
    // Check updated quantity
    cy.get('[data-testid="cart-item"]').first().within(() => {
      cy.get('[data-testid="item-quantity"]').should('contain', '3');
      cy.get('[data-testid="item-total"]').should('contain', '₹300');
    });
    
    // Check updated total amount
    cy.get('[data-testid="cart-total"]').should('contain', '₹380');
  });

  it('should remove item from cart', () => {
    // Intercept the updated cart after item removal
    cy.intercept('GET', '/api/cart', {
      statusCode: 200,
      body: {
        success: true,
        cart: {
          items: [
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
          totalAmount: 80 // Updated total
        }
      }
    }).as('getUpdatedCart');
    
    // Remove first item
    cy.get('[data-testid="cart-item"]').first().within(() => {
      cy.get('[data-testid="remove-item"]').click();
    });
    
    cy.wait('@removeFromCart');
    cy.wait('@getUpdatedCart');
    
    // Check if item was removed
    cy.get('[data-testid="cart-item"]').should('have.length', 1);
    
    // Check remaining item
    cy.get('[data-testid="cart-item"]').first().within(() => {
      cy.get('[data-testid="item-name"]').should('contain', 'Dal');
    });
    
    // Check updated total amount
    cy.get('[data-testid="cart-total"]').should('contain', '₹80');
  });

  it('should navigate to checkout page', () => {
    // Click checkout button
    cy.get('[data-testid="checkout-button"]').click();
    
    // Verify navigation to checkout page
    cy.url().should('include', '/checkout');
  });

  it('should handle empty cart', () => {
    // Intercept empty cart
    cy.intercept('GET', '/api/cart', {
      statusCode: 200,
      body: {
        success: true,
        cart: {
          items: [],
          totalAmount: 0
        }
      }
    }).as('getEmptyCart');
    
    // Reload page to get empty cart
    cy.visit('/cart');
    cy.wait('@getEmptyCart');
    
    // Check empty cart message
    cy.get('[data-testid="empty-cart-message"]').should('be.visible');
    cy.get('[data-testid="empty-cart-message"]').should('contain', 'Your cart is empty');
    
    // Check if continue shopping button is visible
    cy.get('[data-testid="continue-shopping"]').should('be.visible');
    
    // Check if checkout button is disabled
    cy.get('[data-testid="checkout-button"]').should('be.disabled');
    
    // Click continue shopping
    cy.get('[data-testid="continue-shopping"]').click();
    
    // Verify navigation to products page
    cy.url().should('include', '/products');
  });
});