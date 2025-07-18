// utils/mailer.js

const nodemailer = require('nodemailer');
console.log('📧 Using email config:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER
});


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: true, // true for 465, false for other ports
  // If using Gmail, set secure to true and use port 465 

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Clover App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`📨 Email sent to ${to}:`, info.response);
  } catch (err) {
    console.error('❌ Email failed to send:', err);
  }
}

module.exports = sendMail;
