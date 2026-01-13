// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Dok provjeravamo sesiju

  // Na prvom učitavanju (F5) provjeri backend jel user logiran
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const data = await authApi.getCurrentUser();
        if (data && data._id) {
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Funkcija za login koja se poziva iz Login forme
  const loginUser = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user); // Postavi usera u state
    return data;
  };

  // Funkcija za registraciju
  const registerUser = async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.user); // Odmah logiraj korisnika nakon registracije
    return data;
  };

  const logoutUser = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

// Custom hook za lakši pristup podacima
export const useAuth = () => useContext(AuthContext);