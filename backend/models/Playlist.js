// const mongoose = require("mongoose");

// const playlistSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//       default: "Moja Playlista",
//     },
//     songs: [
//       {
//         title: { type: String, required: true },
//         channel: { type: String },
//         thumbnail: { type: String },
//         youtubeId: { type: String, required: true },
//         addedAt: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Playlist", playlistSchema);

const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Npr. "Talijanska vibra"
    description: { type: String },
    
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ovdje spremamo podatke koje smo dobili od Deezera
    songs: [
      {
        deezerId: { type: String },      // ID pjesme na Deezeru
        title: { type: String },         // Naslov
        artist: { type: String },        // Izvođač
        albumCover: { type: String },    // Slika
        previewUrl: { type: String },    // Onaj link od 30 sekundi
        duration: { type: Number }       // Trajanje (opcionalno)
      }
    ],
    
    isPublic: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", playlistSchema);