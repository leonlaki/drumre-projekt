const express = require("express");
const { combinedSearch, fetchAreas, fetchCategories } = require("../controller/mealdbController");

const router = express.Router();

// KOMBINIRANI SEARCH
router.get("/search", combinedSearch);

router.get("/categories", fetchCategories);
router.get("/areas", fetchAreas);

module.exports = router;