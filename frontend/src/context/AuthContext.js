import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiService from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    if (apiService.isAuthenticated()) {
      try {
        const userData = await apiService.getUserData();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user data:', error);
        logout(); // Call logout if user data fetch fails
      }
    }
    setLoading(false);
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const data = await apiService.login(email, password);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const isAuthenticated = useCallback(() => {
    return apiService.isAuthenticated();
  }, []);

  const contextValue = {
    user,
    login,
    logout,
    loading,
    loadUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
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