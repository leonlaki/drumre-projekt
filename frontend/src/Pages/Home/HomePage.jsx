import React from 'react'
import "./homePage.css"
import Navbar from '../../Components/Navbars/NavbarLogedUser/Navbar';
import Footer from '../../Components/Footer/Footer';
import AnimatedSection from '../../Components/AnimatedSection/AnimatedSection';
import CardRotator from '../../Components/CardRotator/CardRotator';

const HomePage = () => {
  return (
    <div className='homepage-wrapper'>
      <Navbar />
      
      {/* 1. HERO SEKCIJA - Dizajn identičan .hero-section iz LandingPage */}
      <div className='homepage-hero-section'>
        <h1 className='homepage-hero-title'>FOODTUNE</h1>
        <p className='homepage-hero-subtitle'>
          Tvoj ritam kuhanja. Otkrij recepte koji sviraju tvoju melodiju, 
          kreiraj simfoniju okusa i uživaj u svakom zalogaju bez granica.
        </p>
      </div>

      <div className='homepage-content-container'>
        
        {/* 2. POPULARNI SADRŽAJ */}
        <div className='homepage-section-header'>
          <h2 className='homepage-section-title'>Simfonija okusa u trendu</h2>
          <p className='homepage-section-subtitle'>
            Ovo su hitovi tjedna. Pogledaj što naša zajednica najviše kuha, 
            voli i dijeli u ovom trenutku.
          </p>
        </div>

        <AnimatedSection className="homepage-animated-section">
          <CardRotator />
        </AnimatedSection>


        {/* 3. PRILAGOĐENI SADRŽAJ */}
        <div className='homepage-section-header'>
          <h2 className='homepage-section-title'>Skladano samo za tebe</h2>
          <p className='homepage-section-subtitle'>
            Na temelju tvojih preferencija, pripremili smo listu recepata 
            koji će savršeno odgovarati tvom kulinarskom stilu.
          </p>
        </div>

        <AnimatedSection className="homepage-animated-section">
          <CardRotator />
        </AnimatedSection>

      </div>

      <Footer />
    </div>
  )
}

export default HomePage