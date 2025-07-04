require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'clover-session-secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatarUrl: profile.photos[0].value
        }
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

    let user = await prisma.user.findUnique({
      where: { githubId: profile.id }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: profile.id,
          name: profile.displayName || profile.username,
          email,
          avatarUrl: profile._json.avatar_url
        }
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Google OAuth routes
app.get('/api/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  }
);

// GitHub OAuth routes
app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/api/auth/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  }
);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message, timestamp: new Date().toISOString() });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`);
});
