const Meal = require("../models/Meal");
const User = require("../models/User");
const EventInvite = require("../models/EventInvite");

// 1. KREIRAJ OBROK (EVENT)
const createMeal = async (req, res) => {
  const { title, description, courses, playlistId, date, location, image, participants } = req.body;

  if (!courses || courses.length === 0) {
    return res.status(400).json({ message: "Event mora imati barem jedan slijed!" });
  }

  try {
    let meal = await Meal.create({
      title,
      description,
      image,
      courses,
      playlist: playlistId || null,
      author: req.user._id,
      date: date || new Date(),
      location: location || "Kod autora",
      participants: [req.user._id]
    });

    if (participants && participants.length > 0) {
      const guestsToInvite = participants.filter(id => id.toString() !== req.user._id.toString());
      const invites = guestsToInvite.map(guestId => ({
        from: req.user._id,
        to: guestId,
        meal: meal._id,
        status: 'pending'
      }));
      if (invites.length > 0) {
        await EventInvite.insertMany(invites);
      }
    }
    
    meal = await meal.populate("author", "username avatar");
    res.status(201).json(meal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri kreiranju eventa" });
  }
};

// 2. FEED (TRENDING OBROCI) - OVO JE RADILO DOBRO
const getWeeklyMealFeed = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const feed = await Meal.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $addFields: {
          voteCount: { $size: "$ratings" },
          averageRating: { $avg: "$ratings.value" }, // Ovo je ključna linija
          commentCount: { $size: "$comments" },
        },
      },
      { $sort: { voteCount: -1 } },
      { $limit: 15 },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author", 
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          title: 1,
          description: 1,
          image: 1,
          createdAt: 1,
          voteCount: 1,
          averageRating: 1,
          commentCount: 1,
          viewCount: 1,
          author: { 
             username: 1, 
             avatar: 1, 
             _id: 1 
          }
        },
      },
    ]);

    res.json(feed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching meal feed" });
  }
};

// 3. DOHVATI OBROKE KORISNIKA
const getUserMeals = async (req, res) => {
  const { username } = req.params;
  const { sort } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let sortStage = {};
    if (sort === "newest") {
      sortStage = { createdAt: -1 };
    } else {
      sortStage = { voteCount: -1, averageRating: -1 };
    }

    const meals = await Meal.aggregate([
      { $match: { author: user._id } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails"
        }
      },
      { $unwind: "$authorDetails" }, 
      {
        $addFields: {
          voteCount: { $size: "$ratings" },
          averageRating: { $avg: "$ratings.value" }, // Računamo uživo
          commentCount: { $size: "$comments" },
        },
      },
      { $sort: sortStage },
      {
        $lookup: {
          from: "playlists",
          localField: "playlist",
          foreignField: "_id",
          as: "playlistDetails",
        },
      },
      { $unwind: "$courses" },
      {
        $lookup: {
          from: "recipes",
          localField: "courses.recipe",
          foreignField: "_id",
          as: "courses.recipeDetails",
        },
      },
      {
        $unwind: {
          path: "$courses.recipeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          image: { $first: "$image" },
          createdAt: { $first: "$createdAt" },
          author: { 
            $first: { 
              username: "$authorDetails.username", 
              avatar: "$authorDetails.avatar",
              _id: "$authorDetails._id"
            } 
          },
          playlistDetails: { $first: "$playlistDetails" },
          voteCount: { $first: "$voteCount" },
          averageRating: { $first: "$averageRating" }, // Prenosimo izračunatu vrijednost
          commentCount: { $first: "$commentCount" },
          viewCount: { $first: "$viewCount" },
          courses: { $push: "$courses" },
        },
      },
      {
        $unwind: { path: "$playlistDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          title: 1,
          description: 1,
          image: 1,
          createdAt: 1,
          voteCount: 1,
          averageRating: 1,
          commentCount: 1,
          viewCount: 1,
          author: 1,
          "playlistDetails.name": 1,
          courses: {
            courseType: 1,
            recipeDetails: { title: 1, image: 1, _id: 1 },
          },
        },
      },
    ]);

    res.json(meals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user meals" });
  }
};

// ... commentOnMeal, rateMeal, incrementViewCount, incrementShareCount, getMealDetails ...
// (Ostavi ih iste kao prije, nisu se mijenjali u logici prikaza)
const commentOnMeal = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  try {
    const meal = await Meal.findById(id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    meal.comments.push({ user: req.user._id, text: text });
    await meal.save();
    res.json(meal);
  } catch (err) { res.status(500).json({ message: "Error posting comment" }); }
};

const rateMeal = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  try {
    const meal = await Meal.findById(id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    const prevIndex = meal.ratings.findIndex(r => r.user.toString() === req.user._id.toString());
    if (prevIndex !== -1) meal.ratings.splice(prevIndex, 1);
    meal.ratings.push({ user: req.user._id, value: Number(value) });
    await meal.save();
    res.json(meal);
  } catch (error) { res.status(500).json({ message: "Error rating meal" }); }
};

