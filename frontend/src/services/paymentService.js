// Payment Service for Razorpay Integration
class PaymentService {
  constructor() {
    this.razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_TEST_KEY_ID';
  }

  // Load Razorpay script
  loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });
  }

  // Create payment order
  async createPaymentOrder(amount, currency = 'INR') {
    try {
      const response = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: `order_${Date.now()}`
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      return data;
    } catch (error) {
      console.error('Create payment order error:', error);
      throw error;
    }
  }

  // Process card payment
  async processCardPayment(amount, orderData) {
    try {
      const paymentOrder = await this.createPaymentOrder(amount);

      // Check if we're in demo mode
      if (paymentOrder.demo) {
        console.log('🔄 Demo Mode: Simulating card payment');

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate successful payment
        const demoPaymentId = `pay_${Date.now()}_demo`;

        // Update order with payment info
        const updatedOrderData = {
          ...orderData,
          paymentInfo: {
            ...orderData.paymentInfo,
            razorpayOrderId: paymentOrder.orderId,
            razorpayPaymentId: demoPaymentId,
            paymentStatus: 'completed'
          }
        };

        // Create order in database
        const orderResponse = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedOrderData),
        });

        const orderResult = await orderResponse.json();

        if (orderResponse.ok) {
          return {
            success: true,
            paymentId: demoPaymentId,
            orderId: orderResult.orderId,
            orderData: updatedOrderData,
            demo: true
          };
        } else {
          throw new Error('Failed to create order');
        }
      }

      // Real payment processing
      const Razorpay = await this.loadRazorpayScript();

      const options = {
        key: this.razorpayKey,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Kandukuru Supermarket',
        description: 'Order Payment',
        order_id: paymentOrder.orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationResponse = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }),
            });

            const verificationData = await verificationResponse.json();

            if (verificationData.success) {
              // Update order with payment info
              const updatedOrderData = {
                ...orderData,
                paymentInfo: {
                  ...orderData.paymentInfo,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  paymentStatus: 'completed'
                }
              };

              // Create order in database
              const orderResponse = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedOrderData),
              });

              const orderResult = await orderResponse.json();

              if (orderResponse.ok) {
                return {
                  success: true,
                  paymentId: response.razorpay_payment_id,
                  orderId: orderResult.orderId,
                  orderData: updatedOrderData
                };
              } else {
                throw new Error('Failed to create order');
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
          }
        },
        prefill: {
          name: orderData.shippingAddress.name,
          email: orderData.shippingAddress.email,
          contact: orderData.shippingAddress.phone
        },
        theme: {
          color: '#e67e22'
        },
        modal: {
          ondismiss: () => {
            throw new Error('Payment cancelled by user');
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();

      return new Promise((resolve, reject) => {
        window.razorpayPaymentHandler = (result) => {
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Payment failed'));
          }
        };
      });
    } catch (error) {
      console.error('Card payment error:', error);
      throw error;
    }
  }

  // Process UPI payment
  async processUPIPayment(amount, orderData) {
    try {
      const paymentOrder = await this.createPaymentOrder(amount);

      // Check if we're in demo mode
      if (paymentOrder.demo) {
        console.log('🔄 Demo Mode: Simulating UPI payment');

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate successful payment
        const demoPaymentId = `pay_${Date.now()}_demo`;

        // Update order with payment info
        const updatedOrderData = {
          ...orderData,
          paymentInfo: {
            ...orderData.paymentInfo,
            razorpayOrderId: paymentOrder.orderId,
            razorpayPaymentId: demoPaymentId,
            paymentStatus: 'completed'
          }
        };

        // Create order in database
        const orderResponse = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedOrderData),
        });

        const orderResult = await orderResponse.json();

        if (orderResponse.ok) {
          return {
            success: true,
            paymentId: demoPaymentId,
            orderId: orderResult.orderId,
            orderData: updatedOrderData,
            demo: true
          };
        } else {
          throw new Error('Failed to create order');
        }
      }

      // Real payment processing
      const Razorpay = await this.loadRazorpayScript();

      const options = {
        key: this.razorpayKey,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Kandukuru Supermarket',
        description: 'Order Payment',
        order_id: paymentOrder.orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationResponse = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }),
            });

            const verificationData = await verificationResponse.json();

            if (verificationData.success) {
              // Update order with payment info
              const updatedOrderData = {
                ...orderData,
                paymentInfo: {
                  ...orderData.paymentInfo,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  paymentStatus: 'completed'
                }
              };

              // Create order in database
              const orderResponse = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedOrderData),
              });

              const orderResult = await orderResponse.json();

              if (orderResponse.ok) {
                return {
                  success: true,
                  paymentId: response.razorpay_payment_id,
                  orderId: orderResult.orderId,
                  orderData: updatedOrderData
                };
              } else {
                throw new Error('Failed to create order');
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
          }
        },
        prefill: {
          name: orderData.shippingAddress.name,
          email: orderData.shippingAddress.email,
          contact: orderData.shippingAddress.phone
        },
        theme: {
          color: '#e67e22'
        },
        modal: {
          ondismiss: () => {
            throw new Error('Payment cancelled by user');
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();

      return new Promise((resolve, reject) => {
        window.razorpayPaymentHandler = (result) => {
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Payment failed'));
          }
        };
      });
    } catch (error) {
      console.error('UPI payment error:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(paymentData) {
    try {
      const response = await fetch('http://localhost:5000/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const response = await fetch(`http://localhost:5000/api/payments/payment/${paymentId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get payment details error:', error);
      throw error;
    }
  }
}

export default new PaymentService(); 