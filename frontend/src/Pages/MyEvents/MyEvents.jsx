import React from "react";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";

const MyEvents = () => {
  return (
    <div>
      <Navbar />
      <PageTransition>
        MyEvents     
      <Footer />
      </PageTransition>
    </div>
  );
};

export default MyEvents;
