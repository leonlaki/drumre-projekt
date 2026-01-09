import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../Context/ThemeContext';
import './navbar.css'; // VAŽNO: Uvoz lokalnog CSS-a

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="navbar-container">
      <div className="nav-left">
        <button className="theme-switch" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <div className="nav-right">
        <div className="auth-buttons">
          <Link to="/login" className="login-link">Sign In</Link>
          <Link to="/register" className="register-btn">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;