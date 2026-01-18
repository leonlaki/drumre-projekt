import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import AnimatedRoutes from './AnimatedRoutes';
import './App.css';
import ScrollToTop from './Context/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        {/* prikaz ruta i animacija */}
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
