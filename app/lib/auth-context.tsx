'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from './api';
import type { User } from './types';
import { WEB_ALLOWED_ROLES } from './utils';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateLocalUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          const parsed: User = JSON.parse(storedUser);
          if (WEB_ALLOWED_ROLES.includes(parsed.role)) {
            setUser(parsed);
          } else {
            // Stale session from a role that's no longer permitted on the web portal.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    })();
  }, []);

  const updateLocalUser = useCallback((u: User) => {
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user: loggedInUser } = await api.auth.login(email, password);
      if (!WEB_ALLOWED_ROLES.includes(loggedInUser.role)) {
        throw new Error('Manager and installer accounts can only sign in through the SimpliGreen mobile app.');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await api.auth.me();
      updateLocalUser(fresh);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) logout();
    }
  }, [updateLocalUser, logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
