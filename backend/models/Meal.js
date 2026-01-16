const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String }, 

    // Datum i vrijeme održavanja eventa
    date: { 
      type: Date, 
      default: Date.now 
    },
    
    // Lokacija (npr. "Kod mene doma", "Jarun", itd.)
    location: {
      type: String,
      default: "Kod autora"
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- SUDIONICI (Gosti) ---
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // --- SLJEDOVI (Prošireni Enum) ---
    courses: [
      {
        courseType: {
          type: String,
          enum: [
            "Aperitif",       // Piće dobrodošlice
            "Appetizer",      // Hladno predjelo
            "Warm Appetizer", // Toplo predjelo
            "Soup",           // Juha
            "Main Course",    // Glavno jelo
            "Side Dish",      // Prilog
            "Salad",          // Salata
            "Dessert",        // Desert
            "Cheese",         // Sir
            "Digestif",       // Piće nakon jela
            "Drink",          // Općenito piće
            "Snack"           // Grickalice
          ],
          required: true,
        },
        recipe: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Recipe",
          required: true,
        },
      },
    ],

    playlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },

    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5 },
      },
    ],
    averageRating: { type: Number, default: 0 },

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);