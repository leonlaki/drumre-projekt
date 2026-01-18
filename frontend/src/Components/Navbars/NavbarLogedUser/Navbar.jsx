import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../Context/ThemeContext";
import { useAuth } from "../../../Context/AuthContext";
import { friendApi } from "../../../api/friendApi";
import { eventInviteApi } from "../../../api/eventInviteApi";
import "../navbar.css";

const NavbarLoged = () => {
  // dohvaćanje teme i funkcije za promjenu teme
  const { theme, toggleTheme } = useContext(ThemeContext);

  // stanje za otvaranje i zatvaranje izbornika
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // referenca za detekciju klika izvan izbornika
  const menuRef = useRef(null);

  // dohvaćanje funkcije za odjavu
  const { logoutUser } = useAuth();

  // navigacija nakon odjave
  const navigate = useNavigate();

  // stanje za broj notifikacija
  const [notifCount, setNotifCount] = useState(0);

  // dohvaćanje broja notifikacija pri prvom renderu
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [friendRequests, eventInvites] = await Promise.all([
          friendApi.getPendingRequests(),
          eventInviteApi.getMyInvites(),
        ]);

        const total =
          (friendRequests?.length || 0) + (eventInvites?.length || 0);

        setNotifCount(total);
      } catch (error) {
        console.error("failed to fetch notifications count", error);
      }
    };

    fetchNotifications();
  }, []);

  // odjava korisnika i preusmjeravanje
  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  // zatvaranje izbornika klikom izvan njega
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
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <div className="nav-center">
        <Link to="/home" className="nav-link">
          Home
        </Link>
        <p className="nav-link-separator">|</p>
        <Link to="/create-event" className="nav-link">
          Create Event
        </Link>
        <p className="nav-link-separator">|</p>
        <Link to="/my-recepies" className="nav-link">
          My Recepies
        </Link>
        <p className="nav-link-separator">|</p>
        <Link to="/friends" className="nav-link">
          Friends
        </Link>
      </div>

      <div className="navbar-logd-user-menu-wrapper" ref={menuRef}>
        <button
          className="navbar-logd-user-hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>

          {notifCount > 0 && <span className="nav-hamburger-badge"></span>}
        </button>

        <div
          className={`navbar-logd-user-dropdown ${isMenuOpen ? "show" : ""}`}
        >
          <div className="mobile-only-links">
            <Link
              to="/home"
              className="navbar-logd-user-item"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/create-event"
              className="navbar-logd-user-item"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Event
            </Link>
            <Link
              to="/my-recepies"
              className="navbar-logd-user-item"
              onClick={() => setIsMenuOpen(false)}
            >
              My Recepies
            </Link>
            <Link
              to="/friends"
              className="navbar-logd-user-item"
              onClick={() => setIsMenuOpen(false)}
            >
              Friends
            </Link>
            <div className="navbar-dropdown-separator"></div>
          </div>

          <Link
            to="/profile"
            className="navbar-logd-user-item"
            onClick={() => setIsMenuOpen(false)}
          >
            User Profile
          </Link>
          <Link
            to="/notifications"
            className="navbar-logd-user-item"
            onClick={() => setIsMenuOpen(false)}
          >
            Notifications
            {notifCount > 0 && (
              <span className="nav-dropdown-badge">{notifCount}</span>
            )}
          </Link>

          <button
            className="navbar-logd-user-item navbar-logd-user-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarLoged;
