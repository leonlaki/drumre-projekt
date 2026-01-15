// const express = require("express");
// const router = express.Router();
// const { searchTracks, searchMusic } = require("../controller/musicController");
// const playlistController = require("../controller/playlistController");
// const { ensureAuth } = require("../middleware/authMiddleware");

// // --- MUSIC ROUTES (Javne ili zaštićene? Pretraga može biti javna) ---
// router.get("/music/search", searchMusic);

// // --- PLAYLIST ROUTES ---

// // 1. Dohvati sve moje playliste (Moraš biti logiran da vidiš SVOJE liste)
// router.get("/playlists", ensureAuth, playlistController.getUserPlaylists);

// // 2. Kreiraj novu playlistu
// router.post("/playlists", ensureAuth, playlistController.createPlaylist);

// // 3. Dohvati detalje jedne playliste
// router.get("/playlists/:id", ensureAuth, playlistController.getPlaylistById);

// // 4. Dodaj pjesmu u playlistu
// router.post(
//   "/playlists/:playlistId/songs",
//   ensureAuth,
//   playlistController.addSongToPlaylist
// );

// // 5. Obriši pjesmu
// router.delete(
//   "/playlists/:playlistId/songs/:songId",
//   ensureAuth,
//   playlistController.removeSong
// );

// // 6. Preimenuj playlistu
// router.put("/playlists/:id", ensureAuth, playlistController.renamePlaylist);

// // 7. Obriši cijelu playlistu
// router.delete("/playlists/:id", ensureAuth, playlistController.deletePlaylist);

// module.exports = router;

const express = require("express");
const router = express.Router();

const { searchMusic } = require("../controller/musicController");
const playlistController = require("../controller/playlistController");
const { ensureAuth } = require("../middleware/authMiddleware");

// --- MUSIC ROUTES ---
router.get("/music/search", searchMusic);

// --- PLAYLIST ROUTES ---

// 1. Dohvati sve moje playliste
router.get("/playlists", ensureAuth, playlistController.getMyPlaylists);

// 2. Kreiraj novu playlistu
router.post("/playlists", ensureAuth, playlistController.createPlaylist);

// 3. Dohvati detalje jedne playliste
router.get("/playlists/:id", ensureAuth, playlistController.getPlaylistById);

// 4. Dodaj pjesmu u playlistu
router.post(
  "/playlists/:id/songs",
  ensureAuth,
  playlistController.addSongToPlaylist
);

// 5. Obriši pjesmu
router.delete(
  "/playlists/:id/songs/:songId",
  ensureAuth,
  playlistController.removeSongFromPlaylist
);

// 6. Obriši cijelu playlistu
router.delete("/playlists/:id", ensureAuth, playlistController.deletePlaylist);

module.exports = router;