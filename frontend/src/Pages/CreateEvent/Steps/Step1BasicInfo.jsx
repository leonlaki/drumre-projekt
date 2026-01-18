// src/Pages/CreateEvent/Steps/Step1BasicInfo.jsx
import React from 'react';

const Step1BasicInfo = ({ eventData, setEventData }) => {
  
  const handleInputChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const getPreviewImage = () => {
    if (eventData.image && eventData.image.trim() !== "") return eventData.image;
    const title = eventData.title || "Event";
    return `https://placehold.co/600x400/coral/white?text=${encodeURIComponent(title)}`;
  };

  return (
    <div className="step-card">
      <h2>Osnovne Informacije</h2>

      <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', height: '200px', background: '#eee' }}>
        <img src={getPreviewImage()} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div className="form-group">
        <label>Naziv Eventa</label>
        <input type="text" name="title" className="form-input" placeholder="npr. Rođendanska večera" value={eventData.title} onChange={handleInputChange} />
      </div>

      <div className="form-group">
        <label>Opis (Pozivnica)</label>
        <textarea name="description" className="form-textarea" rows="3" placeholder="Što slavimo?" value={eventData.description} onChange={handleInputChange} />
      </div>

      <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Datum</label>
          <input type="date" name="date" className="form-input" value={eventData.date} onChange={handleInputChange} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Vrijeme</label>
          <input type="time" name="time" className="form-input" value={eventData.time} onChange={handleInputChange} />
        </div>
      </div>

      <div className="form-group">
        <label>Lokacija</label>
        <input type="text" name="location" className="form-input" placeholder="Adresa" value={eventData.location} onChange={handleInputChange} />
      </div>
       <div className="form-group">
        <label>Naslovna Slika (URL)</label>
        <input type="text" name="image" className="form-input" placeholder="https://..." value={eventData.image} onChange={handleInputChange} />
      </div>
    </div>
  );
};

export default Step1BasicInfo;