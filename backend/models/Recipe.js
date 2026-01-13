const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    instructions: { type: String },
    ingredients: [String],

    // Autor (kuhar)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Breakfast",
        "Lunch",
        "Dinner",
        "Dessert",
        "Snack",
        "Appetizer",
        "Soup",
        "Main Course",
        "Side Dish",
        "Drink",
      ],
      default: "Main Course",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
