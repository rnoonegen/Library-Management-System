import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler } from 'services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Session may already be expired.
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await api.getMe();
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    });
  }, []);

  useEffect(() => {
    api
      .getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { user: profile } = await api.login(username, password);
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
