const express = require("express");
const {
  searchRecipes,
  saveRecipe,
  rateRecipe,
  getAllRecipes,
} = require("../controller/recipeController");

const { ensureAuth } = require("../middleware/authMiddleware");

const router = express.Router();

//PUBLIC
router.get("/search", searchRecipes);
router.get("/", getAllRecipes);

//SECURED
router.post("/save", ensureAuth, saveRecipe);
router.post("/:id/rate", ensureAuth, rateRecipe);

module.exports = router;
