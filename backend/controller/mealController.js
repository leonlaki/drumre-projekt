const Meal = require("../models/Meal");
const User = require("../models/User");
const EventInvite = require("../models/EventInvite");

// 1. KREIRAJ OBROK (EVENT)
// 1. KREIRAJ OBROK (EVENT)
const createMeal = async (req, res) => {
  const { title, description, courses, playlistId, date, location, image, participants } = req.body;

  if (!courses || courses.length === 0) {
    return res.status(400).json({ message: "Event mora imati barem jedan slijed!" });
  }

  try {
    // 1. Kreiraj Meal
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

    // 2. Kreiraj Pozivnice
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
    
    // --- KLJUČNI POPRAVAK: POPULATE PRIJE SLANJA NA FRONTEND ---
    // Frontend očekuje meal.author.avatar, a ne samo ID
    meal = await meal.populate("author", "username avatar");

    res.status(201).json(meal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri kreiranju eventa" });
  }
};

// ... ostatak filea ostaje isti ...

// 2. FEED (TRENDING OBROCI - ZADNJIH 7 DANA)
const getWeeklyMealFeed = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const feed = await Meal.aggregate([
      // A. Filter: Zadnjih 7 dana
      { $match: { createdAt: { $gte: sevenDaysAgo } } },

      // B. Statistika
      {
        $addFields: {
          voteCount: { $size: "$ratings" },
          averageRating: { $avg: "$ratings.value" },
          commentCount: { $size: "$comments" },
        },
      },

      // C. Sortiranje (Najviše lajkova)
      { $sort: { voteCount: -1 } },

      // D. LIMIT
      { $limit: 15 },

      // E. POPULATE (OVDJE JE BILA RAZLIKA)
      // Umjesto "authorDetails", spremamo direktno u "author"
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author", 
        },
      },
      { $unwind: "$author" }, // Sada je author puni objekt

      // F. Projekcija (Čistimo podatke)
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
          // Samo odaberemo polja koja želimo od autora
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

// 3. DOHVATI OBROKE KORISNIKA (ZA PROFIL)
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

      // --- KLJUČNI POPRAVAK: DODAJ PODATKE O AUTORU ---
      // Iako smo na profilu tog usera, EventCard je "glupa" komponenta 
      // i očekuje podatke unutar objekta 'author'
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails"
        }
      },
      { $unwind: "$authorDetails" }, 
      // -----------------------------------------------

      {
        $addFields: {
          voteCount: { $size: "$ratings" },
          averageRating: { $avg: "$ratings.value" },
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
          image: { $first: "$image" }, // Pazi da šalješ i sliku eventa
          createdAt: { $first: "$createdAt" },
          
          // --- DODAJEMO AUTORA U GRUPIRANJE ---
          author: { 
            $first: { 
              username: "$authorDetails.username", 
              avatar: "$authorDetails.avatar",
              _id: "$authorDetails._id"
            } 
          },
          // ------------------------------------

          playlistDetails: { $first: "$playlistDetails" },
          voteCount: { $first: "$voteCount" },
          averageRating: { $first: "$averageRating" },
          commentCount: { $first: "$commentCount" },
          viewCount: { $first: "$viewCount" }, // Dodaj viewCount
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
          author: 1, // <--- OVO JE BITNO
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

// 4. KOMENTIRAJ
const commentOnMeal = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const meal = await Meal.findById(id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    meal.comments.push({ user: req.user._id, text: text });
    await meal.save();
    res.json(meal);
  } catch (err) {
    res.status(500).json({ message: "Error posting comment" });
  }
};

// 5. OCIJENI
const rateMeal = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  try {
    const meal = await Meal.findById(id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    const prevIndex = meal.ratings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (prevIndex !== -1) meal.ratings.splice(prevIndex, 1);

    meal.ratings.push({ user: req.user._id, value: Number(value) });
    await meal.save();

    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: "Error rating meal" });
  }
};

// 5. FUNKCIJA ZA BROJANJE PREGLEDA
const incrementViewCount = async (req, res) => {
  try {
    const mealId = req.params.id;

    // $inc atomski povećava vrijednost (nema race-conditiona)
    await Meal.findByIdAndUpdate(mealId, { $inc: { viewCount: 1 } });

    // Vraćamo samo status 200 OK (ne treba nam nikakav podatak natrag)
    res.status(200).send();
  } catch (error) {
    console.error("Greška viewCount:", error);
    res.status(500).json({ message: "Greška pri ažuriranju pregleda" });
  }
};

