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
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"Clover App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}

module.exports = sendMail;
