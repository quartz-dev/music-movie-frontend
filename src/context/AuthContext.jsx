import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('authToken');
    setToken(currentToken);

    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.getUserProfile();
      setUser(res?.data || res);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    await refreshUser();
    return result;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      token,
      isLoggedIn: !!token,
      user,
      loading,
      login,
      logout,
      refreshUser,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
