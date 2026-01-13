const Playlist = require("../models/Playlist");

// 1. KREIRAJ NOVU PLAYLISTU
const createPlaylist = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Ime je obavezno" });

  try {
    const newPlaylist = await Playlist.create({
      user: req.user._id, // Middleware garantira da ovo postoji
      name: name,
      songs: [],
    });
    res.json(newPlaylist);
  } catch (error) {
    res.status(500).json({ message: "Greška pri kreiranju playliste" });
  }
};

// 2. DOHVATI SVE PLAYLISTE KORISNIKA
const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatu playlista" });
  }
};

// 3. DOHVATI JEDNU PLAYLISTU (DETALJE)
const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!playlist) return res.status(404).json({ message: "Nije pronađeno" });
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatu playliste" });
  }
};

// 4. DODAJ PJESMU U SPECIFIČNU PLAYLISTU
const addSongToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { title, channel, thumbnail, youtubeId } = req.body;

  try {
    const playlist = await Playlist.findOne({
      _id: playlistId,
      user: req.user._id,
    });

    if (!playlist)
      return res.status(404).json({ message: "Playlista ne postoji" });

    // Provjera duplikata unutar te liste
    const exists = playlist.songs.find((s) => s.youtubeId === youtubeId);
    if (exists)
      return res
        .status(400)
        .json({ message: "Pjesma već postoji u ovoj listi" });

    playlist.songs.push({ title, channel, thumbnail, youtubeId });
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dodavanju pjesme" });
  }
};

// 5. OBRIŠI PJESMU IZ PLAYLISTE
const removeSong = async (req, res) => {
  const { playlistId, songId } = req.params; // songId je youtubeId

  try {
    const playlist = await Playlist.findOne({
      _id: playlistId,
      user: req.user._id,
    });
    if (!playlist) return res.status(404).json({ message: "Nije pronađeno" });

    // Filtriraj
    playlist.songs = playlist.songs.filter((s) => s.youtubeId !== songId);
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: "Greška pri brisanju pjesme" });
  }
};

// 6. OBRIŠI CIJELU PLAYLISTU
const deletePlaylist = async (req, res) => {
  try {
    await Playlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Playlista obrisana" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri brisanju playliste" });
  }
};

// 7. PROMIJENI IME PLAYLISTE
const renamePlaylist = async (req, res) => {
  const { name } = req.body;
  try {
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name: name },
      { new: true }
    );
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: "Greška pri preimenovanju" });
  }
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSong,
  deletePlaylist,
  renamePlaylist,
};
