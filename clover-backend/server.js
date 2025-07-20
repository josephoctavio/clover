require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const bcrypt   = require('bcrypt');
require('./auth/passport'); // ✅ Import passport strategies

const sendMail = require('./utils/mailer'); // ✅ Only once!
console.log('📦 sendMail imported as:', sendMail); // ✅ Good check
const User     = require('./models/User'); // ✅ Import User model
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const GitHubStrategy = require('passport-github2').Strategy;
const fetch = require('node-fetch');
const crypto = require('crypto');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;


 //Passwordpolicy: ≥8 chars, letters & numbers
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,25}$/;

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 15, // 15 attempts
  message: { error: 'Too many login attempts. Try again later.' }
});
const codeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // 15 attempts
  message: { error: 'Too many code requests. Try again later.' }
});


// — Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// — Middleware
app.use(cors());
app.use(express.json());


// Apply rate limits
app.post('/api/login', loginLimiter);
app.post('/api/forgot-password', codeLimiter);
app.post('/api/verify', codeLimiter);
app.post('/api/reset-password', codeLimiter);
// Session middleware (so Passport can persist login)

app.use(passport.initialize());


app.post('/api/signup', async (req, res) => {
  console.log('⚡️  POST /api/signup', req.body);
  const { username, email, password } = req.body;
   // Validate inputs
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
 if (!passwordRegex.test(password)) {
  return res.status(400).json({
    error: 'Password must be 8–25 characters, only letters & numbers, and include at least one letter and one number'
  });
}

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    // 1. Check for existing user
    if (await User.findOne({ email })) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // 2. Hash the password
const hashed = await bcrypt.hash(password, 10);

// ✅ 3. Generate code & build front‑end verify link
 const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
 // FRONTEND_URL should be e.g. http://localhost:8080
 const verificationUrl = `${process.env.FRONTEND_URL}/verify.html?token=${verificationToken}`;
 console.log('🔗 [DEV] Verification Link:', verificationUrl);

// 4. Create the user (capture the returned document)
     const user = await User.create({
       username,
       email,
       password: hashed,
      // store under tokens.verification
      tokens: {
        verification: { code: verificationToken, expires: Date.now() + 15 * 60 * 1000 }
      }
     });

    // 5. Attempt to send verification email (errors won’t stop signup)
   (async () => {
  try {
    const verifyLink = `${process.env.FRONTEND_URL}/verify.html?token=${verificationToken}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your CLOVER account',
      html: `<p>Welcome! Please verify your email by clicking <a href="${verifyLink}">here</a>.</p>`
    });
  } catch (mailErr) {
    console.error('⚠️  Email send failed (signup still succeeded):', mailErr);
  }
})();

    // 6. Respond to client
    return res
      .status(201)
      .json({ message: 'User created successfully; check your email to verify.' });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// — LOGIN ROUTE
// (rate-limited by loginLimiter above)
app.post('/api/login', async (req, res) => {
  console.log('⚡️  POST /api/login', req.body);
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.password) {
      return res
        .status(401)
        .json({ error: 'No local password set—please log in with Google or GitHub' });
    }
     // Block unverified
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });  
     }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🔄 Return both token and user info:
    return res.json({
      user: {
        username: user.username,
        email:    user.email,      // optional
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Auth middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Expect header: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);            // No token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);             // Invalid token
    req.user = user;                                 // { userId, email, iat, exp }
    next();
  });
}
// — FORGOT-PASSWORD
// (rate-limited by codeLimiter above)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No user found with that email' });

    // Generate 6-digit reset token & set expiry (1 hour)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.tokens = {
      reset: {
        code: resetToken,
        expires: Date.now() + 60 * 60 * 1000
      }
    };

    await user.save();

    // Send email
    await sendMail({
      to: user.email,
      subject: 'Your Clover Reset Code',
      html: `
        <p>Your password reset code is:</p>
        <h2>${resetToken}</h2>
        <p>It expires in 1 hour. If you didn’t request this, you can ignore it.</p>
      `
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reset-password — using 6-digit code
// (rate-limited by codeLimiter above)
app.post('/api/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, code, and new password are required' });
  }
if (!passwordRegex.test(newPassword)) {
  return res.status(400).json({
    error: 'Password must be 8–25 characters, only letters & numbers, and include at least one letter and one number'
  });
}

  
  try {
    const user = await User.findOne({ email });

    if (
      !user ||
      !user.tokens?.reset ||
      user.tokens.reset.code !== code ||
      user.tokens.reset.expires < Date.now()
    ) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Hash new password and clear the reset token
    user.password = await bcrypt.hash(newPassword, 10);
    user.tokens.reset = undefined;
    await user.save();

    return res.json({ message: 'Password reset successfully 🌱' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/account  — protected
app.delete('/api/account', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/verify
app.get('/api/verify', async (req, res) => {
  try {
    const code = String(req.query.token || '');
    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    // Look up by nested tokens.verification.code
    const user = await User.findOne({ 'tokens.verification.code': code });
    if (!user || user.tokens.verification.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    user.isVerified = true;
    // Clear out the verification token
    user.tokens.verification = undefined;
    await user.save();

    console.log(`✅ Verified user: ${user.email}`);
    return res.json({ message: 'Email verified successfully 🌱' });
  } catch (err) {
    console.error('❌ Verification error:', err);
    return res.status(500).json({ error: 'Server error during verification' });
  }
});

// Passport strategies for Google and GitHub
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  'http://localhost:5000/api/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // 🔍 Check if user already exists by email
    let user = await User.findOne({ email });

    if (user) {
      // ✔️ Update to include googleId if not yet linked
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
    } else {
      // ❇️ New user via Google
      user = await User.create({
        googleId: profile.id,
        email,
        username: profile.displayName,
        isVerified: true
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));


passport.use(new GitHubStrategy({
    clientID:     process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL:  'http://localhost:5000/api/auth/github/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    // 1. Fetch the primary email as before
    let email = profile.emails?.[0]?.value;
    if (!email) {
      try {
        const resp = await fetch('https://api.github.com/user/emails', {
          headers: { 
            Authorization: `token ${accessToken}`, 
            'User-Agent': 'Clover-App' 
          }
        });
        const emails = await resp.json();
        const primary = emails.find(e => e.primary && e.verified);
        if (primary) email = primary.email;
      } catch (err) {
        console.error('Error fetching GitHub emails:', err);
      }
    }

    // 2. Try to find by GitHub ID first
    let user = await User.findOne({ githubId: profile.id });

    if (!user && email) {
      // 3. If no GitHub-linked user, see if someone signed up with this email already
      user = await User.findOne({ email });
      if (user) {
        // Link GitHub to their existing account
        user.githubId   = profile.id;
        user.isVerified = true;
        await user.save();
      }
    }

    // 4. If still no user, create a brand‑new one
    if (!user) {
      user = await User.create({
        githubId:   profile.id,
        email,                     // may be null if we couldn’t fetch it
        username:   profile.username,
        isVerified: true
      });
    }

    done(null, user);
  }
));


// Serialize/deserialize for session support
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Redirect to Google
app.get(
  '/api/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// Google callback URL
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  (req, res) => {
    // Successful auth: issue JWT and/or set cookie, then redirect
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // For SPA, you might redirect to frontend with token in query or cookie:
  // serve index.html from same host/port
  res.redirect(`/index.html?token=${token}`);
  }
);



// Redirect to GitHub
app.get(
  '/api/auth/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

// GitHub callback (stateless)
app.get(
  '/api/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/', session: false }),
  (req, res) => {
    // Issue JWT
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  res.redirect(`/index.html?token=${token}`);

  }
);

// ✅ Use absolute path to public directory
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// ✅ Snippet schema and model
const snippetSchema = new mongoose.Schema({
  title: String,
  code: String,
  language: String,
  uploadedBy: {
    email: String
  }
});
const Snippet = mongoose.model('Snippet', snippetSchema);

// ✅ API route
app.get('/api/snippets', async (req, res) => {
  try {
    const snippets = await Snippet.find();
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// ✅ Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
