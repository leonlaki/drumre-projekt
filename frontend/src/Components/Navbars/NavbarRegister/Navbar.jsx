import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../Context/ThemeContext";
import "../navbar.css";

const Navbar = () => {
  // dohvaća aktivnu temu i funkciju za promjenu teme
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="navbar-container">
      <div className="nav-left">
        {/* gumb za prebacivanje između svijetle i tamne teme */}
        <button className="theme-switch" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <div className="nav-right">
        <div className="auth-buttons">
          {/* linkovi za prijavu i registraciju */}
          <Link to="/login" className="login-link">Sign In</Link>
          <Link to="/register" className="register-btn">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
