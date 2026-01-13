const express = require("express");
const router = express.Router();

const { ensureAuth } = require("../middleware/authMiddleware");
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
} = require("../controller/friendController");

router.post("/request", ensureAuth, sendFriendRequest);
router.post("/accept/:requestId", ensureAuth, acceptFriendRequest);
router.post("/reject/:requestId", ensureAuth, rejectFriendRequest);
router.delete("/unfriend/:friendId", ensureAuth, unfriend);

module.exports = router;