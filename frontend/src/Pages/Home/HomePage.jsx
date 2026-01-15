import React from "react";
import { Link } from "react-router-dom"; // Bitno za linkove
import "./homePage.css";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import AnimatedSection from "../../Components/AnimatedSection/AnimatedSection";
import CardRotator from "../../Components/CardRotator/CardRotator";
import PageTransition from "../../Context/PageTransition";

const HomePage = () => {
  return (
    <div className="homepage-wrapper">
      <Navbar />
      <PageTransition>
        {/* HERO SEKCIJA */}
        <div className="homepage-hero-section">
          <h1 className="homepage-hero-title">FOODTUNE</h1>
          <p className="homepage-hero-subtitle">
            Tvoj ritam kuhanja. Otkrij recepte koji sviraju tvoju melodiju,
            kreiraj simfoniju okusa i uživaj u svakom zalogaju bez granica.
          </p>
        </div>

        <div className="homepage-content-container">
          {/* POPULARNI SADRŽAJ */}
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">Simfonija okusa u trendu</h2>
            <p className="homepage-section-subtitle">
              Ovo su hitovi tjedna. Pogledaj što naša zajednica najviše kuha,
              voli i dijeli u ovom trenutku.
            </p>
          </div>

          <AnimatedSection className="homepage-animated-section">
            <CardRotator />
          </AnimatedSection>

          {/* PRILAGOĐENI SADRŽAJ */}
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">Skladano samo za tebe</h2>
            <p className="homepage-section-subtitle">
              Na temelju tvojih preferencija, pripremili smo listu recepata koji
              će savršeno odgovarati tvom kulinarskom stilu.
            </p>
          </div>

          <AnimatedSection className="homepage-animated-section">
            <CardRotator />
          </AnimatedSection>

          {/* --- NOVE SEKCIJE S LINKOVIMA --- */}

          {/* 1. LINK NA CREATE EVENT */}
          <AnimatedSection className="homepage-split-section">
            <div className="homepage-text-content">
              <h2>Započni novu simfoniju</h2>
              <p>
                Spreman si za kuhanje? Kreiraj novi event, odaberi jelo koje želiš 
                pripremiti i dodaj mu savršenu glazbenu pozadinu. Postavi scenu za 
                nezaboravnu večeru.
              </p>
              <Link to="/create-event" className="homepage-action-button">
                Kreiraj Event
              </Link>
            </div>
            <div className="homepage-image-wrapper">
              <img src="/images/landingPage-img1.png" alt="Kuhanje" />
            </div>
          </AnimatedSection>

          {/* 2. LINK NA MY EVENTS (Obrnuto) */}
          <AnimatedSection className="homepage-split-section section-reverse">
            <div className="homepage-text-content">
              <h2>Tvoji kulinarski trenutci</h2>
              <p>
                Pregledaj sve svoje prošle i nadolazeće evente na jednom mjestu. 
                Uredi svoje playliste, prisjeti se starih recepata ili planiraj 
                sljedeće druženje.
              </p>
              <Link to="/my-events" className="homepage-action-button">
                Moji Eventi
              </Link>
            </div>
            <div className="homepage-image-wrapper">
              <img src="/images/homepage2.webp" alt="Glazba" />
            </div>
          </AnimatedSection>

          {/* 3. LINK NA FRIENDS */}
          <AnimatedSection className="homepage-split-section">
            <div className="homepage-text-content">
              <h2>Poveži se s gurmanima</h2>
              <p>
                Pogledaj što tvoji prijatelji kuhaju i slušaju. 
                Pronađi inspiraciju u njihovim eventima i podijeli svoja iskustva 
                s ljudima koji dijele tvoju strast.
              </p>
              <Link to="/friends" className="homepage-action-button">
                Prijatelji
              </Link>
            </div>
            <div className="homepage-image-wrapper">
              <img src="/images/homepage3.jpg" alt="Prijatelji" />
            </div>
          </AnimatedSection>

        </div>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default HomePage;