// models/User.js
const mongoose = require('mongoose');

const tokenSubSchema = new mongoose.Schema({
  code:   { type: String },
  expires:{ type: Date   }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String },
  email:    { type: String, required: true, unique: true },
  password: { type: String }, // hashed password

  googleId: { type: String },
  githubId: { type: String },

  isVerified: { type: Boolean, default: false },

  // Grouped token fields:
  tokens: {
    verification: tokenSubSchema,  // { code: '123456', expires: Date }
    reset:        tokenSubSchema   // { code: '654321', expires: Date }
  },

  createdAt: { type: Date, default: Date.now }
});

// Export the model
module.exports = mongoose.model('User', userSchema);
