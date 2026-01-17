import React from 'react';
import { useNavigate } from 'react-router-dom';
import './eventCard.css';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  // Sigurna provjera slike
  const coverImage = event.image || "https://placehold.co/600x400/orange/white?text=FoodTune";
  const authorAvatar = event.author?.avatar || "https://ui-avatars.com/api/?name=User";
  const authorName = event.author?.username || "Nepoznati chef";

  // Izračun prosječne ocjene (ako već nije izračunato na backendu)
  const rating = event.averageRating 
    ? event.averageRating.toFixed(1) 
    : (event.ratings && event.ratings.length > 0 
        ? (event.ratings.reduce((a, b) => a + b.value, 0) / event.ratings.length).toFixed(1) 
        : "0.0");

  return (
    <div className="event-card" onClick={() => navigate(`/event/${event._id}`)}>
      
      {/* 1. GORNJI DIO: SLIKA */}
      <div className="event-card-header">
        <img src={coverImage} alt={event.title} className="event-cover-img" />
        
        {/* 2. SREDINA: AVATAR (Pozicioniran apsolutno) */}
        <div className="event-author-avatar-wrapper">
           <img src={authorAvatar} alt={authorName} className="event-author-avatar" />
        </div>
      </div>

      {/* 3. DONJI DIO: DETALJI */}
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