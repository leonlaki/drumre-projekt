const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy; // NOVO
const LocalStrategy = require("passport-local").Strategy;       // NOVO
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const getRandomPokemonAvatar = require("../utils/pokemonAvatar");

const generateRandomUsername = async() => {
  const adjectives = ["hungry", "happy", "spicy", "sweet", "lazy", "carzy", "blue", "fast", "cool"];
  const nouns = ["chef", "pasta", "pizza", "spoon", "fork", "tuna", "burger", "noodle"];

  let username;
  let exists = true;

  while(exists) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(100 + Math.random() * 9000);

    username = `${adj}_${noun}_${number}`;
    exists = await User.exists({ username });
  }

  return username;
};


// --- 1. GOOGLE (Postojeće) ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          // Provjera po emailu
          if (profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ email: profile.emails[0].value });
          }
          
          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value,
              avatar: await getRandomPokemonAvatar(),
              username: await generateRandomUsername(),
            });
          }
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// --- 2. FACEBOOK (NOVO) ---
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'photos', 'email'] // Ovo je obavezno za FB
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });
        
        if (!user) {
          // Pazi: Facebook nekad ne vrati email (npr. ako je user regan mobitelom)
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

          if (email) {
             user = await User.findOne({ email: email });
          }

          if (user) {
            user.facebookId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              facebookId: profile.id,
              name: profile.displayName,
              email: email,
              avatar: await getRandomPokemonAvatar(),
              username: await generateRandomUsername(),
            });
          }
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// --- 3. LOCAL (Username/Password) ---
passport.use(
  new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if(!user) {
          return done(null, false, { message: 'Korisnik ne postoji.' });
        }

        if(!user.password) {
          return done(null, false, {
            message: 'Prijavite se putem Googlea ili Facebooka.',
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
          return done(null, false, { message: 'Kriva lozinka.' });
        }

        return done(null, user);
      } catch(err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;