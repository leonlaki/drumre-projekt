// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useAuth();

  // Ako korisnik nije logiran, preusmjeri na Landing ("/")
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Ako je logiran, prikaži traženu rutu (Home, Profile, itd.)
  return <Outlet />;
};

export default ProtectedRoute;