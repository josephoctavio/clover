// C:\Users\DELL\Desktop\clover\clover-backend\src\routes\authRoutes.js
const express      = require('express');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const sendMail     = require('../../utils/mailer');


const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

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
      email,
      password: hashedPassword
    });

    // 4. Generate a 6‑digit verification code and set expiry (15 minutes)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    // 5. Persist into the nested tokens.verification sub‑document
    newUser.tokens.verification = { code, expires };

    // 6. Save user to database
    await newUser.save();

    // 7. Send the code via email
    try {
      await sendMail({
        to:      email,
        subject: 'Your Clover Verification Code',
        html:    `<p>Welcome to <strong>Clover</strong>!</p>
                  <p>Your verification code is <strong>${code}</strong>.</p>
                  <p>This code will expire in 15 minutes.</p>`
      });
    } catch (mailErr) {
      console.error('Email send failed:', mailErr);
      // Optional: you could delete the user or flag for retry here
    }

    // 8. Dev log
    console.log(`🔗 [DEV] Verification Code for ${email}:`, code);

    return res
      .status(201)
      .json({ message: 'User registered successfully 🌱. Verification code sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify
// @desc    Verify a user's 6‑digit email code
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.tokens?.verification) {
      return res.status(400).json({ message: 'Invalid email or code' });
    }

    const { code: savedCode, expires } = user.tokens.verification;

    // 1. Check code match
    if (savedCode !== code) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    // 2. Check expiry
    if (Date.now() > expires) {
      return res.status(400).json({ message: 'Code expired' });
    }

    // 3. Mark verified & clear token
    user.isVerified = true;
    user.tokens.verification = undefined;
    await user.save();

    return res.json({ message: 'Email verified successfully ✅' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    return res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me → Return current logged-in user
router.get('/me', authMiddleware, async (req, res) => {
  return res.json({
    message: 'Welcome back 🌿',
    user: req.user
  });
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
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Callback from GitHub
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login.html' }),
  (req, res) => {
    res.redirect('/index.html'); // or dashboard.html
  }
);
// End GitHub auth