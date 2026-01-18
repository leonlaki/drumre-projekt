import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // stanje za korisnika i učitavanje
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // provjera je li korisnik logiran pri inicijalizaciji
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

  // funkcija za prijavu
  const loginUser = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data;
  };

  // funkcija za registraciju
  const registerUser = async (userData) => {
    const data = await authApi.register(userData);
    setUser(data.user);
    return data;
  };

  // funkcija za odjavu
  const logoutUser = async () => {
    await authApi.logout();
    setUser(null);
  };

  // ažurira lokalni user objekt bez ponovnog fetchanja
  const updateLocalUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, registerUser, logoutUser, updateLocalUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// hook za dohvat AuthContexta
export const useAuth = () => useContext(AuthContext);
