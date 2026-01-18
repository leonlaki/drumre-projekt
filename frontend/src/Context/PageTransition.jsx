import React, { useLayoutEffect } from "react";
import { motion } from "framer-motion";

// animacije za prijelaz stranice
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const PageTransition = ({ children }) => {
  // scrollaj na vrh pri promjeni stranice
  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{
        width: "100%",
        overflowX: "hidden", // sprječava horizontalni scroll zbog animacije
        minHeight: "100vh", // osigurava da wrapper zauzima punu visinu
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
