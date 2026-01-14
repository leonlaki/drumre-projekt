import React from "react";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";

const Friends = () => {
  return (
    <div>
      <Navbar />
      <PageTransition>
        Friends     
      <Footer />
      </PageTransition>
    </div>
  );
};

export default Friends;
