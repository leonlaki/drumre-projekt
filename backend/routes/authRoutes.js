const express = require("express");
const passport = require("passport");
const { registerUser, setUsername } = require("../controller/authController"); // Dodali smo setUsername
const { ensureAuth } = require("../middleware/authMiddleware"); // Middleware za zaštitu

const router = express.Router();

// --- LOCAL AUTH ---
router.post("/register", registerUser);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "Login uspješan", user });
    });
  })(req, res, next);
});

// --- Postavljanje usernamea ---
// Ovu rutu frontend zove sa stranice /complete-profile
router.post("/set-username", ensureAuth, setUsername);

// --- SOCIAL LOGIN LOGIKA (ZAJEDNIČKA FUNKCIJA) ---
const handleSocialCallback = (req, res) => {
  // Ako korisnik nema username (novi Google/FB user)
  if (!req.user.username) {
    // Šaljemo ga na frontend formu za unos username-a
    res.redirect("http://localhost:5173/complete-profile");
  } else {
    res.redirect("http://localhost:5173/");
  }
};

// --- FACEBOOK AUTH ---
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    session: true,
  }),
  handleSocialCallback
);

// --- GOOGLE AUTH ---
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: true }),
  handleSocialCallback
);

// --- OSTALO ---

//LOGOUT MORA SE COOKIE UNISTITI KADA SE KORISNIK ODJAVI!!!!
/*
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});
*/

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
});


router.get("/user", (req, res) => {
  res.json(req.user || null);
});

module.exports = router;
