'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMeApi, loginApi, logoutApi } from '@/services/auth-service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname === '/login') {
      setIsLoading(false);
      return;
    }
    getMeApi()
      .then((res) => {
        setUser(res?.data ?? null);
      })
      .catch(() => {
        setUser(null);
        // Stale or invalid cookie — clear it server-side and redirect to login.
        // /api/cms/auth/logout is permitAll so this works even with expired tokens.
        logoutApi().catch(() => {});
        window.location.href = '/login';
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email, password) {
    const res = await loginApi({ email, password });
    const userData = res?.data ?? null;
    setUser(userData);
    return userData;
  }

  async function logout() {
    await logoutApi().catch(() => {});
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
