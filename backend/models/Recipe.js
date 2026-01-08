const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  value: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
});

const recipeSchema = new mongoose.Schema({
  mealId: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  category: String, //ENUMERACIJA
  area: String,
  image: String,
  instructions: String,
  ingredients: [String],

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  ratings: [ratingSchema],

  avgRating: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Recipe", recipeSchema);