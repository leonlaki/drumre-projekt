import React from "react";
import { ScaleLoader } from "react-spinners";
import { motion } from "framer-motion";
import "./spinner.css";

const Spinner = () => {
 
  const color = "#ff5722"; 

  return (
    <motion.div 
      className="spinner-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ScaleLoader 
        color={color} 
        height={50} 
        width={6}   
        radius={4}  
        margin={4}  
      />
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="loading-text"
      >
        Pripremanje sastojaka...
      </motion.p>
    </motion.div>
  );
};

export default Spinner;