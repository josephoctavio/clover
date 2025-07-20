// models/User.js
const mongoose = require('mongoose');

const tokenSubSchema = new mongoose.Schema({
  code:    { type: String, required: true },
  expires: { type: Date,   required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: {
    type:     String,
    required: true,
    unique:   true,
    minlength: 5,
    maxlength: 15,
    match:    /^[A-Za-z0-9_-]+$/  // letters, numbers, underscore, hyphen
  },
  email: {
    type:     String,
    required: true,
    unique:   true
  },
  password: {
    type:     String,
    required: true  // we enforce password strength now
  },

  googleId: { type: String },
  githubId: { type: String },

  isVerified: { type: Boolean, default: false },

  tokens: {
    verification: tokenSubSchema,  // { code: '123456', expires: Date }
    reset:        tokenSubSchema   // { code: '654321', expires: Date }
  },

  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', userSchema);
