import React, { createContext, useState, useEffect } from "react";

// kontekst za temu (light/dark)
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // inicijalna tema iz localStorage ili 'light'
  const [theme, setTheme] = useState(localStorage.getItem("app-theme") || "light");

  // ažurira html atribut i sprema u localStorage kad se promijeni
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  // toggle između light i dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
