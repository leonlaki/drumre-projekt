const mealDB = require("../config/mealdb");

// 1. BY NAME
const searchMealsByName = async (query) => {
  const { data } = await mealDB.get(`/search.php?s=${query}`);
  return data.meals || [];
};

// 2. BY CATEGORY
const filterMealsByCategory = async (category) => {
  const { data } = await mealDB.get(`/filter.php?c=${category}`);
  return data.meals || [];
};

// 3. BY AREA (country)
const filterMealsByArea = async (area) => {
  const { data } = await mealDB.get(`/filter.php?a=${area}`);
  return data.meals || [];
};

//vjerojatno nece trebati
// 4. BY ID (detalji)
const getMealById = async (id) => {
  const { data } = await mealDB.get(`/lookup.php?i=${id}`);
  return data.meals ? data.meals[0] : null;
};

// 5. HELPERS
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

const intersectMeals = (...lists) => {
  if (lists.length === 0) return [];

  return lists.reduce((acc, list) =>
    acc.filter(meal =>
      list.some(m => m.idMeal === meal.idMeal)
    )
  );
};

const getFullMealsByIds = async (ids, limit = 10) => {
  const uniqueIds = [...new Set(ids)].slice(0, limit);

  const requests = uniqueIds.map(id =>
    getMealById(id)
  );

  const meals = await Promise.all(requests);
  return meals.filter(Boolean);
};

const getAllCategories = async () => {
  const { data } = await mealDB.get("/list.php?c=list");
  return data.meals || [];
};

// LIST ALL AREAS (COUNTRIES)
const getAllAreas = async () => {
  const { data } = await mealDB.get("/list.php?a=list");
  return data.meals || [];
};


module.exports = {
  searchMealsByName,
  filterMealsByCategory,
  filterMealsByArea,
  getMealById,
  extractIngredients,
  intersectMeals,
  getFullMealsByIds,
  getAllCategories,
  getAllAreas
};
