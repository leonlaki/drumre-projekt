// src/pages/Register.jsx
import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../Components/Navbars/NavbarRegister/Navbar';
import './registerPage.css';
import AnimatedSection from '../../Components/AnimatedSection/AnimatedSection';
import Footer from '../../Components/Footer/Footer';

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  // State za podatke forme
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ažuriranje input polja
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(''); // Makni grešku čim korisnik počne tipkati
  };

  // Slanje forme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Validacija lozinki
    if (formData.password !== formData.confirmPassword) {
      setError('Lozinke se ne podudaraju.');
      setIsLoading(false);
      return;
    }

    // 2. Poziv API-ja za registraciju
    try {
      // Izdvajamo confirmPassword jer ga backend ne očekuje
      const { confirmPassword, ...dataToSend } = formData;
      
      await registerUser(dataToSend);
      
      // Ako je uspješno, vodi na Home
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Neuspješna registracija. Pokušajte ponovno.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Login handler
  const handleSocialLogin = (provider) => {
    // Redirekcija na backend rutu koja pokreće OAuth flow
    window.open(`http://localhost:3000/auth/${provider}`, "_self");
  };

  return (
    <div className="register-wrapper">
      <Navbar />
      
      <header className="hero-section">
        <h1 className="hero-title">Registriraj se</h1>
        <p className="hero-subtitle">
          Izradi korisnički račun kako bi započeo svoje kulinarsko i glazbeno putovanje s nama!
        </p>
      </header>

      <AnimatedSection className="register-content">
        <div className="register-card">
          
          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Ime i Prezime */}
            <div className="form-group">
              <label htmlFor="name">Ime i prezime</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="npr. Ana Anić"
                required
              />
            </div>

            {/* Korisničko ime */}
            <div className="form-group">
              <label htmlFor="username">Korisničko ime</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="npr. chef_ana"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email adresa</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ana@primjer.com"
                required
              />
            </div>

            {/* Lozinke - u jednom redu radi uštede prostora */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Lozinka</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="******"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Potvrdi lozinku</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="******"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Kreiranje...' : 'Kreiraj račun'}
            </button>
          </form>

          <div className="divider">
            <span>ili nastavi putem</span>
          </div>

          <div className="social-login-buttons">
            <button 
              type="button" 
              className="btn-social google"
              onClick={() => handleSocialLogin('google')}
            >
              Google
            </button>
            <button 
              type="button" 
              className="btn-social facebook"
              onClick={() => handleSocialLogin('facebook')}
            >
              Facebook
            </button>
          </div>

          <div className="login-redirect">
            <p className="text-small">
              Već imaš račun? <Link to="/login" className="link-highlight">Prijavi se ovdje</Link>
            </p>
          </div>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default Register;