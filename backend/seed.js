// backend/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Meal = require("./models/Meal");
const Recipe = require("./models/Recipe");

const MONGO_URI = process.env.MONGO_URI;

// --- RANDOM USERNAME ---
const generateRandomUsername = async () => {
  const adjectives = ["hungry", "spicy", "happy", "lazy", "cool"];
  const nouns = ["chef", "pasta", "pizza", "burger", "tuna", "fork"];

  let username;
  let exists = true;

  while (exists) {
    username =
      adjectives[Math.floor(Math.random() * adjectives.length)] +
      "_" +
      nouns[Math.floor(Math.random() * nouns.length)] +
      "_" +
      Math.floor(100 + Math.random() * 9000);

    exists = await User.exists({ username });
  }

  return username;
};

// --- FETCH RANDOM MEAL ---
const fetchRandomMeal = async () => {
  const res = await axios.get(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  return res.data.meals[0];
};

// --- INGREDIENTS ---
const extractIngredients = (meal) => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(`${ing} - ${measure || ""}`);
    }
  }
  return ingredients;
};

// --- MAIN SEED ---
const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");

  
  await User.deleteMany({});
  await Meal.deleteMany({});
  await Recipe.deleteMany({});

  for (let i = 0; i < 100; i++) {
    const mealDB = await fetchRandomMeal();

    // --- USER ---
    const username = await generateRandomUsername();
    const password = await bcrypt.hash("password123", 10);

    const user = await User.create({
      name: `${mealDB.strArea} Chef`,
      email: `${username}@seed.com`,
      username,
      password,
      avatar: mealDB.strMealThumb,
      isOnboarded: true,
      preferences: {
        categories: [mealDB.strCategory],
        areas: [mealDB.strArea],
      },
    });

    // --- RECIPE ---
    const recipe = await Recipe.create({
      title: mealDB.strMeal,
      image: mealDB.strMealThumb,
      instructions: mealDB.strInstructions,
      ingredients: extractIngredients(mealDB),
      author: user._id,
      category: "Main Course",
    });

    // --- MEAL ---
    await Meal.create({
      title: `${mealDB.strMeal} večera`,
      description: `Inspirirano ${mealDB.strArea} kuhinjom`,
      image: mealDB.strMealThumb,
      author: user._id,
      courses: [
        {
          courseType: "Main Course",
          recipe: recipe._id,
        },
      ],
      averageRating: 0,
      viewCount: Math.floor(Math.random() * 500),
      shareCount: Math.floor(Math.random() * 50),
    });

    console.log(`🍽️ ${i + 1}/100 seeded`);
  }

  console.log("SEEDING DONE!");
  process.exit();
};

seed();