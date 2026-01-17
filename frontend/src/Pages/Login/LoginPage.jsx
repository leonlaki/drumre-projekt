import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext"; // Prilagodi putanju
import Footer from "../../Components/Footer/Footer";
import AnimatedSection from "../../Components/AnimatedSection/AnimatedSection";
import "./loginPage.css";
import SlidePageTransition from "../../Context/SlidePageTransition";

const LoginPage = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "", // Passport local strategy obično očekuje 'username'
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginUser(formData);
      // Ako login prođe (nema errora), preusmjeri na home
      navigate("/home");
    } catch (err) {
      console.error(err);
      // Backend obično vraća poruku u err.response.data.message
      setError(
        err.response?.data?.message || "Neispravno korisničko ime ili lozinka."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.open(`http://localhost:3000/auth/${provider}`, "_self");
  };

  return (
    <SlidePageTransition>
      <div className="login-wrapper">
        <header className="login-hero-section">
          <h1 className="login-hero-title">Dobrodošli natrag</h1>
          <p className="login-hero-subtitle">
            Nastavi gdje si stao/la. Tvoji recepti i playliste te čekaju.
          </p>
        </header>

        <AnimatedSection className="login-content-section">
          <div className="login-card">
            <div className="login-header">
              <h2>Prijava</h2>
              <p className="text-small">Unesi svoje podatke za pristup</p>
            </div>

            {error && <div className="login-error-msg">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="username">Korisničko ime</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Unesi korisničko ime"
                  className="login-input"
                  required
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="password">Lozinka</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Unesi lozinku"
                  className="login-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="login-btn-submit"
                disabled={isLoading}
              >
                {isLoading ? "Prijava..." : "Prijavi se"}
              </button>
            </form>

            <div className="login-divider">
              <span>ili se prijavi putem</span>
            </div>

            <div className="login-social-buttons">
              <button
                type="button"
                className="login-btn-social"
                onClick={() => handleSocialLogin("google")}
              >
                Google
              </button>
              <button
                type="button"
                className="login-btn-social"
                onClick={() => handleSocialLogin("facebook")}
              >
                Facebook
              </button>
            </div>

            <div className="login-footer-text">
              <p className="text-small">
                Nemaš račun?{" "}
                <Link to="/register" className="login-link-highlight">
                  Registriraj se
                </Link>
              </p>
            </div>
          </div>
        </AnimatedSection>

        <Footer />
      </div>
    </SlidePageTransition>
  );
};

export default LoginPage;
