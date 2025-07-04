const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

    let user = await prisma.user.findUnique({
      where: { githubId: profile.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: profile.id,
          email,
          name: profile.displayName || profile.username,
          avatarUrl: profile._json.avatar_url,
        }
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
