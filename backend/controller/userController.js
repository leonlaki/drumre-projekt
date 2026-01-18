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

    // --- 1. AGREGACIJA STATISTIKE (POPRAVLJENO) ---
    const engagementStats = await Meal.aggregate([
      { $match: { author: user._id } },
      
      // Prvo moramo "odmotati" sve ocjene da ih možemo zbrojiti
      // Ali oprez: ako event nema ocjena, on nestane nakon unwinda.
      // Zato koristimo facet ili group pa project.
      
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$viewCount" },
          totalMeals: { $sum: 1 },
          // Zbrajamo sve ocjene iz svih arraya
          allRatings: { $push: "$ratings.value" } 
        }
      },
      {
        $project: {
          totalViews: 1,
          totalMeals: 1,
          // Flatten array arrayeva u jedan veliki array brojeva
          flatRatings: { 
            $reduce: {
              input: "$allRatings",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },
      {
        $project: {
          totalViews: 1,
          totalVotes: { $size: "$flatRatings" }, // Ukupan broj glasova
          avgRatingSum: { $avg: "$flatRatings" } // Pravi prosjek svih glasova ikad
        }
      }
    ]);

    const statsResult = engagementStats[0] || { totalViews: 0, totalVotes: 0, avgRatingSum: 0 };


    // --- 2. DOHVAT EVENATA (POPRAVLJEN POPULATE) ---
    // Frontend (EventCard) treba cijeli author objekt (avatar), a ne samo ID.
    // .populate("author") bi trebao raditi, ali provjerimo.

    // 2.1. MOJI EVENTI
    // Moramo izračunati averageRating za svaki event da bi se prikazao na kartici
    const myEvents = await Meal.aggregate([
      { $match: { author: user._id } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $addFields: {
          averageRating: { 
             $cond: { 
               if: { $gt: [{ $size: "$ratings" }, 0] },
               then: { $avg: "$ratings.value" },
               else: 0 
             }
           },
           viewCount: { $ifNull: ["$viewCount", 0] }
        }
      },
      // Projekcija za sigurnost (da ne šaljemo passworde)
      {
        $project: {
          title: 1, image: 1, createdAt: 1, averageRating: 1, viewCount: 1,
          "author.username": 1, "author.avatar": 1, "author._id": 1,
          // Dodaj ostala polja koja EventCard treba
          ratings: 1 
        }
      }
    ]);

    // 2.2. SUDJELOVANJA
    const participatingEvents = await Meal.aggregate([
      { 
        $match: {
          participants: user._id,
          author: { $ne: user._id } 
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $addFields: {
          averageRating: { 
             $cond: { 
               if: { $gt: [{ $size: "$ratings" }, 0] },
               then: { $avg: "$ratings.value" },
               else: 0 
             }
           }
        }
      },
      {
        $project: {
          title: 1, image: 1, createdAt: 1, averageRating: 1, viewCount: 1,
          "author.username": 1, "author.avatar": 1, "author._id": 1,
          ratings: 1
        }
      }
    ]);

    res.json({
      profile: user,
      stats: {
        recipes: await Recipe.countDocuments({ author: user._id }),
        meals: await Meal.countDocuments({ author: user._id }), // Koristimo count za brzi info
        views: statsResult.totalViews,
        likes: statsResult.totalVotes,
        avgRating: statsResult.avgRatingSum || 0
      },
      myEvents, 
      participatingEvents
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
