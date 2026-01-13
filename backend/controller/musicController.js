const axios = require("axios");

// 1. PRETRAGA YOUTUBE-A
// Ova funkcija samo dohvaća podatke s YouTubea i šalje ih frontendu.
// Ne dira bazu podataka.
const searchTracks = async (req, res) => {
  const { query } = req.query;

  // Ako korisnik nije ništa upisao
  if (!query)
    return res.status(400).json({ message: "Unesite pojam za pretragu" });

  try {
    // Slanje zahtjeva na YouTube API
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 15,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    // Filtriranje i mapiranje podataka
    const tracks = response.data.items
      .filter((item) => item.id.videoId) // Izbacuje kanale i playliste, ostavlja samo videe
      .map((item) => ({
        youtubeId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        // Uzmi sliku visoke kvalitete, ili običnu ako high ne postoji
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.default.url,
      }));

    res.json(tracks);
  } catch (error) {
    console.error("YouTube API Error:", error.response?.data || error.message);

    res.status(500).json({
      message:
        "Greška prilikom pretrage glazbe (YouTube API limit ili greška).",
    });
  }
};

module.exports = { searchTracks };
