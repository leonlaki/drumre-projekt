const axios = require("axios");
const User = require("../models/User");

// Dohvaća preporuke s TheMealDB na temelju FB lajkova
const getFacebookRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // 1. Provjeravamo ima li korisnik detektirane preferencije
    // Očekujemo niz npr. ["Chicken", "Dessert", "Beef"]
    const preferences = user.preferences.categories;

    if (!preferences || preferences.length === 0) {
      return res.json({
        message: "Nema detektiranih preferencija s Facebooka.",
        meals: [],
      });
    }

    let allRecommendedMeals = [];

    // 2. Za svaku kategoriju koju korisnik voli, dohvati jela s MealDB
    // Limitiramo na 3 kategorije da ne usporimo previše zahtjev
    const topPreferences = preferences.slice(0, 3);

    for (const category of topPreferences) {
      try {
        // Pozivamo MealDB API: Filter by Category
        const response = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
        );

        const meals = response.data.meals;

        if (meals) {
          // Uzimamo samo 3 nasumična jela iz te kategorije da ne pretrpamo feed
          const shuffled = meals.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 3);
          allRecommendedMeals.push(...selected);
        }
      } catch (err) {
        console.error(
          `Greška pri dohvatu za kategoriju ${category}:`,
          err.message
        );
      }
    }

    // 3. Vrati rezultate
    // Promiješaj finalni rezultat da ne budu grupirani
    const finalMix = allRecommendedMeals.sort(() => 0.5 - Math.random());

    res.json(finalMix);
  } catch (error) {
    console.error("Greška u preporukama:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
};

module.exports = { getFacebookRecommendations };
