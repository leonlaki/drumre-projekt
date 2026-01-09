import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Navbar from '../../Components/NavbarLandingPage/Navbar';
import './LandingPage.css';
import Footer from '../../Components/Footer/Footer';

// Podkomponenta za animirane sekcije
const AnimatedSection = ({ children, className }) => {
  // threshold: 0.1 znači da animacija kreće čim se vrh sekcije pojavi
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px', // Animira se 100px prije nego uđe u skroz vidljivo polje
    triggerOnce: true, // Ovo drastično ubrzava performanse jer nakon prve animacije JS prestaje pratiti element
  });

  return (
    <div 
      ref={ref} 
      className={`section-container ${className} ${inView ? 'visible' : 'hidden'}`}
    >
      {children}
    </div>
  );
};


const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      <Navbar />
      
      <header className="hero-section">
        <h1 className="hero-title">Savršena večera uz savršenu glazbu</h1>
        <p className="hero-subtitle">
          FoodTune povezuje tvoje omiljene recepte s idealnim playlistama. 
          Stvori atmosferu koja se pamti jednim klikom.
        </p>
      </header>

      {/* 1. CJELINA */}
      <AnimatedSection>
        <div className="section-text">
          <h2>Gurmanski Recepti</h2>
          <p>Otkrij jela koja nisu samo hrana, već doživljaj. Naša baza recepata je pažljivo birana za svaku priliku.</p>
        </div>
        <div className="section-image-wrapper">
          <img src="/images/landingPage-img1.png" alt="Kuhanje" />
        </div>
      </AnimatedSection>

      {/* 2. CJELINA (Obrnuto) */}
      <AnimatedSection className="section-reverse">
        <div className="section-text">
          <h2>Ritam tvoje kuhinje</h2>
          <p>Zaboravi na tišinu dok kuhaš. Naš algoritam bira glazbu koja prati tempo tvoje pripreme jela.</p>
        </div>
        <div className="section-image-wrapper">
          <img src="/images/landingPage-img3.webp" alt="Glazba" />
        </div>
      </AnimatedSection>

      {/* 3. CJELINA */}
      <AnimatedSection>
        <div className="section-text">
          <h2>Zajednica i Dijeljenje</h2>
          <p>Podijeli svoje kulinarske i glazbene kreacije s drugim zaljubljenicima u dobru hranu.</p>
        </div>
        <div className="section-image-wrapper">
          <img src="/images/landingPage-img2.webp" alt="Zajednica" />
        </div>
      </AnimatedSection>
      <Footer />
    </div>
  );
};

export default LandingPage;