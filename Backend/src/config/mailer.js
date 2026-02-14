const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP (only if credentials are provided)
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password, not regular password
    },
  });

  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Email service error:', error.message);
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.log('⚠️ Email service not configured - add EMAIL_USER and EMAIL_APP_PASSWORD to .env');
  // Create a dummy transporter that will fail gracefully
  transporter = {
    sendMail: async () => {
      throw new Error('Email service not configured');
    }
  };
}

module.exports = transporter;
