import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import apiService from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const loadUser = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      try {
        const userData = await apiService.getUserData();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user data:', error);
        logout(); // Call logout if refresh fails
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    console.log('AuthContext: login function called');
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.log('AuthContext: Login process timed out');
        resolve({ success: false, error: 'Login process timed out' });
      }, 15000); // 15 seconds timeout
  
      apiService.login(email, password)
        .then(data => {
          clearTimeout(timeoutId);
          console.log('AuthContext: Received data from apiService.login:', data);
          if (data.accessToken && data.refreshToken) {
            setUser(data.user);
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            console.log('AuthContext: Login successful');
            resolve({ success: true });
          } else {
            console.log('AuthContext: Login failed - no tokens in response');
            resolve({ success: false, error: 'Login failed: Invalid response from server' });
          }
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.error('AuthContext: Login failed:', error);
          resolve({ success: false, error: error.message || 'Login failed' });
        });
    });
  };

  const register = async (userData) => {
    try {
      const data = await apiService.register(userData);
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem('accessToken');
  }, []);

  const contextValue = {
    user,
    setUser,
    login,
    register,
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