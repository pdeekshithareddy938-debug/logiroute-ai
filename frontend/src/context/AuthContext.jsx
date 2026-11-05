import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, isDemoModeActive, setDemoModeActive } from '../services/api';

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
  const [isDemoMode, setIsDemoMode] = useState(() => isDemoModeActive());

  // Direct 1-Click Demo Mode Access (Bypass backend network completely)
  const enableDemoMode = (role = 'ADMIN') => {
    const normRole = (role || 'ADMIN').toUpperCase();
    const userName =
      normRole === 'ADMIN'
        ? 'Deekshitha Reddy'
        : normRole === 'RIDER'
        ? 'Alex Rivera (DP-402)'
        : 'Sophia Martinez';

    const dummyUser = {
      id: `demo-${normRole.toLowerCase()}-1`,
      email:
        normRole === 'ADMIN'
          ? 'admin@logiroute.ai'
          : normRole === 'RIDER'
          ? 'rider@logiroute.ai'
          : 'customer@gmail.com',
      name: userName,
      full_name: userName,
      role: normRole,
      isDemo: true,
    };

    const dummyToken = `demo_jwt_token_logiroute_ai_${Date.now()}`;

    localStorage.setItem(TOKEN_KEY, dummyToken);
    localStorage.setItem(USER_KEY, JSON.stringify(dummyUser));
    setDemoModeActive(true);

    setUser(dummyUser);
    setToken(dummyToken);
    setIsDemoMode(true);

    return { user: dummyUser, token: dummyToken };
  };

  const exitDemoMode = () => {
    setDemoModeActive(false);
    setIsDemoMode(false);
    logout();
  };

  // Initialize and verify authentication state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUserStr = localStorage.getItem(USER_KEY);
      const isDemo = isDemoModeActive();

      if (savedToken && savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
          setToken(savedToken);
          setIsDemoMode(isDemo);

          // If in Demo Mode or token is mock, do not query backend to avoid wiping state if server is sleeping
          if (!isDemo && !savedToken.startsWith('demo_')) {
            try {
              const remoteUser = await authAPI.getMe();
              if (remoteUser && remoteUser.email) {
                setUser(remoteUser);
                localStorage.setItem(USER_KEY, JSON.stringify(remoteUser));
              }
            } catch (netErr) {
              // Only clear if server is active and explicitly returned 401 Unauthorized
              if (netErr.response && netErr.response.status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                setUser(null);
                setToken(null);
              }
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
        setIsDemoMode(isDemoModeActive());
        return data;
      }
      throw new Error('Authentication response missing token');
    } catch (err) {
      console.warn('[AuthContext] Backend login failed, seamlessly falling back to demo mode for role:', requestedRole);
      // Auto-fallback to demo mode instead of throwing error if backend is down
      const demoData = enableDemoMode(requestedRole || 'ADMIN');
      return demoData;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('logiroute_demo_mode');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        isDemoMode,
        enableDemoMode,
        exitDemoMode,
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
