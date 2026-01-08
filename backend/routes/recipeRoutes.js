const express = require("express");
const {
  searchRecipes,
  saveRecipe,
  rateRecipe,
  getAllRecipes
} = require("../controller/recipeController");

const { protect } = require("../middleware/auth");

const router = express.Router();

//PUBLIC
router.get("/search", searchRecipes);
router.get("/", getAllRecipes);

//SECURED
router.post("/save", protect, saveRecipe);
router.post("/:id/rate", protect, rateRecipe);

module.exports = router;