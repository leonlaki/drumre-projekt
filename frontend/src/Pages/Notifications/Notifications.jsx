import React from "react";
import SlidePageTransition from "../../Context/SlidePageTransition";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";

const Notifications = () => {
  return (
      <div>
        <Navbar />
        <SlidePageTransition>
        Notifications
        <Footer />
        </SlidePageTransition>
      </div>
  );
};

export default Notifications;
