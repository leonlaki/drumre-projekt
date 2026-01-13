const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