// 6. FUNKCIJA ZA BROJANJE DIJELJENJA
const incrementShareCount = async (req, res) => {
  try {
    const mealId = req.params.id;

    // Povećaj shareCount za +1
    await Meal.findByIdAndUpdate(mealId, { $inc: { shareCount: 1 } });

    res.status(200).send();
  } catch (error) {
    console.error("Greška shareCount:", error);
    res.status(500).json({ message: "Greška pri dijeljenju" });
  }
};

// 7. DOHVATI DETALJE JEDNOG OBROKA
const getMealDetails = async (req, res) => {
  try {
    const mealId = req.params.id;

    const meal = await Meal.findById(mealId)
      .populate("author", "username avatar") // Tko je objavio
      .populate("playlist") // Playlista
      .populate("courses.recipe") // Recepti unutar sljedova
      .populate("comments.user", "username avatar"); // Tko je komentirao

    if (!meal) {
      return res.status(404).json({ message: "Obrok nije pronađen" });
    }

    res.json(meal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dohvatu detalja obroka" });
  }
};

const searchMeals = async (req, res) => {
  const { query, page = 1, limit = 20, sort = 'newest' } = req.query;

  // Pretvori u brojeve
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    // 1. OSNOVNI PIPELINE (Joinovi koji trebaju uvijek)
    const pipeline = [
      // Spoji s Userima
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      { $unwind: "$authorDetails" },

      // Spoji s Receptima (da izvučemo imena za pretragu)
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

      // Grupiraj natrag
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          image: { $first: "$image" },
          author: { $first: "$authorDetails" },
          createdAt: { $first: "$createdAt" },
          ratings: { $first: "$ratings" },
          averageRating: { $first: "$averageRating" },
          viewCount: { $first: "$viewCount" },
          recipeNames: { $push: "$courseRecipeDetails.title" },
        },
      },
    ];

    // 2. SEARCH FILTER (Samo ako ima queryja)
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

    // 3. SORTIRANJE
    let sortStage = { createdAt: -1 }; // Default: Najnovije
    if (sort === 'popular') {
      sortStage = { viewCount: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // 4. PAGINACIJA
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const results = await Meal.aggregate(pipeline);

    res.json(results);
  } catch (error) {
    console.error("Search meals error:", error);
    res.status(500).json({ message: "Greška pri pretrazi eventova" });
  }
};

// 9. PREPORUKE ZA KORISNIKA (Interni Eventi)
const getRecommendedMeals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Fallback ako nema preferencija
    if (!user.preferences || 
       (user.preferences.categories.length === 0 && user.preferences.areas.length === 0)) {
       // Vrati random 15 ako nema preferencija
       const random = await Meal.aggregate([{ $sample: { size: 15 } }]);
       const populated = await User.populate(random, { path: "author", select: "username avatar" });
       return res.json(populated);
    }

    const { categories, areas } = user.preferences;

    const recommendations = await Meal.aggregate([
      // 1. Prvo moramo "dohvatiti" recepte unutar courses da vidimo njihove kategorije/zemlje
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

      // 2. Grupiraj natrag po Eventu (Meal), ali usput RAČUNAJ BODOVE
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          image: { $first: "$image" },
          authorId: { $first: "$author" }, // Čuvamo ID za kasnije populate
          viewCount: { $first: "$viewCount" },
          createdAt: { $first: "$createdAt" },
          ratings: { $first: "$ratings" },
          
          // --- ALGORITAM BODOVANJA ---
          score: {
            $sum: {
              $add: [
                // Bod za kategoriju? (1 ako je u listi, 0 ako nije)
                { $cond: [{ $in: ["$recipeDetails.category", categories] }, 1, 0] },
                // Bod za zemlju? (1 ako je u listi, 0 ako nije)
                { $cond: [{ $in: ["$recipeDetails.area", areas] }, 1, 0] }
              ]
            }
          }
        }
      },

      // 3. Izbaci one koji imaju 0 bodova (nisu relevantni)
      { $match: { score: { $gt: 0 } } },

      // 4. Sortiraj po bodovima (Najveći score prvi)
      { $sort: { score: -1 } },

      // 5. Limitiraj na 15
      { $limit: 15 },

      // 6. Populate Autora (jer smo gore imali samo ID)
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

// 8. OBRIŠI EVENT (Samo autor)
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Event nije pronađen" });

    if (meal.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Niste autor ovog eventa" });
    }

    await meal.deleteOne();
    res.json({ message: "Event obrisan" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri brisanju" });
  }
};

// 9. IZAĐI IZ EVENTA (Samo sudionik)
const leaveMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Event nije pronađen" });

    // Makni usera iz participants arraya
    meal.participants = meal.participants.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await meal.save();
    res.json({ message: "Napustili ste event" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri izlasku" });
  }
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
