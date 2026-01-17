const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/authMiddleware");
const { 
  getMyInvites, 
  acceptInvite, 
  rejectInvite 
} = require("../controller/eventInviteController");

// Sve rute su zaštićene
router.get("/", ensureAuth, getMyInvites);
router.post("/:inviteId/accept", ensureAuth, acceptInvite);
router.post("/:inviteId/reject", ensureAuth, rejectInvite);

module.exports = router;