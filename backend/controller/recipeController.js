const { get } = require("mongoose");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const axios = require("axios");
const mealdbService = require("../services/mealdbService");

// 1. SPREMI NOVI RECEPT (Samo hrana, bez glazbe)
const saveRecipe = async (req, res) => {
  const { title, image, instructions, ingredients, category } = req.body;

  try {
    const recipe = await Recipe.create({
      title,
      image,
      instructions,
      ingredients,
      category,
      author: req.user._id,
    });
    res.status(201).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving recipe" });
  }
};

// 2. DOHVATI MOJE RECEPTE (Za "Moju kuharicu" i dropdown izbornik)
const getUserRecipes = async (req, res) => {
  const { username } = req.params;

  try {
    // Treba nam ID korisnika na temelju username-a
    // Pretpostavimo da frontend šalje username
    const User = require("../models/User");
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Jednostavan find, bez agregacija i statistike
    const recipes = await Recipe.find({ author: user._id })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching recipes" });
  }
};

// 3. AŽURIRAJ RECEPT (Edit tekst, sliku...)
const updateRecipe = async (req, res) => {
  const { id } = req.params;
  const { title, image, instructions, ingredients, category } = req.body;

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    recipe.title = title || recipe.title;
    recipe.image = image || recipe.image;
    recipe.instructions = instructions || recipe.instructions;
    recipe.ingredients = ingredients || recipe.ingredients;
    recipe.category = category || recipe.category;

    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Error updating recipe" });
  }
};

// 4. OBRIŠI RECEPT
const deleteRecipe = async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Not found" });

    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting recipe" });
  }
};

