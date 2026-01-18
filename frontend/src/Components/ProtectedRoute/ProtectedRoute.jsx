import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

// ruta koja štiti pristup prema autentikaciji i onboarding statusu
const ProtectedRoute = ({ requireOnboarding = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // prikazujemo ništa dok se učitava auth stanje
  if (loading) {
    return null;
  }

  // korisnik nije logiran -> preusmjeri na login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // ruta zahtijeva onboarding, a korisnik ga nema -> preusmjeri na preferences
  if (requireOnboarding && !user.isOnboarded) {
    return <Navigate to="/preferences" replace />;
  }

  // korisnik je već onboardan, ali pokušava pristupiti /preferences -> preusmjeri na home
  if (!requireOnboarding && user.isOnboarded) {
    return <Navigate to="/home" replace />;
  }

  // sve u redu -> prikaz sadržaja
  return <Outlet />;
};

export default ProtectedRoute;
