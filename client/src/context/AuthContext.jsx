import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('librachain_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('librachain_token');
      if (storedToken) {
        try {
          const res = await api.getProfile();
          if (res.success && res.user) {
            setUser({ ...res.user, stats: res.stats });
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('librachain_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('librachain_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.register(userData);
      if (res.success) {
        localStorage.setItem('librachain_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('librachain_token');
    setToken(null);
    setUser(null);
  };

  const updateWalletAddress = async (walletAddress) => {
    if (!user) return;
    try {
      const res = await api.updateProfile({ walletAddress });
      if (res.success && res.user) {
        setUser((prev) => ({ ...prev, walletAddress: res.user.walletAddress }));
      }
    } catch (e) {
      console.error('Failed to sync wallet to user profile:', e);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.user) {
        setUser({ ...res.user, stats: res.stats });
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    loading,
    authError,
    login,
    register,
    logout,
    updateWalletAddress,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
