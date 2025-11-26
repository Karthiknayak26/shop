// Payment Service for Razorpay Integration
class PaymentService {
  constructor() {
    this.razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_TEST_KEY_ID';
    this.isLiveMode = process.env.REACT_APP_RAZORPAY_MODE === 'live' || process.env.NODE_ENV === 'production';
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

  // Validate UPI ID format
  validateUPIId(upiId) {
    // UPI ID format: username@bank or username@upi
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upiRegex.test(upiId);
  }

  // Generate UPI payment link
  generateUPILink(amount, upiId, merchantName = 'Kandukuru Supermarket') {
    const upiParams = new URLSearchParams({
      pa: upiId, // Payee UPI ID
      pn: merchantName, // Payee name
      am: amount.toString(), // Amount
      cu: 'INR', // Currency
      tn: `Order Payment - ${Date.now()}`, // Transaction note
      mode: '02' // UPI mode
    });

    return `upi://pay?${upiParams.toString()}`;
  }

  // Create payment order
  async createPaymentOrder(amount, currency = 'INR') {
    try {
      const response = await fetch('https://shop-backend-92zc.onrender.com/api/payments/create-order', {
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
        const orderResponse = await fetch('https://shop-backend-92zc.onrender.com/api/orders', {
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
            const verificationResponse = await fetch('https://shop-backend-92zc.onrender.com/api/payments/verify', {
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
              const orderResponse = await fetch('https://shop-backend-92zc.onrender.com/api/orders', {
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

  // Process UPI payment with real UPI ID
  async processUPIPayment(amount, orderData, upiId) {
    try {
      // Validate UPI ID
      if (!this.validateUPIId(upiId)) {
        throw new Error('Invalid UPI ID format. Please enter a valid UPI ID (e.g., username@bank)');
      }

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
            paymentStatus: 'completed',
            upiId: upiId
          }
        };

        // Create order in database
        const orderResponse = await fetch('https://shop-backend-92zc.onrender.com/api/orders', {
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
            demo: true,
            upiId: upiId
          };
        } else {
          throw new Error('Failed to create order');
        }
      }

      // Real UPI payment processing
      const Razorpay = await this.loadRazorpayScript();

      const options = {
        key: this.razorpayKey,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Kandukuru Supermarket',
        description: 'Order Payment',
        order_id: paymentOrder.orderId,
        prefill: {
          name: orderData.shippingAddress.name,
          email: orderData.shippingAddress.email,
          contact: orderData.shippingAddress.phone
        },
        notes: {
          upi_id: upiId,
          order_type: 'UPI Payment'
        },
        theme: {
          color: '#e67e22'
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationResponse = await fetch('https://shop-backend-92zc.onrender.com/api/payments/verify', {
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
                  paymentStatus: 'completed',
                  upiId: upiId
                }
              };

              // Create order in database
              const orderResponse = await fetch('https://shop-backend-92zc.onrender.com/api/orders', {
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
                  orderData: updatedOrderData,
                  upiId: upiId
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

  // Generate UPI QR Code
  async generateUPIQRCode(amount, upiId, orderId) {
    try {
      const response = await fetch('https://shop-backend-92zc.onrender.com/api/payments/generate-upi-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          upiId,
          orderId,
          merchantName: 'Kandukuru Supermarket'
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Generate UPI QR code error:', error);
      throw error;
    }
  }

  // Check UPI payment status
  async checkUPIPaymentStatus(orderId) {
    try {
      const response = await fetch(`https://shop-backend-92zc.onrender.com/api/payments/check-status/${orderId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Check UPI payment status error:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(paymentData) {
    try {
      const response = await fetch('https://shop-backend-92zc.onrender.com/api/payments/verify', {
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
      const response = await fetch(`https://shop-backend-92zc.onrender.com/api/payments/payment/${paymentId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get payment details error:', error);
      throw error;
    }
  }
}

export default new PaymentService();