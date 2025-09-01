/**
 * Email templates for various notifications
 */

/**
 * Generate order confirmation email HTML
 * @param {Object} order - Order details
 * @returns {String} - HTML email content
 */
const orderConfirmationTemplate = (order) => {
  const items = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');


  return `
    <!DOCTYPE html>dd
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e67e22; color: white; padding: 10px; text-align: center; }
        .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f4f4f4; text-align: left; padding: 10px; }
        .total { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        
        <p>Dear ${order.shippingAddress.name},</p>
        
        <p>Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
        
        <h2>Order Details</h2>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
        
        <h3>Items Ordered</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="3" style="text-align: right; padding: 10px;">Subtotal:</td>
              <td style="padding: 10px;">₹${order.totalAmount.toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td colspan="3" style="text-align: right; padding: 10px;">Shipping:</td>
              <td style="padding: 10px;">₹${(order.shippingCost || 0).toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td colspan="3" style="text-align: right; padding: 10px;">Total:</td>
              <td style="padding: 10px;">₹${((order.totalAmount || 0) + (order.shippingCost || 0)).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <h3>Shipping Information</h3>
        <p>
          ${order.shippingAddress.name}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
          Phone: ${order.shippingAddress.phone}
        </p>
        
        <h3>Payment Information</h3>
        <p><strong>Payment Method:</strong> ${order.paymentInfo.method}</p>
        <p><strong>Payment Status:</strong> ${order.paymentInfo.paymentStatus}</p>
        
        <p>You can track your order status by logging into your account on our website.</p>
        
        <p>If you have any questions or concerns about your order, please contact our customer service team.</p>
        
        <p>Thank you for shopping with Kandukuru Supermarket!</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Kandukuru Supermarket. All rights reserved.</p>
          <p>This email was sent to ${order.shippingAddress.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate password reset email HTML
 * @param {String} name - User's name
 * @param {String} resetToken - Password reset token
 * @returns {String} - HTML email content
 */
const passwordResetTemplate = (name, resetToken) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e67e22; color: white; padding: 10px; text-align: center; }
        .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
        .button { display: inline-block; background-color: #e67e22; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        
        <p>Dear ${name},</p>
        
        <p>We received a request to reset your password for your Kandukuru Supermarket account. Click the button below to reset your password:</p>
        
        <p style="text-align: center;">
          <a href="http://localhost:3000/reset-password/${resetToken}" class="button">Reset Password</a>
        </p>
        
        <p>If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.</p>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        
        <p>Thank you,<br>Kandukuru Supermarket Team</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Kandukuru Supermarket. All rights reserved.</p>
          <p>If you're having trouble clicking the button, copy and paste this URL into your web browser: http://localhost:3000/reset-password/${resetToken}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate notification email HTML
 * @param {String} name - User's name
 * @param {String} subject - Notification subject
 * @param {String} message - Notification message
 * @returns {String} - HTML email content
 */
const notificationTemplate = (name, subject, message) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e67e22; color: white; padding: 10px; text-align: center; }
        .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${subject}</h1>
        </div>
        
        <p>Dear ${name},</p>
        
        <p>${message}</p>
        
        <p>Thank you,<br>Kandukuru Supermarket Team</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Kandukuru Supermarket. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  orderConfirmationTemplate,
  passwordResetTemplate,
  notificationTemplate
};