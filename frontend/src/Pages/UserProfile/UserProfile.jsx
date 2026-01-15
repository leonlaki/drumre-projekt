import React from "react";
import SlidePageTransition from "../../Context/SlidePageTransition";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";

const UserProfile = () => {
  return (
    <div>
      <Navbar />
      <SlidePageTransition>
        Userprofile
        <Footer />
      </SlidePageTransition>
    </div>
  );
};

export default UserProfile;
