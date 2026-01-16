const express = require("express");
const {
  saveRecipe,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
  toggleSaveRecipe, 
  getSavedRecipes,
  searchRecipes,
  getRecipeFilters
} = require("../controller/recipeController");

const { ensureAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// --- JAVNE RUTE ---
router.get("/user/:username", getUserRecipes);

// --- ZAŠTIĆENE RUTE ---
router.post("/", ensureAuth, saveRecipe);
router.put("/:id", ensureAuth, updateRecipe);
router.delete("/:id", ensureAuth, deleteRecipe);
router.get("/saved", ensureAuth, getSavedRecipes); 
router.post("/:id/save", ensureAuth, toggleSaveRecipe);
router.get("/search", ensureAuth, searchRecipes);
router.get("/filters", ensureAuth, getRecipeFilters);

module.exports = router;
