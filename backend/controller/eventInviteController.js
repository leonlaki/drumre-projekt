const EventInvite = require("../models/EventInvite");
const Meal = require("../models/Meal");

// 1. Dohvati moje pozivnice (gdje sam ja 'to')
const getMyInvites = async (req, res) => {
  try {
    const invites = await EventInvite.find({ 
      to: req.user._id, 
      status: 'pending' 
    })
    .populate('from', 'username avatar') // Tko me zove
    .populate('meal', 'title image date location'); // Na što me zove

    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Prihvati pozivnicu
const acceptInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    
    // Nađi pozivnicu
    const invite = await EventInvite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Pozivnica nije pronađena" });

    // Provjeri je li to taj korisnik
    if (invite.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Nije tvoja pozivnica" });
    }

    // 1. Ažuriraj status pozivnice
    invite.status = 'accepted';
    await invite.save();

    // 2. Ubaci korisnika u Meal participants
    await Meal.findByIdAndUpdate(invite.meal, {
      $addToSet: { participants: req.user._id } // $addToSet sprječava duplikate
    });

    res.json({ message: "Pozivnica prihvaćena! 🎉" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Odbij pozivnicu
const rejectInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    
    const invite = await EventInvite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Pozivnica nije pronađena" });

    if (invite.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Nije tvoja pozivnica" });
    }

    // Samo brišemo pozivnicu ili stavljamo rejected
    await EventInvite.findByIdAndDelete(inviteId);

    res.json({ message: "Pozivnica odbijena." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyInvites,
  acceptInvite,
  rejectInvite
};