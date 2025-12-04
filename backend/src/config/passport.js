import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './index.js';
import { authService } from '../services/authService.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        let user = await authService.findUserByGoogleId(profile.id);

        if (!user) {
          user = await authService.findUserByEmail(email);

          if (user) {
            return done(new Error('Email already registered with password'), undefined);
          }

          user = await authService.createUser({
            email,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            googleId: profile.id,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await authService.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
