const Recipe = require("../models/Recipe");
const {
  searchMealsByName,
  getMealById,
  extractIngredients
} = require("../services/mealdbService");

const searchRecipes = async (req, res) => {
  const meals = await searchMealsByName(req.query.q || "");
  res.json(meals);
};

const saveRecipe = async (req, res) => {
  const meal = await getMealById(req.body.mealId);

  if (!meal) {
    return res.status(404).json({ message: "Meal not found" });
  }

  const ingredients = extractIngredients(meal);

  const recipe = await Recipe.create({
    mealId: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    instructions: meal.strInstructions,
    ingredients,
    author: req.user?.id
  });

  res.status(201).json(recipe);
};

const getAllRecipes = async (req, res) => {
  const recipes = await Recipe.find().sort({ createdAt: -1 });
  res.json(recipes);
};

const rateRecipe = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  recipe.ratings.push({
    user: req.user?.id || null,
    value: req.body.value
  });

  await recipe.save();
  res.json(recipe);
};

module.exports = {
  searchRecipes,
  saveRecipe,
  getAllRecipes,
  rateRecipe
};