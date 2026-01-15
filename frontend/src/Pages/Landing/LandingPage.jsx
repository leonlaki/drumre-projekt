import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import Navbar from "../../Components/Navbars/NavbarLandingPage/Navbar";
import Footer from "../../Components/Footer/Footer";
import VinylReveal from "./VinylReveal";
import AnimatedSection from "../../Components/AnimatedSection/AnimatedSection"; // <--- NOVI IMPORT (prilagodi putanju)
import "./LandingPage.css";
import SlidePageTransition from "../../Context/SlidePageTransition";

let hasRenderedOnce = false;

const LandingPage = () => {
  const shouldAnimate = hasRenderedOnce;
  useEffect(() => {
    hasRenderedOnce = true;
  }, []);

  return (
    <SlidePageTransition animateOnMount={shouldAnimate}>
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
            <p>
              Otkrij jela koja nisu samo hrana, već doživljaj. Naša baza
              recepata je pažljivo birana za svaku priliku.
            </p>
          </div>
          <div className="section-image-wrapper">
            <img src="/images/landingpage1.jfif" alt="Kuhanje" />
          </div>
        </AnimatedSection>

        {/* 2. CJELINA (Obrnuto) */}
        <AnimatedSection className="section-reverse">
          <div className="section-text">
            <h2>Ritam tvoje kuhinje</h2>
            <p>
              Zaboravi na tišinu dok kuhaš. Naš algoritam bira glazbu koja prati
              tempo tvoje pripreme jela.
            </p>
          </div>
          <div className="section-image-wrapper">
            <img src="/images/landingPage-img3.webp" alt="Glazba" />
          </div>
        </AnimatedSection>

        {/* 3. CJELINA */}
        <AnimatedSection>
          <div className="section-text">
            <h2>Zajednica i Dijeljenje</h2>
            <p>
              Podijeli svoje kulinarske i glazbene kreacije s drugim
              zaljubljenicima u dobru hranu.
            </p>
          </div>
          <div className="section-image-wrapper">
            <img src="/images/landingPage-img2.webp" alt="Zajednica" />
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="landing-page-button-wrapper">
            <Link to="/login" className="landing-page-button">
              Sign In
            </Link>
            <Link to="/register" className="landing-page-button">
              Register
            </Link>
          </div>
        </AnimatedSection>

        {/* MAGIC SECTION */}
        <AnimatedSection className="landing-page-magic-section">
          <div className="section-text">
            <h2>Istraži magiju</h2>
            <p>
              Prijeđi mišem preko tanjura i otkrij glazbu koja se krije iza
              okusa.
            </p>
          </div>
          <div className="section-image-wrapper">
            <VinylReveal />
          </div>
        </AnimatedSection>

        <Footer />
      </div>
    </SlidePageTransition>
  );
};

export default LandingPage;
