import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    const initAuth = () => {
      try {
        const sessionUser = authService.getCurrentUser();
        if (sessionUser) {
          setUser(sessionUser);
        }
      } catch (err) {
        console.error('Error al inicializar autenticación:', err);
        authService.logout(); // Limpiar datos corruptos
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await authService.login(email, password);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await authService.register(formData);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.message || 'Error al crear la cuenta';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isAuthenticated = () => {
    return !!user && user.status === 'active';
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated,
    hasRole,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
