import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './Context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

// Importi stranica
import LandingPage from './Pages/Landing/LandingPage';
import LoginPage from './Pages/Login/LoginPage';
import Register from './Pages/Register/RegisterPage';
import Preferences from './Pages/Preferences/Preferences'; // <--- DODANO
import Home from './Pages/Home/HomePage';
import Friends from './Pages/Friends/Friends';
import MyEvents from './Pages/MyEvents/MyEvents';
import CreateEvent from './Pages/CreateEvent/CreateEvent';

import './App.css';
import Notifications from './Pages/Notifications/Notifications';
import ProfilePage from './Pages/ProfilePage/ProfilePage';

// PublicRoute: Ako je user logiran, ne daj mu na Login/Register
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  // Ako je logiran, šaljemo ga na Home. 
  // (Napomena: ProtectedRoute na /home će ga automatski prebaciti na /preferences ako nije onboardan)
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
        <Route path="/" element={
          <PublicRoute>
             <LandingPage />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
             <LoginPage />
          </PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute>
             <Register />
          </PublicRoute>
        } />

        {/* --- ZAŠTIĆENA RUTA: PREFERENCES --- */}
        {/* requireOnboarding={false} znači: "Pusti ga unutra čak i ako nema preferencije" */}
        <Route element={<ProtectedRoute requireOnboarding={false} />}>
           <Route path="/preferences" element={<Preferences />} />
        </Route>

        {/* --- ZAŠTIĆENE RUTE: APLIKACIJA --- */}
        {/* requireOnboarding={true} (default) znači: "Pusti ga SAMO ako ima preferencije" */}
        <Route element={<ProtectedRoute requireOnboarding={true} />}>
           <Route path="/home" element={<Home />} />
           <Route path="/friends" element={<Friends />} />
           <Route path="/my-events" element={<MyEvents />} />
           <Route path="/create-event" element={<CreateEvent />} />
           <Route path="/notifications" element={<Notifications />} />
           <Route path="/profile" element={<ProfilePage />} />
           <Route path="/profile/:username" element={<ProfilePage />} />
        </Route>

        {/* Catch-all ruta */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;