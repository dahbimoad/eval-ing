import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import { jwtDecode } from 'jwt-decode';

import api from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const response = await api.post('/Auth/login', { email, password });
    const { accessToken, refreshToken } = response.data;

    Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'Strict' });
    localStorage.setItem('refreshToken', refreshToken);

    const decoded = jwtDecode(accessToken);
    setUser({ email: decoded.email, role: decoded.role });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
  
    try {
      if (refreshToken) {
        await api.post('/Auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error.response?.data || error.message);
      // Optionnel : afficher une notification à l'utilisateur
    } finally {
      // Supprimer tous les tokens du client
      Cookies.remove('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      // Rediriger vers la page de login
      window.location.href = '/login';
    }
  };
  

  const isAuthenticated = () => {
    const token = Cookies.get('accessToken');
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ email: decoded.email, role: decoded.role });
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
