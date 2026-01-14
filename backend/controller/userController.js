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
    // Sada brojimo i Obroke (Meals) jer su oni glavni na profilu
    const [recipeCount, playlistCount, mealCount] = await Promise.all([
      Recipe.countDocuments({ author: user._id }),
      Playlist.countDocuments({ user: user._id }),
      Meal.countDocuments({ author: user._id }), // <--- NOVO
    ]);

    res.json({
      profile: user,
      stats: {
        recipes: recipeCount,
        playlists: playlistCount,
        meals: mealCount, // <--- NOVO
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

module.exports = { getUserProfile, updateMyProfile };