const incrementViewCount = async (req, res) => {
  try {
    await Meal.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.status(200).send();
  } catch (error) { res.status(500).json({ message: "Greška" }); }
};

const incrementShareCount = async (req, res) => {
  try {
    await Meal.findByIdAndUpdate(req.params.id, { $inc: { shareCount: 1 } });
    res.status(200).send();
  } catch (error) { res.status(500).json({ message: "Greška" }); }
};

const getMealDetails = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id)
      .populate("author", "username avatar")
      .populate("playlist")
      .populate("courses.recipe")
      .populate("comments.user", "username avatar");
    if (!meal) return res.status(404).json({ message: "Obrok nije pronađen" });
    res.json(meal);
  } catch (error) { res.status(500).json({ message: "Greška" }); }
};

// --- POPRAVLJEN SEARCH MEALS ---
const searchMeals = async (req, res) => {
  const { query, page = 1, limit = 20, sort = 'newest' } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      { $unwind: "$authorDetails" },
      { $unwind: "$courses" },
      {
        $lookup: {
          from: "recipes",
          localField: "courses.recipe",
          foreignField: "_id",
          as: "courseRecipeDetails",
        },
      },
      { $unwind: "$courseRecipeDetails" },
      
      // Grupiranje natrag
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          image: { $first: "$image" },
          author: { $first: "$authorDetails" },
          createdAt: { $first: "$createdAt" },
          ratings: { $first: "$ratings" }, // Čuvamo niz ocjena
          // OVDJE JE BIO PROBLEM: Čitao si polje iz baze koje je možda 0
          // averageRating: { $first: "$averageRating" }, 
          viewCount: { $first: "$viewCount" },
          recipeNames: { $push: "$courseRecipeDetails.title" },
        },
      },

      // --- NOVO: Računamo prosjek uživo ---
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
      }
    ];

    if (query && query.trim() !== "") {
      const regex = new RegExp(query, "i");
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: regex } },
            { "author.username": { $regex: regex } },
            { recipeNames: { $elemMatch: { $regex: regex } } },
          ],
        },
      });
    }

    let sortStage = { createdAt: -1 };
    if (sort === 'popular') {
      sortStage = { viewCount: -1 };
    }
    pipeline.push({ $sort: sortStage });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const results = await Meal.aggregate(pipeline);
    res.json(results);
  } catch (error) {
    console.error("Search meals error:", error);
    res.status(500).json({ message: "Greška pri pretrazi eventova" });
  }
};

// --- POPRAVLJEN RECOMMENDED MEALS ---
const getRecommendedMeals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.preferences || 
       (user.preferences.categories.length === 0 && user.preferences.areas.length === 0)) {
       const random = await Meal.aggregate([{ $sample: { size: 15 } }]);
       const populated = await User.populate(random, { path: "author", select: "username avatar" });
       return res.json(populated);
    }

    const { categories, areas } = user.preferences;

    const recommendations = await Meal.aggregate([
      { $unwind: "$courses" },
      {
        $lookup: {
          from: "recipes",
          localField: "courses.recipe",
          foreignField: "_id",
          as: "recipeDetails"
        }
      },
      { $unwind: "$recipeDetails" },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          image: { $first: "$image" },
          authorId: { $first: "$author" },
          viewCount: { $first: "$viewCount" },
          createdAt: { $first: "$createdAt" },
          ratings: { $first: "$ratings" }, // Čuvamo ocjene
          
          // OVDJE JE FALIO averageRating! 
          // Nisi ga uopće imao u $group fazi, pa se izgubio.
          
          score: {
            $sum: {
              $add: [
                { $cond: [{ $in: ["$recipeDetails.category", categories] }, 1, 0] },
                { $cond: [{ $in: ["$recipeDetails.area", areas] }, 1, 0] }
              ]
            }
          }
        }
      },
      
      // --- NOVO: Računamo prosjek uživo ---
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

      { $match: { score: { $gt: 0 } } },
      { $sort: { score: -1 } },
      { $limit: 15 },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" }
    ]);

    res.json(recommendations);

  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Greška pri dohvatu preporuka" });
  }
};

const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Event nije pronađen" });
    if (meal.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Niste autor" });
    await meal.deleteOne();
    res.json({ message: "Event obrisan" });
  } catch (error) { res.status(500).json({ message: "Greška" }); }
};

const leaveMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Event nije pronađen" });
    meal.participants = meal.participants.filter(id => id.toString() !== req.user._id.toString());
    await meal.save();
    res.json({ message: "Napustili ste event" });
  } catch (error) { res.status(500).json({ message: "Greška" }); }
};

module.exports = {
  createMeal,
  getWeeklyMealFeed,
  getUserMeals,
  commentOnMeal,
  rateMeal,
  incrementViewCount,
  incrementShareCount,
  getMealDetails,
  searchMeals,
  getRecommendedMeals,
  deleteMeal, 
  leaveMeal,
};