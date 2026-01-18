import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";
import Spinner from "../../Components/Spinner/Spinner";
import { useAuth } from "../../Context/AuthContext";

import { mealApi } from "../../api/mealApi";
import { playlistApi } from "../../api/playlistApi";
import { musicApi } from "../../api/musicApi";

import "./eventDetails.css";

const EventDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCountedView = useRef(false);

  // ocjena i komentar
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");

  // glazba
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);

  // audio player
  const [currentPreview, setCurrentPreview] = useState(null);
  const audioRef = useRef(new Audio());

  // dohvati detalje eventa
  const fetchMealDetails = async () => {
    try {
      const data = await mealApi.getMealDetails(id);
      setMeal(data);

      // postavi moju ocjenu ako postoji
      if (user && data.ratings) {
        const myRating = data.ratings.find((r) => r.user === user._id);
        if (myRating) setUserRating(myRating.value);
      }

      // povećaj broj pregleda
      if (user && data.author._id !== user._id && !hasCountedView.current) {
        hasCountedView.current = true;
        await mealApi.incrementViewCount(id);
        setMeal(prevMeal => ({
          ...prevMeal,
          viewCount: (prevMeal.viewCount || 0) + 1
        }));
      }
    } catch (error) {
      console.error("Error fetching meal details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealDetails();
    hasCountedView.current = false;

    // očisti audio
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [id]);

  // provjeri da li je sudionik
  const isParticipant =
    meal &&
    user &&
    (meal.author._id === user._id ||
      (meal.participants && meal.participants.includes(user._id)));

  // ocjeni event
  const handleRate = async (value) => {
    try {
      await mealApi.rateMeal(id, value);
      setUserRating(value);
      fetchMealDetails();
    } catch (error) {
      alert("Error rating event.");
    }
  };

  // dodaj komentar
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await mealApi.commentOnMeal(id, commentText);
      setCommentText("");
      fetchMealDetails();
    } catch (error) {
      alert("Error adding comment.");
    }
  };

  // pretraga glazbe
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (musicSearchQuery.trim().length > 2) {
        setIsSearchingMusic(true);
        try {
          const results = await musicApi.searchMusic(musicSearchQuery);
          setMusicResults(results || []);
        } catch (e) {
          console.error("Music search error:", e);
        } finally {
          setIsSearchingMusic(false);
        }
      } else {
        setMusicResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [musicSearchQuery]);

  // upravljanje audio previewem
  const togglePreview = async (url) => {
    if (!url) return alert("This track has no preview.");

    try {
      const audio = audioRef.current;

      if (currentPreview === url && !audio.paused) {
        audio.pause();
        setCurrentPreview(null);
      } else {
        audio.pause();
        audio.currentTime = 0;
        audio.src = url;
        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setCurrentPreview(url))
            .catch(() => setCurrentPreview(null));
        }
      }
    } catch (error) {
      console.error("Audio error:", error);
    }
  };

  // dodaj pjesmu u playlistu
  const handleAddSong = async (song) => {
    try {
      if (!meal.playlist) return alert("This event has no playlist.");

      const songPayload = {
        deezerId: String(song.id),
        title: song.title,
        artist: song.artist,
        albumCover: song.albumCover,
        previewUrl: song.previewUrl,
      };

      await playlistApi.addSongToPlaylist(meal.playlist._id, songPayload);

      setIsMusicModalOpen(false);
      setMusicSearchQuery("");
      fetchMealDetails();
    } catch (error) {
      console.error("Add song error:", error);
      alert("Failed to add song.");
    }
  };

  if (loading) return <Spinner />;
  if (!meal) return <div style={{ textAlign: "center", marginTop: "50px" }}>Event not found.</div>;

  return (
    <div className="event-details-wrapper">
      <PageTransition>
        <div className="event-details-container">

          {/* header */}
          <header className="event-header">
            <img src={meal.image || "https://placehold.co/1200x400"} alt={meal.title} className="event-hero-image" />
            <div className="event-header-info">
              <h1 className="event-main-title">{meal.title}</h1>
              <div className="event-meta-row">
                <div className="author-pill" onClick={() => navigate(`/profile/${meal.author.username}`)}>
                  <img src={meal.author.avatar} alt="" className="author-avatar" />
                  <span>@{meal.author.username}</span>
                </div>
                <div className="meta-pill">📅 {new Date(meal.date).toLocaleDateString()}</div>
                <div className="meta-pill">📍 {meal.location}</div>
                <div className="meta-pill">👁️ {meal.viewCount} views</div>
              </div>
            </div>
          </header>

          <p className="event-description">{meal.description}</p>

          <div className="event-grid">
            {/* jelovnik */}
            <div className="section-box">
              <h2 className="section-title">Menu 🍽️</h2>
              <div className="menu-list">
                {meal.courses.map((course, index) => (
                  <div key={index} className="menu-item" onClick={() => navigate(`/recipe/${course.recipe._id}`)}>
                    <span className="menu-course-type">{course.courseType}</span>
                    <div className="menu-recipe-info">
                      <img src={course.recipe.image} alt="" className="menu-recipe-img" />
                      <span>{course.recipe.title}</span>
                    </div>
                    <span>🔗</span>
                  </div>
                ))}
              </div>
            </div>

            {/* playlist */}
            <div className="section-box">
              <h2 className="section-title">Playlist 🎵</h2>
              {meal.playlist ? (
                <div className="playlist-tracks">
                  {meal.playlist.songs && meal.playlist.songs.length > 0 ? (
                    meal.playlist.songs.map((song) => (
                      <div key={song._id} className="menu-item" style={{ cursor: "default" }}>
                        <div className="menu-recipe-info">
                          <img src={song.albumCover} alt="" className="menu-recipe-img" style={{ borderRadius: "4px" }} />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{song.title}</span>
                            <span style={{ fontSize: "0.8rem", color: "gray" }}>{song.artist}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePreview(song.previewUrl)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2rem", opacity: song.previewUrl ? 1 : 0.3 }}
                          disabled={!song.previewUrl}
                        >
                          {currentPreview === song.previewUrl ? "⏸" : "▶"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "gray" }}>Playlist is empty.</p>
                  )}
                </div>
              ) : (
                <p>No playlist.</p>
              )}

              {isParticipant && meal.playlist && (
                <button className="btn-add-music" onClick={() => setIsMusicModalOpen(true)}>
                  + Add Song
                </button>
              )}
            </div>
          </div>

          {/* komentari */}
          <div className="comments-section">
            <h2 className="section-title">Comments ({meal.comments.length})</h2>
            <div className="rating-container">
              <div className="big-rating">{meal.averageRating ? meal.averageRating.toFixed(1) : "0.0"}</div>
              <div className="stars-wrapper">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`star-input ${star <= userRating ? "active" : ""}`} onClick={() => handleRate(star)}>
                    ★
                  </span>
                ))}
              </div>
              <span style={{ color: "gray", fontSize: "0.9rem" }}>{userRating > 0 ? "Your rating" : "Rate event"}</span>
            </div>

            <div className="comment-list">
              {meal.comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <img src={comment.user.avatar} alt="" className="author-avatar" style={{ marginTop: "10px" }} />
                  <div className="comment-bubble">
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>@{comment.user.username}</div>
                    <div>{comment.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleComment} className="comment-form">
              <input type="text" className="comment-input" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              <button type="submit" className="btn-send">➤</button>
            </form>
          </div>

          {/* modal pretrage glazbe */}
          {isMusicModalOpen && (
            <div className="music-search-overlay" onClick={() => setIsMusicModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Add song to playlist</h3>
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Search Deezer..."
                  value={musicSearchQuery}
                  onChange={(e) => setMusicSearchQuery(e.target.value)}
                  autoFocus
                  style={{ width: "100%", marginBottom: "15px" }}
                />
                
                <div className="playlist-tracks" style={{ maxHeight: "300px", minHeight: "100px" }}>
                  {isSearchingMusic ? (
                     <div style={{textAlign: 'center', padding: '20px'}}>🎵 Searching...</div>
                  ) : musicResults.length > 0 ? (
                    musicResults.map((track) => (
                      <div key={track.id} className="menu-item" onClick={() => handleAddSong(track)}>
                        <img src={track.albumCover} alt="" className="menu-recipe-img" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "bold" }}>{track.title}</div>
                          <div style={{ fontSize: "0.8rem" }}>{track.artist}</div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePreview(track.previewUrl); }}
                          style={{ background: "transparent", border: "none", marginRight: 10, cursor: "pointer" }}
                        >
                          {currentPreview === track.previewUrl ? "⏸" : "▶"}
                        </button>
                        <span style={{ color: "green", fontWeight: "bold" }}>+</span>
                      </div>
                    ))
                  ) : (
                    musicSearchQuery.length > 2 && <p style={{textAlign: 'center'}}>No results.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default EventDetailsPage;
