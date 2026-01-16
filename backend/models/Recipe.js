const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    instructions: { type: String },

    // --- PROMJENA OVDJE ---
    ingredients: [
      {
        name: { type: String, required: true }, // Npr. "Brašno"
        measure: { type: String, default: "" }, // Npr. "500g"
      },
    ],
    // ---------------------

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    area: {
      type: String,
      default: "Unknown", // npr. "Italian", "Croatian", "Mexican"
    },

    // category: {
    //   type: String,
    //   enum: [
    //     "Breakfast", "Lunch", "Dinner", "Dessert", "Snack",
    //     "Appetizer", "Soup", "Main Course", "Side Dish", "Drink",
    //   ],
    //   default: "Main Course",
    // },¨
    category: {
      type: String,
      enum: [
        "Beef",
        "Breakfast",
        "Chicken",
        "Dessert",
        "Goat",
        "Lamb",
        "Miscellaneous",
        "Pasta",
        "Pork",
        "Seafood",
        "Side",
        "Starter",
        "Vegan",
        "Vegetarian",
      ],
      default: "Miscellaneous", // Promijenio sam default u nešto neutralno
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
