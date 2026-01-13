const express = require("express");
const router = express.Router();
const {
  createMeal,
  getWeeklyMealFeed,
  commentOnMeal,
  rateMeal,
} = require("../controller/mealController");
const { ensureAuth } = require("../middleware/authMiddleware");

// --- JAVNE ---
router.get("/feed", getWeeklyMealFeed);

// --- ZAŠTIĆENE ---
router.post("/", ensureAuth, createMeal); // Kreiraj novi post (obrok)
router.post("/:id/comment", ensureAuth, commentOnMeal); // Komentiraj
router.post("/:id/rate", ensureAuth, rateMeal); // Ocijeni

module.exports = router;
