const Meal = require("../models/Meal");
const User = require("../models/User");
const EventInvite = require("../models/EventInvite");

// 1. KREIRAJ OBROK (EVENT)
const createMeal = async (req, res) => {
  // Destructuring
  const { title, description, courses, playlistId, date, location, image, participants } = req.body;

  if (!courses || courses.length === 0) {
    return res.status(400).json({ message: "Event mora imati barem jedan slijed!" });
  }

  try {
    // 1. Kreiraj Meal
    // NAPOMENA: U participants stavljamo SAMO AUTORA (sebe) jer ostali još nisu prihvatili!
    const meal = await Meal.create({
      title,
      description,
      image,
      courses,
      playlist: playlistId || null,
      author: req.user._id,
      date: date || new Date(),
      location: location || "Kod autora",
      participants: [req.user._id] // <--- Samo autor je siguran sudionik
    });

    // 2. Kreiraj Pozivnice (EventInvites) za odabrane prijatelje
    if (participants && participants.length > 0) {
      // Filtriraj da ne šalješ sam sebi (za svaki slučaj)
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

      // C. Sortiranje (Popularnost)
      { $sort: { voteCount: -1, averageRating: -1 } },

      // D. POPULATE
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
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
      // ------------------------------------------------------------
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          createdAt: { $first: "$createdAt" },
          authorDetails: { $first: "$authorDetails" },
          playlistDetails: { $first: "$playlistDetails" },
          voteCount: { $first: "$voteCount" },
          averageRating: { $first: "$averageRating" },
          commentCount: { $first: "$commentCount" },
          courses: { $push: "$courses" },
        },
      },
      { $unwind: "$authorDetails" },
      {
        $unwind: { path: "$playlistDetails", preserveNullAndEmptyArrays: true },
      },

      // E. Projekcija
      {
        $project: {
          title: 1,
          description: 1,
          createdAt: 1,
          voteCount: 1,
          averageRating: 1,
          commentCount: 1,
          "authorDetails.username": 1,
          "authorDetails.avatar": 1,
          "playlistDetails.name": 1,
          "playlistDetails.songs": 1,
          courses: {
            courseType: 1,
            recipeDetails: { title: 1, image: 1, _id: 1 },
          },
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
  const { sort } = req.query; // ?sort=newest ili ?sort=popular

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Odredi sortiranje
    let sortStage = {};
    if (sort === "newest") {
      sortStage = { createdAt: -1 };
    } else {
      sortStage = { voteCount: -1, averageRating: -1 }; // Default: Popularno
    }

    const meals = await Meal.aggregate([
      // A. FILTER: Samo obroci ovog korisnika (nema vremenskog ograničenja)
      { $match: { author: user._id } },

      // B. Statistika
      {
        $addFields: {
          voteCount: { $size: "$ratings" },
          averageRating: { $avg: "$ratings.value" },
          commentCount: { $size: "$comments" },
        },
      },

      // C. Sortiranje
      { $sort: sortStage },

      // D. Populate
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
          createdAt: { $first: "$createdAt" },
          playlistDetails: { $first: "$playlistDetails" },
          voteCount: { $first: "$voteCount" },
          averageRating: { $first: "$averageRating" },
          commentCount: { $first: "$commentCount" },
          courses: { $push: "$courses" },
        },
      },
      {
        $unwind: { path: "$playlistDetails", preserveNullAndEmptyArrays: true },
      },

      // E. Projekcija
      {
        $project: {
          title: 1,
          description: 1,
          createdAt: 1,
          voteCount: 1,
          averageRating: 1,
          commentCount: 1,
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

module.exports = {
  createMeal,
  getWeeklyMealFeed,
  getUserMeals,
  commentOnMeal,
  rateMeal,
  incrementViewCount,
  incrementShareCount,
  getMealDetails,
};
