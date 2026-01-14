// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import AnimatedRoutes from './AnimatedRoutes'; // Importaj novu komponentu
import './App.css';
import ScrollToTop from './Context/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        {/* Sva logika ruta i animacija je sada ovdje */}
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;