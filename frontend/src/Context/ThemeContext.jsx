import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Inicijalizacija: uzmi iz localStorage ili stavi 'light'
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

  useEffect(() => {
    // Postavljamo data-theme na <html> element kako bi CSS znao koje varijable koristiti
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};