const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    // Naslov posta (npr. "Nedjeljni ručak za ekipu")
    title: { type: String, required: true },
    description: { type: String },
    
    // Slika obroka (URL ili path)
    image: { type: String }, 

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- SLJEDOVI (COURSES) ---
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

    // --- DRUŠTVENI DIO ---
    
    // 1. Ocjene (rating)
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5 },
      },
    ],
    // Pomoćno polje za brzo sortiranje po popularnosti
    averageRating: { type: Number, default: 0 },

    // 2. Komentari (Comments)
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // 3. Brojači pregleda i dijeljenja (NOVO ZA PROJEKT) 📈
    viewCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);