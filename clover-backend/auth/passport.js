const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // adjust path if needed

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  'http://localhost:5000/api/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
    } else {
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

module.exports = passport;
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.create({
        githubId: profile.id,
        name: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value || '',
        avatar: profile.photos?.[0]?.value || '',
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
