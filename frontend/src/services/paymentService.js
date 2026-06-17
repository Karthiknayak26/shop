// Payment Service for Razorpay Integration
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upiRegex.test(upiId);
  }

  // Generate UPI payment link
  generateUPILink(amount, upiId, merchantName = 'Kandukuru Supermarket') {
    const upiParams = new URLSearchParams({
      pa: upiId,
      pn: merchantName,
      am: amount.toString(),
      cu: 'INR',
      tn: `Order Payment - ${Date.now()}`,
      mode: '02'
    });

    return `upi://pay?${upiParams.toString()}`;
  }

  // Create payment order
  async createPaymentOrder(amount, currency = 'INR') {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
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
  processCardPayment(amount, orderData) {
    return new Promise(async (resolve, reject) => {
      try {
        const paymentOrder = await this.createPaymentOrder(amount);
        const token = localStorage.getItem('authToken');

        // Check if we're in demo mode
        if (paymentOrder.demo) {
          console.log('🔄 Demo Mode: Simulating card payment');

          await new Promise(r => setTimeout(r, 2000));

          const demoPaymentId = `pay_${Date.now()}_demo`;

          const updatedOrderData = {
            ...orderData,
            paymentInfo: {
              ...orderData.paymentInfo,
              razorpayOrderId: paymentOrder.orderId,
              razorpayPaymentId: demoPaymentId,
              paymentStatus: 'completed'
            }
          };

          const orderResponse = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(updatedOrderData),
          });

          const orderResult = await orderResponse.json();

          if (orderResponse.ok) {
            resolve({
              success: true,
              paymentId: demoPaymentId,
              orderId: orderResult.order?.orderId || orderResult.orderId,
              orderData: updatedOrderData,
              demo: true
            });
          } else {
            reject(new Error(orderResult.error || 'Failed to create order'));
          }
          return;
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
              const verificationResponse = await fetch(`${API_URL}/api/payments/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }),
              });

              const verificationData = await verificationResponse.json();

              if (verificationData.success) {
                const updatedOrderData = {
                  ...orderData,
                  paymentInfo: {
                    ...orderData.paymentInfo,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    paymentStatus: 'completed'
                  }
                };

                const orderResponse = await fetch(`${API_URL}/api/orders`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                  },
                  body: JSON.stringify(updatedOrderData),
                });

                const orderResult = await orderResponse.json();

                if (orderResponse.ok) {
                  resolve({
                    success: true,
                    paymentId: response.razorpay_payment_id,
                    orderId: orderResult.order?.orderId || orderResult.orderId,
                    orderData: updatedOrderData
                  });
                } else {
                  reject(new Error(orderResult.error || 'Failed to create order'));
                }
              } else {
                reject(new Error('Payment verification failed'));
              }
            } catch (error) {
              console.error('Payment processing error:', error);
              reject(error);
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
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error('Card payment error:', error);
        reject(error);
      }
    });
  }

  // Process UPI payment
  processUPIPayment(amount, orderData, upiId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.validateUPIId(upiId)) {
          throw new Error('Invalid UPI ID format. Please enter a valid UPI ID (e.g., username@bank)');
        }

        const paymentOrder = await this.createPaymentOrder(amount);
        const token = localStorage.getItem('authToken');

        // Check if we're in demo mode
        if (paymentOrder.demo) {
          console.log('🔄 Demo Mode: Simulating UPI payment');

          await new Promise(r => setTimeout(r, 2000));

          const demoPaymentId = `pay_${Date.now()}_demo`;

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

          const orderResponse = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(updatedOrderData),
          });

          const orderResult = await orderResponse.json();

          if (orderResponse.ok) {
            resolve({
              success: true,
              paymentId: demoPaymentId,
              orderId: orderResult.order?.orderId || orderResult.orderId,
              orderData: updatedOrderData,
              demo: true,
              upiId: upiId
            });
          } else {
            reject(new Error(orderResult.error || 'Failed to create order'));
          }
          return;
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
              const verificationResponse = await fetch(`${API_URL}/api/payments/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }),
              });

              const verificationData = await verificationResponse.json();

              if (verificationData.success) {
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

                const orderResponse = await fetch(`${API_URL}/api/orders`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                  },
                  body: JSON.stringify(updatedOrderData),
                });

                const orderResult = await orderResponse.json();

                if (orderResponse.ok) {
                  resolve({
                    success: true,
                    paymentId: response.razorpay_payment_id,
                    orderId: orderResult.order?.orderId || orderResult.orderId,
                    orderData: updatedOrderData,
                    upiId: upiId
                  });
                } else {
                  reject(new Error(orderResult.error || 'Failed to create order'));
                }
              } else {
                reject(new Error('Payment verification failed'));
              }
            } catch (error) {
              console.error('Payment processing error:', error);
              reject(error);
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error('UPI payment error:', error);
        reject(error);
      }
    });
  }

  // Generate UPI QR Code
  async generateUPIQRCode(amount, upiId, orderId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/payments/generate-upi-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
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
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/payments/check-status/${orderId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
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
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
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
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/payments/payment/${paymentId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get payment details error:', error);
      throw error;
    }
  }
}

export default new PaymentService();