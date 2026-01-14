import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {  useAuth } from './Context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

// Importi tvojih stranica (napravi ih prazne ako ih nemaš)
import LandingPage from './Pages/Landing/LandingPage';
import Home from './Pages/Home/HomePage';
import Login from './Pages/Login/LoginPage';
import Register from './Pages/Register/RegisterPage';
import './App.css';
import Friends from './Pages/Friends/Friends';
import MyEvents from './Pages/MyEvents/MyEvents';
import CreateEvent from './Pages/CreateEvent/CreateEvent';

// Tvoja PublicRoute komponenta (možeš je i ovdje definirati ili importati)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation(); // OVO nam treba za animaciju

  return (
    // mode="wait" osigurava da stara stranica nestane PRIJE nego nova dođe
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* JAVNE RUTE */}
        <Route path="/" element={
          <PublicRoute>
             <LandingPage />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
             <Login />
          </PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute>
             <Register />
          </PublicRoute>
        } />

        {/* ZAŠTIĆENE RUTE */}
        {/* Grupirao sam ih radi čistoće, ne moraš imati više Route element={<ProtectedRoute>} blokova */}
        <Route element={<ProtectedRoute />}>
           <Route path="/home" element={<Home />} />
           <Route path="/friends" element={<Friends />} />
           <Route path="/my-events" element={<MyEvents />} />
           <Route path="/create-event" element={<CreateEvent />} />
        </Route>

        {/* Catch-all ruta */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;