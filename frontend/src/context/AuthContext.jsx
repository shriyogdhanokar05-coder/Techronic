import React, { createContext, useState, useEffect, useCallback } from 'react';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../constants/config';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Synchronize state with backend on mount
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to load user with token:', err);
          // Don't log out immediately if offline/dev, but if 401 interceptor handles it
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    if (data && data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async (registrationData) => {
    const data = await authService.register(registrationData);
    if (data && data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const updated = await userService.getProfile();
      setUser(updated);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  }, [token]);

  const value = {
    token,
    user,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshProfile,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
