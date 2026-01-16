// src/Pages/CreateEvent/Steps/Step4Guests.jsx
import React, { useState } from 'react';

const Step4Guests = ({ eventData, setEventData, friendsList }) => {
  const [friendSearchQuery, setFriendSearchQuery] = useState("");

  const toggleGuest = (friendId) => {
    const currentGuests = eventData.guests;
    if (currentGuests.includes(friendId)) {
      setEventData({ ...eventData, guests: currentGuests.filter(id => id !== friendId) });
    } else {
      setEventData({ ...eventData, guests: [...currentGuests, friendId] });
    }
  };

  const filteredFriends = friendsList.filter(f => 
    f.username.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  return (
    <div className="step-card">
      <h2>Pozovi Prijatelje 💌</h2>
      <div className="form-group">
        <input type="text" className="form-input" placeholder="Traži prijatelje..." value={friendSearchQuery} onChange={e => setFriendSearchQuery(e.target.value)} />
      </div>
      <div className="guests-grid">
         {filteredFriends.map(friend => {
           const isSelected = eventData.guests.includes(friend._id);
           return (
             <div key={friend._id} className={`guest-card ${isSelected ? 'selected' : ''}`} onClick={() => toggleGuest(friend._id)}>
                <img src={friend.avatar || "https://via.placeholder.com/40"} alt="" className="guest-avatar"/>
                <div className="guest-info">
                   <span className="guest-username">@{friend.username}</span>
                   <span className="guest-fullname">{friend.name}</span>
                </div>
                <div className="guest-checkbox">{isSelected && "✓"}</div>
             </div>
           );
         })}
      </div>
      <div style={{marginTop:'1rem', textAlign:'right', color:'var(--accent-color)'}}>
         Odabrano: {eventData.guests.length}
      </div>
    </div>
  );
};

export default Step4Guests;