// C:\Users\DELL\Desktop\clover\clover-backend\src\routes\authRoutes.js
const express      = require('express');
const passport = require('passport');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const User         = require('../../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const sendMail     = require('../../utils/mailer');


const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { fullName, email, password, username  } = req.body;

  try {
    // 1. Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create new user instance
    const newUser = new User({
      fullName,
      username,
      email,
      passwordHash: hashedPassword
    });

    // 4. Generate a 6‑digit verification code and set expiry (15 minutes)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000;

    // 5. Save verification token
    newUser.tokens.verification = { code, expires };

    // 6. Save user
    await newUser.save();

    // 7. Send email
    try {
      await sendMail({
        to: email,
        subject: 'Your Clover Verification Code',
        html: `<p>Welcome to <strong>Clover</strong>!</p>
               <p>Your verification code is <strong>${code}</strong>.</p>
                <p>Please enter this code to complete your registration.</p>
                <p>Ignore this email if you did not register.</p>
                <p>Note: This code is valid for 15 minutes.</p>
                <p>Thank you for joining CLOVER!</p>`
      });
    } catch (mailErr) {
      console.error('Email send failed:', mailErr);
    }

    console.log(`🔗 [DEV] Verification Code for ${email}:`, code);

    return res
      .status(201)
      .json({ message: 'User registered successfully 🌱. Verification code sent.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// @route   POST /api/auth/reset-password
// @desc    Reset a user's password using the 6‑digit code
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;
  console.log('🔍 Incoming verify request:', { email, code });

  try {
    const user = await User.findOne({
      email,
      "tokens.reset.code": code
    });

    console.log('✅ User found?', !!user);

    if (!user) {
      return res.status(400).json({ error: "Invalid email or code" });
    }

    console.log('🕒 Checking code expiration...');
    if (user.tokens.reset.expires < Date.now()) {
      return res.status(400).json({ error: "Reset code has expired" });
    }

    console.log('✅ Code verified');
    res.json({ message: "Code verified" });

  } catch (err) {
    console.error("❌ Code verification error:", err);
    res.status(500).json({ error: "Server error during verification" });
  }
});



// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    return res.json({
      token,
      user: {
         id: user._id,
     email: user.email,
     role: user.role,
     username: user.username,   // ← add this
     fullName: user.fullName
        }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// In src/routes/authRoutes.js

router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Use req.user.id (the JWT payload) to look up the full user
    const fullUser = await User.findById(req.user.id)
      .select('username email avatar');

    if (!fullUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: fullUser });
  } catch (err) {
    console.error('❌ /api/auth/me error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


// @route   POST /api/auth/forgot-password
// @desc    Generate & email a 6‑digit reset code
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) {
      // For security, you can respond with 200 even if user not found
      return res
        .status(200)
        .json({ message: 'If that email is registered, a reset code has been sent.' });
    }

   // Ensure the tokens object exists
   if (!user.tokens) {
     user.tokens = {};
   }

    // 2. Generate code & expiry
    const code    = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // 3. Persist to nested tokens.reset
    user.tokens.reset = { code, expires };
    await user.save();

    // 4. Send email with the reset code
    await sendMail({
      to:      email,
      subject: 'Your Clover Password Reset Code',
      html:    `<p>You requested a password reset for Clover.</p>
                <p>Your reset code is <strong>${code}</strong>.</p>
                <p>This code expires in 15 minutes.</p>`
    });

    // 5. Always respond with 200 to avoid leaking existence
    return res
      .status(200)
      .json({ message: 'If that email is registered, a reset code has been sent.' });
  } catch (err) {
    console.error('Forgot-password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
// Start GitHub auth
 router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login.html', session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '2d' }
      );

      // Redirect to frontend with token in query string
      res.redirect(`http://localhost:5000/index.html?token=${token}`);
    } catch (err) {
      console.error('GitHub OAuth error:', err);
      res.redirect('/login.html');
    }
  }
);

// Start Google auth
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html', session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '2d' }
      );

      res.redirect(`http://localhost:5000/index.html?token=${token}`);
    } catch (err) {
      console.error('Google OAuth error:', err);
      res.redirect('/login.html');
    }
  }
);

// makes sure Google login prompts user to select account
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);


// AFTER
router.get('/github', (req, res, next) => {
  // Pass `login` as an empty string to force GitHub to prompt for credentials
  passport.authenticate('github', {
    scope: ['user:email'],
    allow_signup: true,
    login: ''  
  })(req, res, next);
});


