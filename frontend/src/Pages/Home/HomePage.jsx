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
      <AnimatedSection>
        <CardRotator />
      </AnimatedSection>
      <Footer />
    </div>
  )
}

export default HomePage