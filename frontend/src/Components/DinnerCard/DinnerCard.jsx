import React from "react";
import "./dinnerCard.css";

const DinnerCard = ({ data }) => {
  // prikazuje karticu s podacima o večeri
  return (
    <div className="dinner-card">
      {/* placeholder za sliku */}
      <div className="card-image-placeholder"></div>

      <div className="card-content">
        <h2>{data.title}</h2>
        <p className="text-small">{data.description}</p>
      </div>
    </div>
  );
};

export default DinnerCard;
