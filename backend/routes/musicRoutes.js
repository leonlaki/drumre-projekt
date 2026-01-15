const express = require("express");
const router = express.Router();
const { searchMusic } = require("../controller/musicController");

// GET /api/music/search?q=nešto
router.get("/search", searchMusic);

module.exports = router;