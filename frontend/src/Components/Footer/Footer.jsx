import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Sekcija sa slikom koja se mijenja ovisno o temi */}
      <div className="footer-image-section"></div>

      <div className="footer-content">
        <div className="footer-logo">FOODTUNE</div>
        
        <div className="footer-links">
          <a href="#about">O nama</a>
          <a href="#privacy">Privatnost</a>
          <a href="#contact">Kontakt</a>
        </div>
      </div>
      
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} FoodTune. Sva prava pridržana.
      </div>
    </footer>
  );
};

export default Footer;