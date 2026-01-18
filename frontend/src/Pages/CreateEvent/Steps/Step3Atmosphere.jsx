import React, { useState, useEffect, useRef } from "react";
import { musicApi } from "../../../api/musicApi";

const Step3Atmosphere = ({ eventData, setEventData }) => {
  const [musicSearchQuery, setMusicSearchQuery] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);

  // audio player lokalno
  const [currentPreview, setCurrentPreview] = useState(null);
  const audioRef = useRef(new Audio());

  // stopiraj muziku kad komponenta nestane
  useEffect(() => {
    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  // debounce pretrage
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (musicSearchQuery.trim().length > 2) {
        setIsSearchingMusic(true);
        try {
          const results = await musicApi.searchMusic(musicSearchQuery);
          setMusicResults(results || []);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearchingMusic(false);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [musicSearchQuery]);

  // play/pause preview
  const togglePreview = (previewUrl) => {
    if (currentPreview === previewUrl) {
      audioRef.current.pause();
      setCurrentPreview(null);
    } else {
      audioRef.current.src = previewUrl;
      audioRef.current.play();
      setCurrentPreview(previewUrl);
    }
  };

  // dodaj pjesmu u playlistu
  const addTrack = (track) => {
    if (!eventData.playlistSongs.some((s) => s.id === track.id)) {
      setEventData({
        ...eventData,
        playlistSongs: [...eventData.playlistSongs, track],
      });
    }
  };

  // ukloni pjesmu
  const removeTrack = (trackId) => {
    setEventData({
      ...eventData,
      playlistSongs: eventData.playlistSongs.filter((t) => t.id !== trackId),
    });
  };

  // pomakni pjesmu gore/dolje
  const moveTrack = (index, direction) => {
    const newPlaylist = [...eventData.playlistSongs];
    if (direction === "up" && index > 0) {
      [newPlaylist[index], newPlaylist[index - 1]] = [
        newPlaylist[index - 1],
        newPlaylist[index],
      ];
    } else if (direction === "down" && index < newPlaylist.length - 1) {
      [newPlaylist[index], newPlaylist[index + 1]] = [
        newPlaylist[index + 1],
        newPlaylist[index],
      ];
    }
    setEventData({ ...eventData, playlistSongs: newPlaylist });
  };

  return (
    <div className="step-card">
      <h2>Music Atmosphere 🎵</h2>

      <div className="music-search-container">
        <input
          type="text"
          className="form-input"
          placeholder="Search Deezer..."
          value={musicSearchQuery}
          onChange={(e) => setMusicSearchQuery(e.target.value)}
        />
        <span className="search-icon-inside">🔍</span>
      </div>

      {musicSearchQuery.length > 2 && (
        <div className="music-results-list">
          {isSearchingMusic ? (
            <div style={{ padding: "10px", textAlign: "center" }}>Searching...</div>
          ) : (
            musicResults.map((track) => {
              const isPlaying = currentPreview === track.previewUrl;
              const isAdded = eventData.playlistSongs.some((s) => s.id === track.id);
              return (
                <div key={track.id} className="track-item">
                  <div className="track-cover-wrapper">
                    <img src={track.albumCover} alt="" className="track-cover" />
                    <button
                      className={`btn-preview-play ${isPlaying ? "playing" : ""}`}
                      onClick={() => togglePreview(track.previewUrl)}
                    >
                      <span>{isPlaying ? "⏸" : "▶"}</span>
                    </button>
                  </div>
                  <div className="track-info">
                    <span className="track-title">{track.title}</span>
                    <span className="track-artist">{track.artist}</span>
                  </div>
                  <button className="btn-add-track" onClick={() => addTrack(track)} disabled={isAdded}>
                    {isAdded ? "✓" : "+"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="selected-playlist-container">
        <h3>Your Playlist ({eventData.playlistSongs.length})</h3>
        {eventData.playlistSongs.map((track, index) => (
          <div key={track.id} className="track-item selected">
            <div className="track-move-controls">
              <button className="btn-move-track" onClick={() => moveTrack(index, "up")}>
                ▲
              </button>
              <button className="btn-move-track" onClick={() => moveTrack(index, "down")}>
                ▼
              </button>
            </div>
            <span style={{ width: "20px" }}>{index + 1}.</span>
            <div className="track-cover-wrapper" style={{ width: 40, height: 40 }}>
              <img src={track.albumCover} alt="" className="track-cover" />
              <button
                className={`btn-preview-play ${currentPreview === track.previewUrl ? "playing" : ""}`}
                onClick={() => togglePreview(track.previewUrl)}
              >
                {currentPreview === track.previewUrl ? "⏸" : "▶"}
              </button>
            </div>
            <div className="track-info">
              <span className="track-title">{track.title}</span>
              <span className="track-artist">{track.artist}</span>
            </div>
            <button className="btn-remove-track" onClick={() => removeTrack(track.id)}>
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step3Atmosphere;
