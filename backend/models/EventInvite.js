const mongoose = require("mongoose");

const eventInviteSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Osigurava da ne pošalješ duplu pozivnicu istoj osobi za isti event
eventInviteSchema.index({ to: 1, meal: 1 }, { unique: true });

module.exports = mongoose.model("EventInvite", eventInviteSchema);