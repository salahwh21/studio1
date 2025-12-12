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
  const [isLoading, setIsLoading] = useState(true);
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
      // Token invalid or backend not available
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);

      // Token is set as httpOnly cookie by backend
      setUser(response.user);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');

      // توجيه المستخدم حسب دوره إذا لم يكن هناك redirect محدد
      if (!redirect) {
        if (response.user.roleId === 'merchant') {
          router.push('/merchant');
        } else if (response.user.roleId === 'driver') {
          router.push('/dashboard/driver-app');
        } else if (response.user.roleId === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push(redirect);
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // ⚠️ DEVELOPMENT ONLY: Mock login fallback
      // This will be DISABLED in production (NODE_ENV === 'production')
      const isDevelopment = process.env.NODE_ENV === 'development';

      const isBackendError = error.message === 'Failed to fetch' ||
        error.message.includes('fetch') ||
        error.message.includes('Invalid credentials') ||
        error.message.includes('HTTP');

      if (isDevelopment && isBackendError) {
        console.warn('⚠️ [DEV MODE] Backend not available - using mock authentication');

        // Mock admin login
        if (email === 'admin@alwameed.com' && password === '123') {
          setUser({
            id: 'user-salahwh',
            name: 'salahwh',
            email: 'admin@alwameed.com',
            roleId: 'admin',
            avatar: '',
            storeName: 'salahwh'
          });
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect') || '/dashboard';
          router.push(redirect);
          return;
        }

        // Mock merchant login
        if (email === 'merchant@alwameed.com' && password === '123') {
          setUser({
            id: 'user-merchant-1',
            name: 'محمد التاجر',
            email: 'merchant@alwameed.com',
            roleId: 'merchant',
            avatar: '',
            storeName: 'متجر الوميض'
          });
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect') || '/merchant';
          router.push(redirect);
          return;
        }

        // Mock driver login
        if (email === 'driver@alwameed.com' && password === '123') {
          setUser({
            id: 'driver-1',
            name: 'ابو العبد',
            email: 'driver@alwameed.com',
            roleId: 'driver',
            avatar: '',
            storeName: 'ابو العبد'
          });
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect') || '/driver';
          router.push(redirect);
          return;
        }
      }

      throw new Error(error.message || 'فشل تسجيل الدخول');
    }
  };

  const logout = async () => {
    try {
      // Backend will clear the httpOnly cookie
      await api.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
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
