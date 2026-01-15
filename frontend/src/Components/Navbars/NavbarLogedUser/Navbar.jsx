import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../../Context/ThemeContext';
import { useAuth } from '../../../Context/AuthContext';
import '../navbar.css'; 

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar-container">
      <div className="nav-left">
        <button className="theme-switch" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      {/* Ovi linkovi se vide samo na DESKTOPU (šire od 900px) */}
      <div className="nav-center">
        <Link to="/home" className="nav-link">Home</Link>
        <p className="nav-link-separator">|</p>
        <Link to="/create-event" className="nav-link">Create Event</Link>
        <p className="nav-link-separator">|</p>
        <Link to="/my-recepies" className="nav-link">My Recepies</Link>
        <p className="nav-link-separator">|</p>
        <Link to="/friends" className="nav-link">Friends</Link>
      </div>  

      {/* DESNA STRANA - HAMBURGER MENU */}
      <div className="navbar-logd-user-menu-wrapper" ref={menuRef}>
        
        <button 
          className="navbar-logd-user-hamburger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className={`navbar-logd-user-dropdown ${isMenuOpen ? 'show' : ''}`}>
          
          {/* --- MOBILE ONLY LINKOVI --- */}
          {/* Ovi linkovi su po defaultu skriveni, vide se samo na MOBITELU (< 900px) */}
          <div className="mobile-only-links">
            <Link to="/home" className="navbar-logd-user-item" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/create-event" className="navbar-logd-user-item" onClick={() => setIsMenuOpen(false)}>Create Event</Link>
            <Link to="/my-recepies" className="navbar-logd-user-item" onClick={() => setIsMenuOpen(false)}>My Recepies</Link>
            <Link to="/friends" className="navbar-logd-user-item" onClick={() => setIsMenuOpen(false)}>Friends</Link>
            {/* Linija razdvajanja */}
            <div className="navbar-dropdown-separator"></div>
          </div>
          
          {/* --- STANDARDNI LINKOVI --- */}
          <Link to="/profile" className="navbar-logd-user-item" onClick={() => setIsMenuOpen(false)}>
            User Profile
          </Link>
          <Link to="/notifications" className="navbar-logd-user-item" onClick={() => setIsMenuOpen(false)}>
            Notifications
          </Link>
          
          <button className="navbar-logd-user-item navbar-logd-user-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;