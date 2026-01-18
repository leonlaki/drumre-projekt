import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./eventCard.css";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  // sigurno dohvaćanje autora iz podataka događaja
  const author = event.author || {};

  // određivanje imena autora s fallback vrijednošću
  const authorName = author.username || "Unknown Chef";

  // generiranje placeholder avatara ako avatar ne postoji
  const placeholderAvatar = `https://ui-avatars.com/api/?name=${authorName}&background=random&color=fff`;
  const authorAvatarUrl = author.avatar || placeholderAvatar;

  // određivanje naslovne slike s fallback vrijednošću
  const coverImage =
    event.image || "https://placehold.co/600x400/orange/white?text=FoodTune";

  // stanje za upravljanje avatar i cover slikama
  const [avatarSrc, setAvatarSrc] = useState(authorAvatarUrl);
  const [coverSrc, setCoverSrc] = useState(coverImage);

  // ažuriranje slika kada se promijeni događaj
  useEffect(() => {
    setAvatarSrc(authorAvatarUrl);
    setCoverSrc(coverImage);
  }, [event]);

  // izračun i formatiranje ocjene
  const rating = event.averageRating
    ? event.averageRating.toFixed(1)
    : "0.0";

  return (
    <div
      className="event-card"
      onClick={() => navigate(`/event/${event._id}`)}
    >
      <div className="event-card-header">
        <img
          src={coverSrc}
          alt={event.title}
          className="event-cover-img"
          onError={() =>
            setCoverSrc(
              "https://placehold.co/600x400/orange/white?text=No+Image"
            )
          }
        />

        <div className="event-author-avatar-wrapper">
          <img
            src={avatarSrc}
            alt={authorName}
            className="event-author-avatar"
            onError={() => setAvatarSrc(placeholderAvatar)}
          />
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>
        <span className="event-author-name">by {authorName}</span>

        <div className="event-stats">
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span>{rating}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👁️</span>
            <span>{event.viewCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
