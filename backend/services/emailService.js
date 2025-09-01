const sendEmail = require('../utils/sendEmail');
const { orderConfirmationTemplate, passwordResetTemplate, notificationTemplate } = require('../utils/emailTemplates');

/**
 * Email service for sending various types of emails
 */
const emailService = {
  /**
   * Send order confirmation email
   * @param {Object} order - Order details
   * @returns {Promise} - Resolves when email is sent
   */
  sendOrderConfirmation: async (order) => {
    try {
      const html = orderConfirmationTemplate(order);
      const text = `Order Confirmation - Order ID: ${order.orderId}\nThank you for your order with Kandukuru Supermarket.`;
      
      await sendEmail({
        to: order.shippingAddress.email,
        subject: `Kandukuru Supermarket - Order Confirmation #${order.orderId}`,
        text,
        html
      });
      
      console.log(`Order confirmation email sent to ${order.shippingAddress.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  },
  
  /**
   * Send password reset email
   * @param {Object} user - User details
   * @param {String} resetToken - Password reset token
   * @returns {Promise} - Resolves when email is sent
   */
  sendPasswordReset: async (user, resetToken) => {
    try {
      const html = passwordResetTemplate(user.name, resetToken);
      const text = `Password Reset - Kandukuru Supermarket\nUse the following link to reset your password: http://localhost:3000/reset-password/${resetToken}`;
      
      await sendEmail({
        to: user.email,
        subject: 'Kandukuru Supermarket - Password Reset',
        text,
        html
      });
      
      console.log(`Password reset email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  },
  
  /**
   * Send notification email
   * @param {Object} user - User details
   * @param {String} subject - Email subject
   * @param {String} message - Email message
   * @returns {Promise} - Resolves when email is sent
   */
  sendNotification: async (user, subject, message) => {
    try {
      const html = notificationTemplate(user.name, subject, message);
      const text = `${subject}\n\nDear ${user.name},\n\n${message}\n\nThank you,\nKandukuru Supermarket Team`;
      
      await sendEmail({
        to: user.email,
        subject: `Kandukuru Supermarket - ${subject}`,
        text,
        html
      });
      
      console.log(`Notification email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send notification email:', error);
      return false;
    }
  }
};
module.exports = emailService;
