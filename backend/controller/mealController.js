const Meal = require("../models/Meal");

// 1. KREIRAJ OBROK (OBJAVI POST)
const createMeal = async (req, res) => {
  // Frontend šalje: title, description, playlistId i niz 'courses'
  // courses izgleda ovako: [{ courseType: 'Soup', recipe: 'ID_RECEPTA' }, ...]
  const { title, description, courses, playlistId } = req.body;

  if (!courses || courses.length === 0) {
    return res
      .status(400)
      .json({ message: "Obrok mora imati barem jedan slijed!" });
  }

  try {
    const meal = await Meal.create({
      title,
      description,
      courses, // Spremamo strukturu sljedova
      playlist: playlistId || null,
      author: req.user._id,
    });
    res.status(201).json(meal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating meal post" });
  }
};

// 2. FEED (TRENDING OBROCI)
const getWeeklyMealFeed = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const feed = await Meal.aggregate([
      // A. Filter: Zadnjih 7 dana
      { $match: { createdAt: { $gte: sevenDaysAgo } } },

      // B. Statistika (Broj glasova i prosjek)
      {
        $addFields: {
          voteCount: { $size: "$ratings" },
          averageRating: { $avg: "$ratings.value" },
          commentCount: { $size: "$comments" },
        },
      },

      // C. Sortiranje (Prvo popularnost)
      { $sort: { voteCount: -1, averageRating: -1 } },

      // D. POPULATE (Dohvaćanje povezanih podataka)

      // 1. Autor
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      // 2. Playlista
      {
        $lookup: {
          from: "playlists",
          localField: "playlist",
          foreignField: "_id",
          as: "playlistDetails",
        },
      },
      // 3. Recepti
      {
        $unwind: "$courses", // Razbijamo niz da možemo dohvatiti svaki recept
      },
      {
        $lookup: {
          from: "recipes",
          localField: "courses.recipe",
          foreignField: "_id",
          as: "courses.recipeDetails",
        },
      },
      {
        $unwind: "$courses.recipeDetails", // Pretvaramo niz u objekt
      },
      // Sada moramo ponovno grupirati Meal jer smo ga gore razbili s unwind
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
          // Vraćamo kurseve natrag u niz
          courses: { $push: "$courses" },
        },
      },

      // E. Čišćenje (Unwind author i playlist arrays)
      { $unwind: "$authorDetails" },
      {
        $unwind: { path: "$playlistDetails", preserveNullAndEmptyArrays: true },
      },

      // F. Finalna projekcija (Što šaljemo frontendu)
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
          // Ovdje šaljemo strukturirane sljedove
          courses: {
            courseType: 1,
            recipeDetails: {
              title: 1,
              image: 1,
              _id: 1,
            },
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

// 3. KOMENTIRAJ OBROK
const commentOnMeal = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const meal = await Meal.findById(id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    meal.comments.push({
      user: req.user._id,
      text: text,
    });

    await meal.save();
    res.json(meal);
  } catch (err) {
    res.status(500).json({ message: "Error posting comment" });
  }
};

// 4. OCIJENI OBROK
const rateMeal = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  try {
    const meal = await Meal.findById(id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    // Makni stari glas
    const prevIndex = meal.ratings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (prevIndex !== -1) meal.ratings.splice(prevIndex, 1);

    // Dodaj novi
    meal.ratings.push({ user: req.user._id, value: Number(value) });
    await meal.save();

    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: "Error rating meal" });
  }
};

module.exports = { createMeal, getWeeklyMealFeed, commentOnMeal, rateMeal };
