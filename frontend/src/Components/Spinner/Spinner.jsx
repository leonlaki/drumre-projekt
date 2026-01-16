import React from "react";
import { ScaleLoader } from "react-spinners";
import { motion } from "framer-motion";
import "./spinner.css";

const Spinner = () => {
  // Možemo dohvatiti boju iz CSS varijable ili staviti hardcodiranu.
  // Ovdje koristimo tvoju narančastu boju kao default.
  // Ako želiš da vuče točno iz CSS-a, možeš koristiti getComputedStyle, 
  // ali ovo je brže i radi super.
  const color = "#ff5722"; // Tvoja accent boja

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
        height={50} // Visina crtica
        width={6}   // Širina crtica
        radius={4}  // Zaobljenost
        margin={4}  // Razmak
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