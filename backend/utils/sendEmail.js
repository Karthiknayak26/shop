const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER || 'karthiknayakgj26@gmail.com',
    pass: process.env.EMAIL_PASS || 'kgol ipxr rnlh flae'
  },
  // Add timeout configurations to prevent blocking
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000, // 10 seconds
  socketTimeout: 15000 // 15 seconds
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text email body
 * @param {String} options.html - HTML email body
 * @param {String} [options.template] // optional template identifier
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Kandukuru Supermarket <noreply@kandukuru.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    await EmailLog.create({
      to: options.to,
      subject: options.subject,
      template: options.template,
      status: 'sent',
      messageId: info.messageId,
      response: info.response,
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    await EmailLog.create({
      to: options.to,
      subject: options.subject,
      template: options.template,
      status: 'failed',
      error: error.message,
    });
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;