const Recipe = require("../models/Recipe");
const User = require("../models/User");

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
  const { id } = req.params; // ID recepta
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const isSaved = user.savedRecipes.includes(id);

    if (isSaved) {
      // Ako je već spremljen, makni ga
      user.savedRecipes = user.savedRecipes.filter(r => r.toString() !== id);
    } else {
      // Ako nije, dodaj ga
      user.savedRecipes.push(id);
    }

    await user.save();
    res.json({ message: isSaved ? "Recept uklonjen" : "Recept spremljen", isSaved: !isSaved });
  } catch (error) {
    res.status(500).json({ message: "Greška pri spremanju recepta" });
  }
};

// NOVO: Dohvati sve spremljene recepte
const getSavedRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedRecipes",
      populate: { path: "author", select: "username avatar" } // Da vidimo čiji je recept
    });
    
    res.json(user.savedRecipes);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatu spremljenih recepata" });
  }
};

module.exports = {
  saveRecipe,
  getUserRecipes,
  updateRecipe,
  deleteRecipe,
  toggleSaveRecipe,
  getSavedRecipes
};
