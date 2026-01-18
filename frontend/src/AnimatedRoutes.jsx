import React from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./Context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";

// Importi stranica
import LandingPage from "./Pages/Landing/LandingPage";
import LoginPage from "./Pages/Login/LoginPage";
import Register from "./Pages/Register/RegisterPage";
import Preferences from "./Pages/Preferences/Preferences";
import Home from "./Pages/Home/HomePage";
import Friends from "./Pages/Friends/Friends";
import CreateEvent from "./Pages/CreateEvent/CreateEvent";
import RecipeDetailsPage from "./Pages/RecipeDetails/RecipeDetailsPage";
import Notifications from "./Pages/Notifications/Notifications";
import ProfilePage from "./Pages/ProfilePage/ProfilePage";
import MyRecepies from "./Pages/MyRecepies/MyRecepies";
import EventDetailsPage from "./Pages/EventDetailsPage/EventDetailsPage";
import Navbar from "./Components/Navbars/NavbarLandingPage/Navbar";
import NavbarLoged from "./Components/Navbars/NavbarLogedUser/Navbar";
import "./App.css";

// PublicRoute: Ako je user logiran, ne daj mu na Login/Register
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* --- JAVNE RUTE --- */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Navbar />
              <LandingPage />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Navbar />
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Navbar />
              <Register />
            </PublicRoute>
          }
        />

        {/* --- ZAŠTIĆENA RUTA: PREFERENCES --- */}
        <Route element={<ProtectedRoute requireOnboarding={false} />}>
          <Route path="/preferences" element={<Preferences />} />
        </Route>

        {/* --- ZAŠTIĆENE RUTE: APLIKACIJA --- */}
        {/* OVDJE JE BILA GREŠKA: Maknuo sam <Routes> wrapper koji je bio viška */}
        
        {/* Prvi sloj: Provjera autorizacije (requireOnboarding=true) */}
        <Route element={<ProtectedRoute requireOnboarding={true} />}>
          
          {/* Drugi sloj: Layout s NavbarLoged */}
          <Route
            element={
              <>
                <NavbarLoged />
                <div className="content-container">
                  <Outlet />
                </div>
              </>
            }
          >
            {/* Treći sloj: Tvoje stvarne stranice */}
            <Route path="/home" element={<Home />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/my-recepies" element={<MyRecepies />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/recipe/:id" element={<RecipeDetailsPage />} />
            <Route path="/event/:id" element={<EventDetailsPage />} />
          </Route>
          
        </Route>

        {/* Catch-all ruta */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;