const express = require("express");
const router = express.Router();
const {
  getFacebookRecommendations,
} = require("../controller/fbRecommendationController");

const {
  createMeal,
  getWeeklyMealFeed,
  getUserMeals,
  commentOnMeal,
  rateMeal,
  incrementViewCount,
  incrementShareCount,
  getMealDetails,
  searchMeals,
  getRecommendedMeals,
} = require("../controller/mealController");
const { ensureAuth } = require("../middleware/authMiddleware");

router.get("/search", searchMeals);
// --- JAVNE ---
router.get("/feed", getWeeklyMealFeed);
router.get("/user/:username", getUserMeals);
router.get("/:id", getMealDetails);

// --- ZAŠTIĆENE ---

router.post("/", ensureAuth, createMeal); // Kreiraj novi post (obrok)
router.post("/:id/comment", ensureAuth, commentOnMeal); // Komentiraj
router.post("/:id/rate", ensureAuth, rateMeal); // Ocijeni
router.post("/:id/view", ensureAuth, incrementViewCount); // Povećaj broj pregleda
router.post("/:id/share", ensureAuth, incrementShareCount); // Povećaj broj dijeljenja
router.get("/recommendations/facebook", ensureAuth, getFacebookRecommendations);
router.get("/recommendations/internal", ensureAuth, getRecommendedMeals);


module.exports = router;
