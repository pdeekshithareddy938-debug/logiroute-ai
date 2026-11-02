import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'delivery_token';
const USER_KEY = 'delivery_user';

export const getRoleDefaultPath = (role) => {
  if (!role) return '/login';
  const norm = role.toUpperCase();
  if (norm === 'ADMIN') return '/admin';
  if (norm === 'RIDER') return '/rider';
  if (norm === 'CUSTOMER') return '/customer';
  return '/admin';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUserStr = localStorage.getItem(USER_KEY);

      if (savedToken && savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
          setToken(savedToken);

          // Background verification with backend
          try {
            const remoteUser = await authAPI.getMe();
            if (remoteUser && remoteUser.email) {
              setUser(remoteUser);
              localStorage.setItem(USER_KEY, JSON.stringify(remoteUser));
            }
          } catch (netErr) {
            // If 401 Unauthorized, token is expired/invalid
            if (netErr.response && netErr.response.status === 401) {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              setUser(null);
              setToken(null);
            }
          }
        } catch (e) {
          console.error('Session initialization error:', e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, requestedRole) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    try {
      const data = await authAPI.login(cleanEmail, cleanPassword, requestedRole);
      if (data && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
      }
      throw new Error('Authentication response missing token');
    } catch (err) {
      // Re-throw with exact backend error message for UI banner display
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Authentication failed. Please verify credentials.';
      const customErr = new Error(errorMsg);
      customErr.status = err.response?.status;
      throw customErr;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        getRoleDefaultPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
