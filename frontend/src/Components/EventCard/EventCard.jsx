import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './eventCard.css';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  // 1. SIGURNO IZVLAČENJE PODATAKA
  // Ako author ne postoji (undefined), koristimo "dummy" objekt
  const author = event.author || {}; 
  
  const authorName = author.username || "Nepoznati Chef";
  
  // Ako nema avatara, generiraj ga na temelju imena (ili "Unknown")
  const placeholderAvatar = `https://ui-avatars.com/api/?name=${authorName}&background=random&color=fff`;
  const authorAvatarUrl = author.avatar || placeholderAvatar;

  const coverImage = event.image || "https://placehold.co/600x400/orange/white?text=FoodTune";

  // State za slike (za fallback ako link pukne)
  const [avatarSrc, setAvatarSrc] = useState(authorAvatarUrl);
  const [coverSrc, setCoverSrc] = useState(coverImage);

  // Ažuriraj state ako se props promijene (npr. kod pretrage)
  useEffect(() => {
    setAvatarSrc(authorAvatarUrl);
    setCoverSrc(coverImage);
  }, [event]);

  // Izračun ocjene
  const rating = event.averageRating 
    ? event.averageRating.toFixed(1) 
    : "0.0";

  return (
    <div className="event-card" onClick={() => navigate(`/event/${event._id}`)}>
      
      <div className="event-card-header">
        <img 
          src={coverSrc} 
          alt={event.title} 
          className="event-cover-img"
          onError={() => setCoverSrc("https://placehold.co/600x400/orange/white?text=No+Image")}
        />
        
        <div className="event-author-avatar-wrapper">
           <img 
             src={avatarSrc} 
             alt={authorName} 
             className="event-author-avatar"
             // Ako slika avatara pukne (404), vrati na placeholder sa slovima
             onError={() => setAvatarSrc(placeholderAvatar)}
           />
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>
        <span className="event-author-name">
            by {authorName}
        </span>
        
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