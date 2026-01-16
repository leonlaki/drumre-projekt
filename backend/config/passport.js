const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const axios = require("axios");
const User = require("../models/User");
const getRandomPokemonAvatar = require("../utils/pokemonAvatar");

// Pomoćna funkcija za generiranje random username-a
const generateRandomUsername = async () => {
  const adjectives = [
    "hungry",
    "happy",
    "spicy",
    "sweet",
    "lazy",
    "crazy",
    "blue",
    "fast",
    "cool",
  ];
  const nouns = [
    "chef",
    "pasta",
    "pizza",
    "spoon",
    "fork",
    "tuna",
    "burger",
    "noodle",
  ];

  let username;
  let exists = true;

  while (exists) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(100 + Math.random() * 9000);

    username = `${adj}_${noun}_${number}`;
    exists = await User.exists({ username });
  }

  return username;
};

// --- 1. GOOGLE STRATEGY ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          if (profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ email: profile.emails[0].value });
          }

          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              facebookId: profile.id,
              name: profile.displayName,
              email: email,
              avatar: await getRandomPokemonAvatar(),
              username: await generateRandomUsername(),
              preferences: {
                categories: extractedPreferences,
                areas: [],
              },
              isOnboarded: false,
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

// --- 2. FACEBOOK STRATEGY (MEALDB MAPPING) ---
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
      scope: ["email", "user_likes"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(`Facebook login initiated for: ${profile.displayName}`);

        // --- A) DOHVAT STVARNIH LAJKOVA ---
        let extractedPreferences = [];
        let fbLikes = [];

        try {
          const likesResponse = await axios.get(
            `https://graph.facebook.com/v19.0/${profile.id}/likes`,
            {
              params: {
                fields: "name,category",
                limit: 100,
                access_token: accessToken,
              },
            }
          );

          fbLikes = likesResponse.data.data || [];
          console.log(
            `✅ Uspješno dohvaćeno ${fbLikes.length} stvarnih lajkova.`
          );
        } catch (apiError) {
          if (apiError.response) {
            console.error(
              "❌ FACEBOOK API GREŠKA:",
              apiError.response.status,
              apiError.response.data
            );
          } else {
            console.error("Greška pri pozivu:", apiError.message);
          }
        }

        // --- B) MAPIRANJE U MEALDB KATEGORIJE ---
        // Ciljamo MealDB kategorije: Beef, Chicken, Dessert, Pasta, Seafood, Vegan, Vegetarian, Breakfast
        if (fbLikes.length > 0) {
          fbLikes.forEach((like) => {
            const name = like.name.toLowerCase();
            const category = like.category.toLowerCase();

            // 1. FAST FOOD & PILETINA -> CHICKEN / BEEF
            if (
              name.includes("kfc") ||
              name.includes("chicken") ||
              name.includes("piletina")
            ) {
              extractedPreferences.push("Chicken");
            }
            if (
              name.includes("mcdonalds") ||
              name.includes("burger") ||
              name.includes("king")
            ) {
              extractedPreferences.push("Beef");
            }

            // 2. SLATKO -> DESSERT
            if (
              name.includes("chocolate") ||
              name.includes("cake") ||
              name.includes("milka") ||
              name.includes("nesquik") ||
              name.includes("skittles") ||
              name.includes("starbucks") ||
              name.includes("candy") ||
              name.includes("slatko") ||
              category.includes("dessert") ||
              category.includes("slastičarna") ||
              category.includes("bakery")
            ) {
              extractedPreferences.push("Dessert");
            }

            // 3. PIĆA I DORUČAK -> BREAKFAST
            if (
              name.includes("coffee") ||
              category.includes("cafe") ||
              category.includes("kava") ||
              name.includes("tea") ||
              category.includes("piće")
            ) {
              extractedPreferences.push("Breakfast");
            }

            // 4. SPORTAŠI -> PASTA & BEEF (Protein & Carbs)
            if (
              category.includes("sport") ||
              name.includes("gym") ||
              name.includes("fitness") ||
              name.includes("dinamo") ||
              name.includes("nba") ||
              name.includes("nogomet") ||
              name.includes("adidas") ||
              name.includes("nike")
            ) {
              extractedPreferences.push("Beef");
              extractedPreferences.push("Pasta");
            }

            // 5. IT / GAMING -> MISCELLANEOUS / SNACK
            if (
              name.includes("gaming") ||
              name.includes("fortnite") ||
              name.includes("lol") ||
              category.includes("računala") ||
              category.includes("videoigra")
            ) {
              extractedPreferences.push("Miscellaneous");
            }

            // 6. ZDRAVLJE -> VEGETARIAN
            if (
              name.includes("zdravlje") ||
              name.includes("bio") ||
              name.includes("organic") ||
              name.includes("vege")
            ) {
              extractedPreferences.push("Vegetarian");
            }
          });

          // Ukloni duplikate
          extractedPreferences = [...new Set(extractedPreferences)];
          console.log("MealDB Kategorije za pretragu:", extractedPreferences);
        }

        // --- C) SPREMANJE / AŽURIRANJE KORISNIKA ---
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;
          if (email) {
            user = await User.findOne({ email: email });
          }

          if (user) {
            // Postojeći user - povezujemo FB
            user.facebookId = profile.id;
            // Dodajemo nove preferencije na postojeće
            if (extractedPreferences.length > 0) {
              user.preferences.categories = [
                ...new Set([
                  ...user.preferences.categories,
                  ...extractedPreferences,
                ]),
              ];
            }
            await user.save();
          } else {
            // NOVI USER
            user = await User.create({
              facebookId: profile.id,
              name: profile.displayName,
              email: email,
              avatar: await getRandomPokemonAvatar(),
              username: await generateRandomUsername(),
              preferences: {
                categories: extractedPreferences,
                areas: [],
              },
              isOnboarded: false,
            });
          }
        } else {
          // User već postoji i logiran je FB-om. Ažuriramo preferencije ako ima novih.
          if (extractedPreferences.length > 0) {
            user.preferences.categories = [
              ...new Set([
                ...user.preferences.categories,
                ...extractedPreferences,
              ]),
            ];
            await user.save();
          }
        }

        done(null, user);
      } catch (error) {
        console.error("Fatal Error in Facebook Strategy:", error);
        done(error, null);
      }
    }
  )
);

// --- 3. LOCAL STRATEGY ---
passport.use(
  new LocalStrategy(
    { usernameField: "username" },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: "Korisnik ne postoji." });
        }

        if (!user.password) {
          return done(null, false, {
            message: "Prijavite se putem Googlea ili Facebooka.",
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Kriva lozinka." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
