import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';


const ProtectedRoute = ({ requireOnboarding = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();


  if (loading) {
    return null; 
  }


  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  
  if (requireOnboarding && !user.isOnboarded) {
    return <Navigate to="/preferences" replace />;
  }

 
  if (!requireOnboarding && user.isOnboarded) {
    return <Navigate to="/home" replace />;
  }

  
  return <Outlet />;
};

export default ProtectedRoute;