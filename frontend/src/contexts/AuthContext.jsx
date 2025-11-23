import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        authAPI.getProfile()
          .then(response => {
            if (response.data.success) {
              setUser(response.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }
          })
          .catch(() => {
            // Token invalid, logout
            logout();
          });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const requestOTP = async (email) => {
    try {
      const response = await authAPI.requestOTP(email);
      return { 
        success: true, 
        message: response.data.message,
        otp: response.data.otp, // OTP returned in dev mode
        devMode: response.data.devMode
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to send OTP' 
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await authAPI.verifyOTP(email, otp);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Invalid OTP' 
      };
    }
  };

  const signup = async (name, email, password, language = 'urdu') => {
    setIsLoading(true);
    try {
      const response = await authAPI.register({ name, email, password, language });
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true, user };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to register' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return { success: true, user };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Invalid credentials' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('chatMessages');
  };

  const value = {
    user,
    isLoading,
    requestOTP,
    verifyOTP,
    signup,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
