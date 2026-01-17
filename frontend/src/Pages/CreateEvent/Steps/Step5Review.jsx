
import React from 'react';

const Step5Review = ({ eventData, friendsList, onPublish, loading }) => {
  
  const getPreviewImage = () => {
    if (eventData.image && eventData.image.trim() !== "") return eventData.image;
    return `https://placehold.co/600x400/orange/white?text=${encodeURIComponent(eventData.title || "Event")}`;
  };

  return (
    <div className="step-card review-summary">
       <div className="review-header-card">
          <img src={getPreviewImage()} alt="Cover" className="review-img" />
          <div className="review-details">
             <h2>{eventData.title || "Bez naslova"}</h2>
             <p>{eventData.description || "Nema opisa"}</p>
             <div className="review-meta">
                <span>📅 {eventData.date}</span>
                <span>📍 {eventData.location}</span>
             </div>
          </div>
       </div>

       <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
          <div className="review-section">
             <h3>🍽️ Jelovnik</h3>
             <ul className="summary-list">
                {eventData.courses.map((c, i) => (
                  <li key={i}><b>{c.courseType}:</b> {c.recipe.title}</li>
                ))}
             </ul>
          </div>
          <div className="review-section">
             <h3>🎵 & 👥 Detalji</h3>
             <ul className="summary-list">
                <li><b>Glazba:</b> {eventData.playlistSongs.length} pjesama</li>
                <li><b>Gosti:</b> {eventData.guests.length} pozvanih</li>
             </ul>
             <div style={{marginTop:'10px', display:'flex', gap:'5px'}}>
                {eventData.guests.slice(0, 5).map(guestId => {
                   const friend = friendsList.find(f => f._id === guestId);
                   return friend ? <img key={guestId} src={friend.avatar} alt="" style={{width:30, height:30, borderRadius:'50%'}} /> : null;
                })}
             </div>
          </div>
       </div>

       <button className="btn-publish" onClick={onPublish} disabled={loading}>
          {loading ? "Kreiranje Eventa..." : "🎉 Objavi Event"}
       </button>
    </div>
  );
};

export default Step5Review;