import React from "react";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";

const CreateEvent = () => {
  return (
    <div>
      <Navbar />     
      <PageTransition>
        CreateEvent 
      <Footer />
      </PageTransition>
    </div>
  );
};

export default CreateEvent;
