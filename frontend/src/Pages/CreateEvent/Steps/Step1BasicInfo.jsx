import React from "react";

const Step1BasicInfo = ({ eventData, setEventData }) => {
  // ažurira polja eventa pri promjeni inputa
  const handleInputChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // generira preview slike
  const getPreviewImage = () => {
    if (eventData.image && eventData.image.trim() !== "") return eventData.image;
    const title = eventData.title || "Event";
    return `https://placehold.co/600x400/coral/white?text=${encodeURIComponent(title)}`;
  };

  return (
    <div className="step-card">
      <h2>Basic Information</h2>

      {/* preview slike */}
      <div
        style={{
          marginBottom: "1.5rem",
          borderRadius: "12px",
          overflow: "hidden",
          height: "200px",
          background: "#eee",
        }}
      >
        <img
          src={getPreviewImage()}
          alt="Preview"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div className="form-group">
        <label>Event Title</label>
        <input
          type="text"
          name="title"
          className="form-input"
          placeholder="e.g. Birthday Dinner"
          value={eventData.title}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Description (Invitation)</label>
        <textarea
          name="description"
          className="form-textarea"
          rows="3"
          placeholder="What are we celebrating?"
          value={eventData.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Date</label>
          <input
            type="date"
            name="date"
            className="form-input"
            value={eventData.date}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Time</label>
          <input
            type="time"
            name="time"
            className="form-input"
            value={eventData.time}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          className="form-input"
          placeholder="Address"
          value={eventData.location}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Cover Image (URL)</label>
        <input
          type="text"
          name="image"
          className="form-input"
          placeholder="https://..."
          value={eventData.image}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default Step1BasicInfo;
