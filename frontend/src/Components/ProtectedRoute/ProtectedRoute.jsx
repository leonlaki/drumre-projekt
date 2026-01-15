import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

/**
 * requireOnboarding (default: true)
 * - TRUE: Koristi se za sve glavne rute (Home, Profile...). Ako korisnik nije odabrao preferencije, baca ga na /preferences.
 * - FALSE: Koristi se SAMO za samu /preferences rutu. Pušta korisnika unutra da ih odabere.
 */
const ProtectedRoute = ({ requireOnboarding = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Dok AuthContext provjerava sesiju, ne radimo ništa (ili vratimo Spinner)
  if (loading) {
    return null; 
  }

  // 1. Nisi logiran? -> Login (pamti odakle si došao)
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Logiran si, ali ruta zahtijeva onboarding (npr. Home), a ti ga nemaš?
  // -> Idi na Preferences
  if (requireOnboarding && !user.isOnboarded) {
    return <Navigate to="/preferences" replace />;
  }

  // 3. Logiran si i VEĆ si onboardan, a pokušavaš doći na /preferences?
  // -> Nema smisla da biraš ponovno (osim kroz settings), idi na Home
  if (!requireOnboarding && user.isOnboarded) {
    return <Navigate to="/home" replace />;
  }

  // Sve OK -> Prikaži sadržaj
  return <Outlet />;
};

export default ProtectedRoute;