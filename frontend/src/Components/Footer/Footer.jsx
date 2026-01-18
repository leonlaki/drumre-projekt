import React from "react";
import "./Footer.css";

const Footer = () => {
  // prikazuje footer sekciju stranice
  return (
    <footer className="footer-container">
      <div className="footer-image-section"></div>

      <div className="footer-content">
        <div className="footer-logo">FOODTUNE</div>

        <div className="footer-links">
          <a href="#about">About us</a>
          <a href="#privacy">Privacy</a>
          <a href="#contact">Contact</a>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} FoodTune. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
