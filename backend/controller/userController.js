const axios = require("axios"); //za pokemone
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Playlist = require("../models/Playlist");
const Meal = require("../models/Meal");

// 1. DOHVATI PROFIL KORISNIKA (JAVNO)
const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select(
      "-password -googleId -facebookId -email"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- AGREGACIJA STATISTIKE ---

    // 1. Broj recepata (klasika)
    const recipeCount = await Recipe.countDocuments({ author: user._id });

    // 2. Broj obroka (klasika)
    const mealCount = await Meal.countDocuments({ author: user._id });

    // 3. NAPREDNA STATISTIKA (Zbroj pregleda i lajkova na svim obrocima)
    const engagementStats = await Meal.aggregate([
      // A. Filtriraj: Uzmi samo obroke ovog korisnika
      { $match: { author: user._id } },

      // B. Grupiraj i zbrajaj
      {
        $group: {
          _id: null, // Grupiramo sve u jedan rezultat
          totalViews: { $sum: "$viewCount" }, // Zbroji polje viewCount
          totalLikes: { $sum: { $size: "$ratings" } }, // Zbroji duljinu niza ratings
        },
      },
    ]);

    // Aggregate vraća niz. Ako korisnik nema postova, niz je prazan, pa stavljamo default nule.
    const statsResult = engagementStats[0] || { totalViews: 0, totalLikes: 0 };

    res.json({
      profile: user,
      stats: {
        recipes: recipeCount,
        meals: mealCount,
        views: statsResult.totalViews,
        likes: statsResult.totalLikes,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// 2. AŽURIRAJ MOJ PROFIL
const updateMyProfile = async (req, res) => {
  const userId = req.user._id;
  const { bio, location, website, avatar, name } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { bio, location, website, avatar, name },
      { new: true, runValidators: true }
    ).select("-password -googleId -facebookId");

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

//--Pokemon--

//GET ALL POKEMONS
// GET ALL POKEMONS (Gen 1–5)
const fetchPokemonList = async (req, res) => {
  try {
    // Gen 1–5 = Pokémon #1–649
    const { data } = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=649"
    );

    const pokemons = data.results.map((p, index) => {
      const id = index + 1;

      return {
        id,
        name: p.name,
        avatar: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`,
      };
    });

    res.json(pokemons);
  } catch (err) {
    console.error("fetchPokemonList error:", err);
    res.status(500).json({ message: "Failed to fetch Pokémon list" });
  }
};

//POST - SELECT DESIRED POKEMON
const selectPokemonAvatar = async (req, res) => {
  try {
    const { pokemonId } = req.body;
    const userId = req.user._id;

    if (!pokemonId || pokemonId < 1 || pokemonId > 649) {
      return res.status(400).json({ message: "Invalid Pokémon ID" });
    }

    // Pokémon Black/White animated GIF
    const avatar = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    );

    res.json({
      message: "Avatar updated",
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("selectPokemonAvatar error:", err);
    res.status(500).json({ message: "Failed to update avatar" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    // Ako korisnik nije ništa upisao ili je string prazan, vrati prazan niz
    if (!query || query.trim() === "") {
      return res.json([]);
    }

    // Kreiramo regularni izraz
    // Ovdje ćemo koristiti logiku da traži podudaranje bilo gdje u stringu
    // jer je to korisnije ako netko traži po prezimenu (npr. "Laki" u "Leon Laki")
    const searchRegex = new RegExp(query, "i");

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: searchRegex } },
        { username: { $regex: searchRegex } },
      ],
    })
      .select("name username avatar _id") // Vraćamo samo osnovne podatke
      .limit(10); // Limitiramo na 10 rezultata da ne opteretimo bazu ako je upit "a"

    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Greška pri pretraživanju korisnika" });
  }
};

module.exports = {
  getUserProfile,
  updateMyProfile,
  fetchPokemonList,
  selectPokemonAvatar,
  searchUsers,
};
