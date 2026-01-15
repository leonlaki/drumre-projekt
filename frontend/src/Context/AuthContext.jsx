// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const data = await authApi.getCurrentUser();
        // Backend vraća user objekt ili null
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

  const loginUser = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data;
  };

  const registerUser = async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.user);
    return data;
  };

  const logoutUser = async () => {
    await authApi.logout();
    setUser(null);
  };

  // NOVA FUNKCIJA: Ažurira podatke o korisniku u stanju bez ponovnog fetchanja
  // Koristit ćemo ovo kad spremimo preference da postavimo isOnboarded: true
  const updateLocalUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser, updateLocalUser }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);