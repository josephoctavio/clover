// models/User.js
const mongoose = require('mongoose');
const validator = require('validator');

const tokenSubSchema = new mongoose.Schema({
  code:    { type: String, required: true },
  expires: { type: Date,   required: true }
}, { _id: false });

const socialLinksSchema = new mongoose.Schema({
  twitter: {
    type:     String,
    trim:     true,
    validate: {
      validator: v => !v || validator.isURL(v),
      message:   'Invalid Twitter URL'
    }
  },
  github: {
    type:     String,
    trim:     true,
    validate: {
      validator: v => !v || validator.isURL(v),
      message:   'Invalid GitHub URL'
    }
  },
  website: {
    type:     String,
    trim:     true,
    validate: {
      validator: v => !v || validator.isURL(v),
      message:   'Invalid Website URL'
    }
  }
}, { _id: false });

const userSchema = new mongoose.Schema({

   fullName: {
    type: String,
    required: true,
  },
  username: {
    type:      String,
    required:  true,
    unique:    true,
    minlength: 5,
    maxlength: 25,
    match:     /^[A-Za-z0-9_-]+$/
  },

  email: {
    type:     String,
    unique:   true,
    sparse:   true,
    required: function() {
      // require email if no OAuth IDs provided
      return !this.googleId && !this.githubId;
    },
    validate: {
      validator: v => !v || validator.isEmail(v),
      message:   'Invalid email address'
    }
  },

  passwordHash: {
    type:     String,
    required: function() {
      // require passwordHash if no OAuth IDs provided
      return !this.googleId && !this.githubId;
    }
  },

  // Profile fields
  profilePic: {
    type:    String,
    default: ''
  },
  displayName: {
    type:      String,
    default:   '',
    maxlength: 30,
    trim:      true
  },
  bio: {
    type:      String,
    default:   '',
    maxlength: 160,
    trim:      true
  },
  socialLinks: {
    type:    socialLinksSchema,
    default: {}
  },
  location: {
    type:      String,
    default:   '',
    maxlength: 100,
    trim:      true
  },
  birthday: {
    type: Date,
    validate: [
      {
        validator: date => !date || date < new Date(),
        message:   'Birthday must be in the past'
      },
      {
        validator: date => {
          if (!date) return true;
          const sixteenYears = 16 * 365.25 * 24 * 60 * 60 * 1000;
          return (Date.now() - date.getTime()) >= sixteenYears;
        },
        message: 'User must be at least 16 years old to set a birthday date'
      }
    ]
  },

  // OAuth / 3rd‑party IDs
  googleId: { type: String },
  githubId: { type: String },

  isVerified: { type: Boolean, default: false },

  // Verification & reset tokens
  tokens: {
    verification: tokenSubSchema,
    reset:        tokenSubSchema
  }

}, {
  timestamps: true  // adds createdAt & updatedAt
});

module.exports = mongoose.model('User', userSchema);
