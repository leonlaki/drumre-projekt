const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

/**
 * SEND FRIEND REQUEST
 * POST /api/friends/request
 */
const sendFriendRequest = async (req, res) => {
  try {
    const from = req.user._id;
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Nedostaje ID korisnika" });
    }

    if (from.toString() === to) {
      return res
        .status(400)
        .json({ message: "Ne možeš poslati zahtjev sam sebi" });
    }

    const targetUser = await User.findById(to);
    if (!targetUser) {
      return res.status(404).json({ message: "Korisnik ne postoji" });
    }

    // već prijatelji?
    const me = await User.findById(from);
    if (me.friends.includes(to)) {
      return res.status(400).json({ message: "Već ste prijatelji" });
    }

    // već postoji zahtjev (bilo koji smjer)
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Zahtjev već postoji" });
    }

    const request = await FriendRequest.create({ from, to });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ACCEPT FRIEND REQUEST
 * POST /api/friends/accept/:requestId
 */
const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Zahtjev ne postoji" });
    }

    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Nemaš pravo prihvatiti ovaj zahtjev" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.from, {
      $addToSet: { friends: request.to },
    });

    await User.findByIdAndUpdate(request.to, {
      $addToSet: { friends: request.from },
    });

    res.json({ message: "Zahtjev prihvacen" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * REJECT FRIEND REQUEST
 * POST /api/friends/reject/:requestId
 */
const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Zahtjev ne postoji" });
    }

    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Nemaš pravo odbiti ovaj zahtjev" });
    }

    await request.deleteOne();
    res.json({ message: "Zahtjev odbijen" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UNFRIEND
 * DELETE /api/friends/unfriend/:friendId
 */
const unfriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    await FriendRequest.deleteMany({
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
    });

    res.json({ message: "Korisnik je uklonjen iz prijatelja" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
};
