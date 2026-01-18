import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";
import VinylReveal from "./VinylReveal";
import AnimatedSection from "../../Components/AnimatedSection/AnimatedSection";
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
        <header className="hero-section">
          <img className="homepage-hero-logo" src="/images/logo.svg" alt="FOODTUNE Logo" />
          <h1 className="hero-title">Perfect Dinner with Perfect Music</h1>
          <p className="hero-subtitle">
            FoodTune connects your favorite recipes with ideal playlists.
            Create an unforgettable atmosphere with a single click.
          </p>
        </header>

        {/* gurmanski recepti */}
        <AnimatedSection>
          <div className="section-text">
            <h2>Gourmet Recipes</h2>
            <p>
              Discover dishes that are not just food, but an experience. Our recipe database is carefully curated for every occasion.
            </p>
          </div>
          <div className="section-image-wrapper">
            <img src="/images/landingpage1.jpg" alt="Cooking" />
          </div>
        </AnimatedSection>

        {/* ritam kuhinje */}
        <AnimatedSection className="section-reverse">
          <div className="section-text">
            <h2>Your Kitchen's Rhythm</h2>
            <p>
              Forget the silence while cooking. Our algorithm selects music that follows the tempo of your dish preparation.
            </p>
          </div>
          <div className="section-image-wrapper">
            <img src="/images/landingpage2.jpg" alt="Music" />
          </div>
        </AnimatedSection>

        {/* zajednica i dijeljenje */}
        <AnimatedSection>
          <div className="section-text">
            <h2>Community and Sharing</h2>
            <p>
              Share your culinary and musical creations with other food enthusiasts.
            </p>
          </div>
          <div className="section-image-wrapper">
            <img src="/images/landingPage-img2.webp" alt="Community" />
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

        {/* magic sekcija */}
        <AnimatedSection className="landing-page-magic-section">
          <div className="section-text">
            <h2>Explore the Magic</h2>
            <p>
              Hover over the plate and discover the music hidden behind the flavors.
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
