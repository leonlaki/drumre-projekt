import React, { useLayoutEffect } from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const PageTransition = ({ children }) => {
  
  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
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
        // Dodajemo ovo da spriječimo pojavu scrollbara zbog animacije
        overflowX: "hidden", 
        // Osiguravamo da wrapper zauzima punu visinu kako ne bi kolabirao
        minHeight: "100vh" 
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;