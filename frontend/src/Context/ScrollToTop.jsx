// src/Components/ScrollToTop/ScrollToTop.jsx
import { useEffect } from "react";
// Ne treba nam više useLocation ovdje

const ScrollToTop = () => {
  useEffect(() => {
    // Ovo samo kaže pregledniku: "Nemoj ti upravljati skrolanjem kad stisnem Back button"
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []); // Prazan array - ovo se postavlja samo jednom kad se app učita

  return null;
};

export default ScrollToTop;