import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civicpulse_token'));
  const [loading, setLoading] = useState(true);
  const [currentCoords, setCurrentCoords] = useState(null);

  // Initialize Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation permission not granted or unavailable, defaulting to Munnar/Regional coordinates:", error);
          setCurrentCoords({ latitude: 10.0889, longitude: 77.0595 });
        },
        { timeout: 8000 }
      );
    } else {
      setCurrentCoords({ latitude: 10.0889, longitude: 77.0595 });
    }
  }, []);

  // Fetch current user on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        localStorage.removeItem('civicpulse_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('civicpulse_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('civicpulse_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('civicpulse_token');
    setToken(null);
    setUser(null);
  };

  const loginAsDemo = async (role = 'citizen') => {
    if (role === 'admin') {
      return await login('admin@civicpulse.org', 'Admin@123');
    }
    return await login('citizen@civicpulse.org', 'Citizen@123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        currentCoords,
        setCurrentCoords,
        login,
        register,
        logout,
        loginAsDemo,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
