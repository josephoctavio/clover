// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // hashed password for manual login

  googleId: { type: String },
  githubId: { type: String },

  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }, // now stores 6-digit code
  resetToken: { type: String },        // now stores 6-digit code
  resetTokenExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
// This schema includes fields for username, email, password, OAuth IDs, verification status, and tokens for verification and password reset.