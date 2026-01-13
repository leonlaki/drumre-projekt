const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    // Naslov posta (npr. "Nedjeljni ručak za ekipu")
    title: { type: String, required: true },
    description: { type: String },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- SLJEDOVI (COURSES) ---
    // Ovo je niz objekata, svaki ima tip (npr. predjelo) i link na recept
    courses: [
      {
        courseType: {
          type: String,
          enum: [
            "Appetizer",
            "Soup",
            "Main Course",
            "Side Dish",
            "Dessert",
            "Drink",
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

    // --- ATMOSFERA (PLAYLISTA) ---
    playlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },

    // --- DRUŠTVENI DIO (Social) ---
    // 1. Ocjene (Rating)
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5 },
      },
    ],

    // 2. Komentari (Comments)
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);
