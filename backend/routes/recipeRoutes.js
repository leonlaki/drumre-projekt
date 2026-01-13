const express = require("express");
const {
  saveRecipe,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
} = require("../controller/recipeController");

const { ensureAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// --- JAVNE RUTE ---
router.get("/user/:username", getUserRecipes);

// --- ZAŠTIĆENE RUTE ---
router.post("/", ensureAuth, saveRecipe);
router.put("/:id", ensureAuth, updateRecipe);
router.delete("/:id", ensureAuth, deleteRecipe);

module.exports = router;
