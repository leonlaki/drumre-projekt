// src/Components/ScrollToTop/ScrollToTop.jsx
import { useEffect } from "react";


const ScrollToTop = () => {
  useEffect(() => {
    
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []); 

  return null;
};

export default ScrollToTop;