const toggleSaveRecipe = async (req, res) => {
  let { id } = req.params; // Ovo može biti "ext_12345" ili pravi ObjectId
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    let recipeIdToSave = id;

    // --- 1. DETEKCIJA: JE LI OVO VANJSKI RECEPT? ---
    if (id.startsWith("ext_")) {
      const realApiId = id.split("_")[1]; // npr. "52772"

      // Provjerimo postoji li taj recept već u našoj bazi (da ne dupliramo bezveze)
      // Oprez: Tvoja shema nema 'externalId', pa ćemo provjeriti po naslovu + autoru, 
      // ili ćemo jednostavno kreirati novi svaki put (najsigurnije za sad da ne kompliciramo shemu).
      
      // Dohvati detalje s API-ja jer ih trebamo za spremanje u bazu
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${realApiId}`);
      const meal = response.data.meals ? response.data.meals[0] : null;

      if (!meal) {
        return res.status(404).json({ message: "Vanjski recept više ne postoji." });
      }

      // KREIRAJ LOKALNU KOPIJU RECEPTA
      const newRecipe = await Recipe.create({
        title: meal.strMeal,
        image: meal.strMealThumb,
        instructions: meal.strInstructions,
        category: meal.strCategory, // Pazi da odgovara tvojim Enumima (Beef, Chicken...) ili makni enum validaciju
        area: meal.strArea,
        ingredients: getIngredientsFromMeal(meal),
        author: userId, // Dodijeli korisniku koji ga je spremio (ili napravi sistemskog admina)
      });

      // Sada koristimo NOVI ObjectId iz naše baze
      recipeIdToSave = newRecipe._id;
    }

    // --- 2. STANDARDNA LOGIKA SPREMANJA ---
    // Provjeri jel taj ID (sada sigurno ObjectId) već u nizu
    // Moramo pretvoriti u string za usporedbu
    const isSaved = user.savedRecipes.some(r => r.toString() === recipeIdToSave.toString());

    if (isSaved) {
      // Makni ga
      user.savedRecipes = user.savedRecipes.filter((r) => r.toString() !== recipeIdToSave.toString());
    } else {
      // Dodaj ga
      user.savedRecipes.push(recipeIdToSave);
    }

    await user.save();

    // Vraćamo i novi ID frontend-u ako zatreba
    res.json({
      message: isSaved ? "Recept uklonjen" : "Recept spremljen",
      isSaved: !isSaved,
      newId: recipeIdToSave // Korisno za frontend da zna pravi ID
    });

  } catch (error) {
    console.error("Toggle Save Error:", error);
    res.status(500).json({ message: "Greška pri spremanju recepta" });
  }
};

// NOVO: Dohvati sve spremljene recepte
const getSavedRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedRecipes",
      populate: { path: "author", select: "username avatar" }, // Da vidimo čiji je recept
    });

    res.json(user.savedRecipes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Greška pri dohvatu spremljenih recepata" });
  }
};
// Helper za dohvat jedinstvenih vrijednosti
const getUnique = (arr) => [...new Set(arr)].sort();

// 1. DOHVATI SVE FILTERE (DB + API)
const getRecipeFilters = async (req, res) => {
  try {
    // A. Dohvati iz lokalne baze
    const dbAreas = await Recipe.distinct("area");

    // B. Dohvati s TheMealDB (Popis svih Area)
    let apiAreas = [];
    try {
      const response = await axios.get("https://www.themealdb.com/api/json/v1/1/list.php?a=list");
      if (response.data.meals) {
        apiAreas = response.data.meals.map(m => m.strArea);
      }
    } catch (err) {
      console.error("MealDB Area fetch error:", err.message);
    }

    // Spoji i makni duplikate i "Unknown"
    const allAreas = getUnique([...dbAreas, ...apiAreas]).filter(a => a && a !== "Unknown");

    res.json({ areas: allAreas });
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatu filtera" });
  }
};

// 2. SEARCH & DISCOVERY (Napredno filtriranje)
const searchRecipes = async (req, res) => {
  const { query, categories, areas, usePreferences } = req.query;
  const currentUserId = req.user._id;

  try {
    // --- 1. PRIPREMA FILTERA ---
    let categoryList = categories ? (Array.isArray(categories) ? categories : [categories]) : [];
    let areaList = areas ? (Array.isArray(areas) ? areas : [areas]) : [];

    // Dodaj preference korisnika ako je traženo
    if (usePreferences === 'true') {
       const user = await User.findById(currentUserId);
       if (user.preferences) {
         if (user.preferences.categories) categoryList = [...new Set([...categoryList, ...user.preferences.categories])];
         if (user.preferences.areas) areaList = [...new Set([...areaList, ...user.preferences.areas])];
       }
    }

    // --- 2. PRETRAGA LOKALNE BAZE (MongoDB) ---
    const dbQuery = { author: { $ne: currentUserId } };

    if (query && query.trim() !== "") {
      dbQuery.title = { $regex: query, $options: "i" };
    }
    if (categoryList.length > 0) {
      dbQuery.category = { $in: categoryList };
    }
    if (areaList.length > 0) {
      dbQuery.area = { $in: areaList };
    }

    let localResults = [];
    
    // Discovery Mode (Prazan upit i bez filtera) -> Random lokalni
    const isDiscoveryMode = (!query || query === "") && categoryList.length === 0 && areaList.length === 0;

    if (isDiscoveryMode) {
      localResults = await Recipe.aggregate([
        { $match: { author: { $ne: currentUserId } } },
        { $sample: { size: 10 } },
        { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
        { $unwind: "$author" },
        { $project: { "author.password": 0, "author.email": 0 } }
      ]);
    } else {
      localResults = await Recipe.find(dbQuery)
        .populate("author", "username avatar")
        .limit(20);
    }

    // --- 3. PRETRAGA API-ja (MealDB) ---
    let apiResults = [];

    try {
      let url = "";
      
      // A) Ako ima teksta (BILO KOJA DUŽINA, maknuli smo limit > 2)
      if (query && query.trim().length > 0) {
        url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
      } 
      // B) Ako nema teksta, ali ima kategorija -> Filtriraj po prvoj kategoriji
      else if (categoryList.length > 0) {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryList[0]}`;
      } 
      // C) Ako nema teksta, ali ima država -> Filtriraj po prvoj državi
      else if (areaList.length > 0) {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${areaList[0]}`;
      } 
      // D) DISCOVERY MODE (0 slova, bez filtera) -> Daj mi nešto s API-ja da nije prazno
      else {
        // MealDB nema "list all", pa možemo tražiti sve na slovo 'b' ili 'c' kao fallback
        // ili koristiti random.php (ali on vraća samo 1 jelo).
        // Najbolji trik za "puno jela" je search po čestom slovu.
        url = `https://www.themealdb.com/api/json/v1/1/search.php?s=b`; 
      }

      if (url) {
        const response = await axios.get(url);
        const meals = response.data.meals;

        if (meals) {
          apiResults = meals.map(meal => ({
            _id: `ext_${meal.idMeal}`,
            title: meal.strMeal,
            image: meal.strMealThumb,
            category: meal.strCategory, 
            area: meal.strArea,         
            instructions: meal.strInstructions || "Instructions available via detailed view.",
            ingredients: getIngredientsFromMeal(meal), 
            author: { username: "MealDB", avatar: "https://www.themealdb.com/images/logo-small.png" },
            isExternal: true
          }));
        }
      }
    } catch (err) {
      console.error("API Fetch error:", err.message);
    }

    // --- 4. JS FILTRIRANJE API REZULTATA ---
    // (API endpoint filter.php vraća jela, ali ne podržava multi-filter, pa to radimo ovdje)
    
    if (categoryList.length > 0) {
      // Filtriramo samo ako API rezultat ima tu kategoriju (neki endpointi ne vraćaju kategoriju u responseu, ali search.php vraća)
      apiResults = apiResults.filter(r => !r.category || categoryList.includes(r.category));
    }
    if (areaList.length > 0) {
      apiResults = apiResults.filter(r => !r.area || areaList.includes(r.area));
    }

    // Spajanje i shuffle
    const combined = [...localResults, ...apiResults];
    const shuffled = combined.sort(() => 0.5 - Math.random()).slice(0, 20);

    res.json(shuffled);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri pretrazi" });
  }
};

