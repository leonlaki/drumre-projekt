const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Playlist = require("../models/Playlist");

// 1. DOHVATI PROFIL KORISNIKA (JAVNO)
// GET /api/users/:username
const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    // Pronađi korisnika, ali izbaci osjetljive podatke (password, email...)
    const user = await User.findOne({ username }).select(
      "-password -googleId -facebookId -email"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- AGREGACIJA STATISTIKE ---
    // Paralelno brojimo recepte i playliste ovog korisnika
    // Ovo služi da na profilu piše npr: "15 Recipes | 4 Playlists"
    const [recipeCount, playlistCount] = await Promise.all([
      Recipe.countDocuments({ author: user._id }),
      Playlist.countDocuments({ user: user._id }),
    ]);

    // Vraćamo podatke o korisniku + statistiku
    res.json({
      profile: user,
      stats: {
        recipes: recipeCount,
        playlists: playlistCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// 2. AŽURIRAJ MOJ PROFIL (SAMO VLASNIK)
// PUT /api/users/profile
const updateMyProfile = async (req, res) => {
  // req.user je postavljen od strane ensureAuth middleware-a
  const userId = req.user._id;
  const { bio, location, website, avatar, name } = req.body;

  try {
    // Ažuriraj podatke
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        bio,
        location,
        website,
        avatar,
        name,
      },
      { new: true, runValidators: true }
    ).select("-password -googleId -facebookId");

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

module.exports = { getUserProfile, updateMyProfile };
