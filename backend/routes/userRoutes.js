const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateMyProfile,
} = require("../controller/userController");
const { ensureAuth } = require("../middleware/authMiddleware");

// --- JAVNE RUTE ---
router.get("/:username", getUserProfile);

// --- ZAŠTIĆENE RUTE ---
router.put("/profile", ensureAuth, updateMyProfile);

module.exports = router;