// Helper za vađenje sastojaka iz MealDB objekta
function getIngredientsFromMeal(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim() !== "") {
      ingredients.push({ name: name, measure: measure || "" });
    }
  }
  return ingredients;
}

const getRecipeById = async (req, res) => {
  const { id } = req.params;

  try {
    // A) PROVJERA: JE LI RECEPT S MEALDB-a? (ID počinje s "ext_")
    if (id.startsWith("ext_")) {
      const realId = id.split("_")[1]; // Mičemo "ext_" prefix (npr. "ext_52772" -> "52772")
      
      // Pozivamo postojeću funkciju iz tvog servisa
      const meal = await mealdbService.getMealById(realId);

      if (!meal) {
        return res.status(404).json({ message: "Vanjski recept nije pronađen." });
      }

      // Moramo mapirati podatke da izgledaju isto kao naši iz baze (MongoDB)
      // Koristimo postojeći helper 'getIngredientsFromMeal' koji već imaš u ovom fileu
      const formattedRecipe = {
        _id: id, // Vraćamo originalni "ext_..." ID
        title: meal.strMeal,
        image: meal.strMealThumb,
        instructions: meal.strInstructions,
        category: meal.strCategory,
        area: meal.strArea,
        ingredients: getIngredientsFromMeal(meal), // Tvoj helper funkcija na dnu filea
        author: { 
          username: "MealDB", 
          avatar: "https://www.themealdb.com/images/logo-small.png" 
        },
        isExternal: true
      };

      return res.json(formattedRecipe);
    }

    // B) AKO NIJE "ext_", ONDA JE LOKALNI (MongoDB)
    const recipe = await Recipe.findById(id).populate("author", "username avatar");

    if (!recipe) {
      return res.status(404).json({ message: "Recept nije pronađen." });
    }

    res.json(recipe);

  } catch (error) {
    console.error("Greška kod dohvata recepta:", error);
    // Ako je greška zbog neispravnog MongoDB ID-a, vraćamo 404
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: "Recept nije pronađen." });
    }
    res.status(500).json({ message: "Greška na serveru." });
  }
};

module.exports = {
  saveRecipe,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
  toggleSaveRecipe,
  searchRecipes,
  getSavedRecipes,
  getRecipeFilters,
  getRecipeById,
};
