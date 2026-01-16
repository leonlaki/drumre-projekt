const express = require("express");
const router = express.Router();

const { ensureAuth } = require("../middleware/authMiddleware");
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  getPendingRequests,
  getMyFriends,
  cancelFriendRequest,
  getSentRequests,
} = require("../controller/friendController");

router.post("/request", ensureAuth, sendFriendRequest);
router.get("/requests", getPendingRequests);
router.get("/", getMyFriends);
router.get("/sent", getSentRequests);
router.delete("/cancel/:toId", cancelFriendRequest);
router.post("/accept/:requestId", ensureAuth, acceptFriendRequest);
router.post("/reject/:requestId", ensureAuth, rejectFriendRequest);
router.delete("/unfriend/:friendId", ensureAuth, unfriend);

module.exports = router;
