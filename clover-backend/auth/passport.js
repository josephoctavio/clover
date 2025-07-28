const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User'); // adjust path if needed


passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  'http://localhost:5000/api/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // Build a sanitized username from the Google displayName
    let name = profile.displayName
      .replace(/\s+/g, '_')            // spaces → underscores
      .replace(/[^A-Za-z0-9_-]/g, '')  // remove disallowed chars
      .slice(0, 15);                   // max length 15

    // Fallback to email local-part if sanitization yields empty
    if (!name) {
      name = email.split('@')[0].slice(0, 15);
    }

    let user = await User.findOne({ email });

    if (user) {
      // Link googleId if not already linked
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
    } else {
      // Create a new user with the sanitized, truncated username
      user = await User.create({
        googleId: profile.id,
        email,
        username: name,
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
}, async (accessToken, refreshToken, profile, done) => {
  try {
    //  Only match by GitHub ID — do NOT merge by email
    let user = await User.findOne({ githubId: profile.id });

    if (!user) {
      // Sanitize + truncate GitHub displayName or fallback to profile.username
      let name = (profile.displayName || profile.username)
        .replace(/\s+/g, '_')
        .replace(/[^A-Za-z0-9_-]/g, '')
        .slice(0, 15);
      if (!name) name = profile.username.slice(0, 15);

      user = await User.create({
        githubId:   profile.id,
        username:   name,
        isVerified: true
      });

      console.log(' New GitHub user created:', user);
    }

    return done(null, user);
  } catch (err) {
    console.error(' GitHub strategy error:', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
module.exports = passport;