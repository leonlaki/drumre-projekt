const mealDB = require("../config/mealdb");

const searchMealsByName = async (query) => {
  const { data } = await mealDB.get(`/search.php?s=${query}`);
  return data.meals || [];
};

const getMealById = async (id) => {
  const { data } = await mealDB.get(`/lookup.php?i=${id}`);
  return data.meals ? data.meals[0] : null;
};

const extractIngredients = (meal) => {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push(`${ingredient} - ${measure}`);
    }
  }

  return ingredients;
};

module.exports = {
  searchMealsByName,
  getMealById,
  extractIngredients
};