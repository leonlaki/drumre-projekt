const {
  searchMealsByName,
  filterMealsByCategory,
  filterMealsByArea,
  intersectMeals,
  getFullMealsByIds,
  getAllCategories,
  getAllAreas
} = require("../services/mealdbService");

const combinedSearch = async (req, res) => {
  const { name, category, area } = req.query;

  if (!name && !category && !area) {
    return res.status(400).json({
      message: "At least one filter is required",
    });
  }

  try {
    let results = [];

    if(name) {
      results = await searchMealsByName(name);
    }

    if(category) {
      const categoryMeals = await filterMealsByCategory(category);
      results = results.length
        ? intersectMeals(results, categoryMeals)
        : categoryMeals;
    }

    if(area) {
      const areaMeals = await filterMealsByArea(area);
      results = results.length
        ? intersectMeals(results, areaMeals)
        : areaMeals;
    }

    const ids = results.map(meal => meal.idMeal);

    const fullMeals = await getFullMealsByIds(ids);

    res.json(fullMeals);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Search error" });
  }
};

// GET ALL CATEGORIES
const fetchCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// GET ALL AREAS
const fetchAreas = async (req, res) => {
  try {
    const areas = await getAllAreas();
    res.json(areas);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching areas" });
  }
};

module.exports = {
    combinedSearch,
    fetchCategories,
    fetchAreas
};