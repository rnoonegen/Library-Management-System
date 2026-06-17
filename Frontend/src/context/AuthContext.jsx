import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from 'services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'library_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await api.getMe();
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);
    api
      .getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { token, user: profile } = await api.login(username, password);
    localStorage.setItem(STORAGE_KEY, token);
    setAuthToken(token);
    setUser(profile);
    return profile;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshUser,
      isAdmin: user?.role === 'admin',
      isStandardUser: user?.role === 'teacher' || user?.role === 'student',
    }),
    [user, loading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

