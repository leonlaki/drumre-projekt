const User = require("../models/User");
const axios = require("axios");

// --- 1. DOHVATI OPCIJE ZA ONBOARDING ---
const getOnboardingOptions = async (req, res) => {
  try {
    // A) Dohvati SVE moguće opcije s TheMealDB API-ja
    const [categoriesRes, areasRes] = await Promise.all([
      axios.get("https://www.themealdb.com/api/json/v1/1/list.php?c=list"),
      axios.get("https://www.themealdb.com/api/json/v1/1/list.php?a=list"),
    ]);

    // B) Dohvati trenutnog usera iz baze
    // Provjeravamo je li Facebook već nešto upisao u 'preferences'
    const currentUser = await User.findById(req.user._id);

    // C) Vrati sve podatke frontendu
    res.json({
      // Popis svih opcija za prikaz (checkboxovi)
      categories: categoriesRes.data.meals || [],
      areas: areasRes.data.meals || [],

      // Ono što je korisnik već odabrao (ili što je Facebook detektirao)
      // Frontend će ovo koristiti da unaprijed označi kvačice
      existingPreferences: {
        categories: currentUser.preferences?.categories || [], // npr. ["Beef", "Dessert"]
        areas: currentUser.preferences?.areas || [],
      },
    });
  } catch (error) {
    console.error("Greška s TheMealDB:", error);
    res.status(500).json({ message: "Greška pri dohvatu opcija" });
  }
};

// --- 2. SPREMI PREFERENCIJE ---
const saveUserPreferences = async (req, res) => {
  const { categories, areas } = req.body;
  const userId = req.user._id;

  // Validacija: Korisnik mora odabrati barem 3 kategorije
  if (!categories || categories.length < 3) {
    return res
      .status(400)
      .json({ message: "Molimo odaberite barem 3 kategorije jela." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen." });
    }

    // Ažuriramo preferencije onim što je korisnik FINALNO odabrao
    // Ovo će pregaziti ili dopuniti ono što je Facebook stavio, ovisno što je korisnik kliknuo
    user.preferences = {
      categories: categories,
      areas: areas || [],
    };

    user.isOnboarded = true;

    await user.save();

    res.json({ message: "Preferencije uspješno spremljene!", user });
  } catch (error) {
    console.error("Greška pri spremanju preferencija:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
};

// 3. GENERIRAJ PREPORUKE
const getMealDBRecommendations = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user || !user.preferences) {
      return res.json([]);
    }

    // Uzimamo prve 3 (ili sve) preferencije da ne gušimo API ako ih je user odabrao 50
    // Ali s obzirom na limit validacije, imamo barem 3.
    const myCategories = user.preferences.categories.slice(0, 5);
    const myAreas = user.preferences.areas.slice(0, 5);

    console.log(
      `Tražim mix za kategorije: [${myCategories}] i države: [${myAreas}]`
    );

    // 1. DOHVATI SVE KOMBINACIJE PARALELNO
    // Radimo zahtjeve za SVE odabrane kategorije i SVE države
    const categoryRequests = myCategories.map((cat) =>
      axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`)
    );
    const areaRequests = myAreas.map((area) =>
      axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`)
    );

    // Čekamo da se svi zahtjevi završe
    const [catResponses, areaResponses] = await Promise.all([
      Promise.all(categoryRequests),
      Promise.all(areaRequests),
    ]);

    // 2. SPOJI REZULTATE U LISTE
    // Lista svih jela iz odabranih KATEGORIJA
    const allCatMeals = catResponses.flatMap((res) => res.data.meals || []);
    // Lista svih jela iz odabranih DRŽAVA
    const allAreaMeals = areaResponses.flatMap((res) => res.data.meals || []);

    // 3. TRAŽENJE PRESJEKA
    // Želimo jela koja su u NEKOJ od tvojih kategorija I u NEKOJ od tvojih država

    // Napravi set ID-eva iz država za brzo pretraživanje
    const areaIds = new Set(allAreaMeals.map((m) => m.idMeal));

    // Filtriraj kategorije: ostavi samo ona jela koja su i u listi država
    let validMeals = allCatMeals.filter((catMeal) =>
      areaIds.has(catMeal.idMeal)
    );

    // Ukloni duplikate
    const uniqueMealsMap = new Map();
    validMeals.forEach((m) => uniqueMealsMap.set(m.idMeal, m));
    validMeals = Array.from(uniqueMealsMap.values());

    console.log(`Pronađeno ${validMeals.length} jela u presjeku.`);

    // 4. FALLBACK
    // Ako nema nijednog jela koje je istovremeno kategorija i država
    if (validMeals.length === 0) {
      // Vrati random jela samo iz kategorija
      validMeals = allCatMeals;
    }

    // 5. UZMI RANDOM 10
    const top10 = validMeals.sort(() => 0.5 - Math.random()).slice(0, 10);

    // 6. DOHVATI DETALJE
    const detailedMeals = await Promise.all(
      top10.map(async (item) => {
        try {
          const details = await axios.get(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${item.idMeal}`
          );
          return details.data.meals ? details.data.meals[0] : null;
        } catch (e) {
          return null;
        }
      })
    );

    // 7. MAPIRANJE I AUTHOR DESIGN
    const formattedMeals = detailedMeals
      .filter((m) => m !== null)
      .map((item) => ({
        _id: "ext_" + item.idMeal,
        title: item.strMeal,
        description: `Preporuka: ${item.strCategory} (${item.strArea})`,
        image: item.strMealThumb,
        createdAt: new Date(),

        // Dinamični autor (npr. "Croatian cuisine")
        authorDetails: {
          username: `${item.strArea} cuisine`,
          avatar: `https://ui-avatars.com/api/?name=${item.strArea}+cuisine&background=random&color=fff&size=128&rounded=true`,
        },

        playlistDetails: null,
        courses: [
          {
            courseType: item.strCategory,
            recipeDetails: {
              _id: "ext_rec_" + item.idMeal,
              title: item.strMeal,
              image: item.strMealThumb,
            },
          },
        ],
        voteCount: 0,
        averageRating: 0,
        isExternal: true,
      }));

    res.json(formattedMeals);
  } catch (error) {
    console.error("Greška preporuke:", error);
    res.status(500).json({ message: "Greška pri dohvatu preporuka" });
  }
};

module.exports = {
  getOnboardingOptions,
  saveUserPreferences,
  getMealDBRecommendations,
};
