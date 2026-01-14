// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
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

// Mala pomoćna komponenta koja preusmjerava logirane korisnike s Landinga na Home
// (Da ne gledaju login formu ako su već unutra)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* JAVNE RUTE (Landing, Login, Register) */}
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

          {/* ZAŠTIĆENE RUTE (Samo za logirane) */}
          <Route element={<ProtectedRoute />}>
             <Route path="/home" element={<Home />} />
             {/* Ovdje dodaj ostale zaštićene rute npr. /profile, /recipes */}
          </Route>
          <Route element={<ProtectedRoute />}>
             <Route path="/friends" element={<Friends />} />
             {/* Ovdje dodaj ostale zaštićene rute npr. /profile, /recipes */}
          </Route>
          <Route element={<ProtectedRoute />}>
             <Route path="/my-events" element={<MyEvents />} />
             {/* Ovdje dodaj ostale zaštićene rute npr. /profile, /recipes */}
          </Route>
          <Route element={<ProtectedRoute />}>
             <Route path="/create-event" element={<CreateEvent />} />
             {/* Ovdje dodaj ostale zaštićene rute npr. /profile, /recipes */}
          </Route>

          {/* Catch-all ruta (404) */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;