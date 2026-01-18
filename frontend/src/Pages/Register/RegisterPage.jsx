import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./registerPage.css";
import AnimatedSection from "../../Components/AnimatedSection/AnimatedSection";
import Footer from "../../Components/Footer/Footer";
import SlidePageTransition from "../../Context/SlidePageTransition";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.52 12.29C23.52 11.43 23.44 10.61 23.3 9.81H12V14.41H18.45C18.17 15.86 17.31 17.1 16.05 17.94V20.87H19.92C22.19 18.78 23.52 15.7 23.52 12.29Z" fill="#4285F4"/>
    <path d="M12 24C15.24 24 17.96 22.92 19.93 21.11L16.06 18.18C14.98 18.9 13.6 19.33 12 19.33C8.87 19.33 6.22 17.21 5.27 14.36H1.27V17.47C3.25 21.41 7.33 24 12 24Z" fill="#34A853"/>
    <path d="M5.27 14.36C5.03 13.62 4.9 12.83 4.9 12C4.9 11.17 5.03 10.38 5.27 9.64V6.53H1.27C0.46 8.14 0 9.98 0 12C0 14.02 0.46 15.86 1.27 17.47L5.27 14.36Z" fill="#FBBC05"/>
    <path d="M12 4.67C13.76 4.67 15.34 5.28 16.58 6.47L19.99 3.06C17.95 1.16 15.24 0 12 0C7.33 0 3.25 2.59 1.27 6.53L5.27 9.64C6.22 6.79 8.87 4.67 12 4.67Z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9705 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.8 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="#1877F2"/>
    <path d="M16.6711 15.4688L17.2031 12H13.875V9.75C13.875 8.8 14.34 7.875 15.8306 7.875H17.3438V4.92188C17.3438 4.92188 15.9705 4.6875 14.6576 4.6875C11.9166 4.6875 10.125 6.34875 10.125 9.35625V12H7.07812V15.4688H10.125V23.8542C10.7434 23.9513 11.3705 24 12 24C12.6295 24 13.2566 23.9513 13.875 23.8542V15.4688H16.6711Z" fill="white"/>
  </svg>
);

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      await registerUser(dataToSend);
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
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
      <div className="register-wrapper">

        <header className="register-hero-section">
          <h1 className="register-hero-title">Register</h1>
          <p className="register-hero-subtitle">
            Create an account to start your culinary and music journey with us!
          </p>
        </header>

        <AnimatedSection className="register-content">
          <div className="register-card">
            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ana Anic"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. chef_ana"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ana@example.com"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
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
                  <label htmlFor="confirmPassword">Confirm Password</label>
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
                {isLoading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <div className="social-login-buttons">
              <button
                type="button"
                className="btn-social"
                onClick={() => handleSocialLogin("google")}
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                className="btn-social"
                onClick={() => handleSocialLogin("facebook")}
              >
                <FacebookIcon />
                Facebook
              </button>
            </div>

            <div className="login-redirect">
              <p className="text-small">
                Already have an account?{" "}
                <Link to="/login" className="link-highlight">
                  Login here
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

export default Register;
