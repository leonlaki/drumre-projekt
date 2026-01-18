import { useEffect } from "react";

// komponenta postavlja scrollRestoration na manualno
const ScrollToTop = () => {
  useEffect(() => {
    // sprječava automatski scroll kad korisnik pritisne Back
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return null;
};

export default ScrollToTop;
