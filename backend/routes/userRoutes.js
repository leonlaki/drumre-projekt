const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateMyProfile,
} = require("../controller/userController");

const { 
  getOnboardingOptions, 
  saveUserPreferences, 
  getMealDBRecommendations 
} = require("../controller/onboardingController");

const { ensureAuth } = require("../middleware/authMiddleware");

// --- JAVNE RUTE ---
router.get("/onboarding/options", getOnboardingOptions); // Dohvati listu opcija
router.get("/:username", getUserProfile);

// --- ZAŠTIĆENE RUTE ---
router.put("/profile", ensureAuth, updateMyProfile);
router.post("/onboarding/save", ensureAuth, saveUserPreferences); // Spremi odabir
router.get("/recommendations/external", ensureAuth, getMealDBRecommendations); // Dohvati preporuke

module.exports = router;