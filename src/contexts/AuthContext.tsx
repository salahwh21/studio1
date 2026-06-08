'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export type User = {
  id: string;
  name: string;
  email: string;
  storeName?: string;
  roleId: string;
  avatar: string;
  whatsapp?: string;
  priceListId?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start as false for faster initial render
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      // Cookie is sent automatically with credentials: 'include'
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // Token invalid or backend not available - this is expected for first visit
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Dev accounts kept as fallback only when backend is unavailable
    const devAccounts = [
      { email: 'admin@alwameed.com', password: '123', user: { id: 'user-salahwh', name: 'salahwh', email: 'admin@alwameed.com', roleId: 'admin', avatar: '', storeName: 'salahwh' }, redirect: '/dashboard' },
      { email: 'merchant@alwameed.com', password: '123', user: { id: 'user-merchant-1', name: 'محمد التاجر', email: 'merchant@alwameed.com', roleId: 'merchant', avatar: '', storeName: 'متجر الوميض' }, redirect: '/merchant' },
      { email: 'driver@alwameed.com', password: '123', user: { id: 'driver-1', name: 'ابو العبد', email: 'driver@alwameed.com', roleId: 'driver', avatar: '', storeName: 'ابو العبد' }, redirect: '/driver' },
    ];

    // Client-side lockout: prevent spamming when backend rate-limits
    if (typeof window !== 'undefined') {
      const now = Date.now();
      const lockoutUntilStr = localStorage.getItem('login_lockout_until') || '0';
      const lockoutUntil = parseInt(lockoutUntilStr, 10) || 0;
      if (now < lockoutUntil) {
        const secondsLeft = Math.max(1, Math.ceil((lockoutUntil - now) / 1000));
        throw new Error(`تم تجاوز محاولات تسجيل الدخول، يرجى المحاولة بعد ${secondsLeft} ثانية`);
      }
    }

    try {
      // 1) محاولة تسجيل الدخول الحقيقي عبر الباكند أولاً
      const response = await api.login(email, password);

      // 2) الباكند نجح — الكوكي الحقيقي (httpOnly) تم ضبطه تلقائياً
      // نجلب بيانات المستخدم الكاملة من الباكند
      let realUser = response.user;
      try {
        const meData = await api.getCurrentUser();
        realUser = meData;
      } catch {
        // إذا فشل /auth/me نستخدم بيانات response.user مباشرة
      }

      // 3) حفظ المستخدم الحقيقي
      setUser(realUser);
      console.log('✅ Real backend login:', realUser.roleId, realUser.name);

      // 4) توجيه حسب الدور الحقيقي
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');

      if (!redirect) {
        if (realUser.roleId === 'merchant') {
          router.push('/merchant');
        } else if (realUser.roleId === 'driver') {
          router.push('/driver');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push(redirect);
      }

      // Reset attempts on success
      if (typeof window !== 'undefined') {
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('login_lockout_until');
      }
    } catch (error: any) {
      const rawMsg = typeof error?.message === 'string' ? error.message : String(error);
      const isInvalidCreds = rawMsg.includes('Invalid credentials') || rawMsg.includes('401');
      const isRateLimited = rawMsg.includes('Too many login attempts') || rawMsg.includes('429');
      const isNetworkish = rawMsg === 'Failed to fetch' || rawMsg.includes('fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('ECONNREFUSED');

      // Fallback: إذا الباكند غير متاح (مشكلة شبكة)، نستخدم Mock Login
      if (isNetworkish) {
        const devAccount = devAccounts.find(a => a.email === email && a.password === password);
        if (devAccount) {
          console.log('⚠️ Backend unavailable, using mock login fallback:', devAccount.user.roleId);
          document.cookie = `auth_token=mock-token-${devAccount.user.id}; path=/; max-age=${60 * 60 * 24 * 7}`;
          setUser(devAccount.user);
          router.push(devAccount.redirect);
          return;
        }
      }

      if (isInvalidCreds) {
        console.warn('Login failed: invalid credentials');
      } else if (isRateLimited) {
        console.warn('Login rate limited by backend');
      } else if (isNetworkish) {
        console.warn('Login network/backend issue:', rawMsg);
      } else {
        console.error('Login unexpected error:', rawMsg);
      }

      // Track attempts and set short lockout window to avoid hammering the backend
      if (typeof window !== 'undefined') {
        const now = Date.now();
        const attemptsJson = localStorage.getItem('login_attempts');
        const attempts: number[] = attemptsJson ? JSON.parse(attemptsJson) : [];
        const recent = attempts.filter(ts => now - ts < 60_000);
        recent.push(now);
        localStorage.setItem('login_attempts', JSON.stringify(recent));
        if (recent.length >= 5) {
          localStorage.setItem('login_lockout_until', String(now + 60_000));
        }
      }

      // Friendly messages for common backend errors
      if (typeof rawMsg === 'string') {
        if (rawMsg.includes('Too many login attempts') || rawMsg.includes('429')) {
          if (typeof window !== 'undefined') {
            const now = Date.now();
            const untilStr = localStorage.getItem('login_lockout_until') || '0';
            const until = parseInt(untilStr, 10) || (now + 60_000);
            localStorage.setItem('login_lockout_until', String(until));
            const secondsLeft = Math.max(1, Math.ceil((until - now) / 1000));
            throw new Error(`تم تجاوز محاولات تسجيل الدخول، يرجى المحاولة بعد ${secondsLeft} ثانية`);
          }
          throw new Error('تم تجاوز محاولات تسجيل الدخول، يرجى المحاولة لاحقًا');
        }
        if (rawMsg.includes('Invalid credentials') || rawMsg.includes('401')) {
          throw new Error('بيانات الدخول غير صحيحة، يرجى التأكد والمحاولة مرة أخرى');
        }
      }

      throw new Error(rawMsg || 'فشل تسجيل الدخول');
    }
  };

  const logout = async () => {
    try {
      // Backend will clear the httpOnly cookie
      await api.logout();
    } catch (error) {
      console.warn('Backend logout failed:', error);
    } finally {
      // Always clear local state and mock cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      router.push('/');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
