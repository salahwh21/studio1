'use client';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { ordersStore } from '@/store/orders-store';
import { useAuth } from '@/contexts/AuthContext';
import { connectSocket, disconnectSocket, onNewOrder } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { useServiceWorker } from '@/hooks/use-service-worker';

const ADMIN_ROLES = ['admin', 'ops', 'accountant', 'branch', 'customer_service'];

// مفتاح يمنع إعادة التحميل أكثر من مرة لنفس المستخدم في نفس الجلسة
const loadedForUser = new Set<string>();

function DataLoader({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Register Service Worker for PWA
  useServiceWorker();

  useEffect(() => {
    if (!user) return;

    // لا تُعيد التحميل إذا سبق تحميل بيانات هذا المستخدم
    if (loadedForUser.has(user.id)) return;
    loadedForUser.add(user.id);

    const role = user.roleId || 'admin';
    const isAdminRole = ADMIN_ROLES.includes(role);

    const loadData = async () => {
      try {
        // Preflight: verify backend auth cookie is valid
        const { default: api } = await import('@/lib/api');
        try {
          await api.getCurrentUser();
          if (typeof window !== 'undefined') sessionStorage.setItem('backendReady', '1');
        } catch {
          if (typeof window !== 'undefined') sessionStorage.setItem('backendReady', '0');
          loadedForUser.delete(user.id); // أعد المحاولة في المرة القادمة
          return;
        }

        if (isAdminRole) {
          // ── أدمن: يحمّل المناطق + المستخدمين + الطلبات بالتوازي ──
          const [{ useAreasStore }, { usersStore }] = await Promise.all([
            import('@/store/areas-store'),
            import('@/store/user-store'),
          ]);
          await Promise.all([
            useAreasStore.getState().fetchAreas(),
            usersStore.getState().loadUsersFromAPI(),
          ]);
          await ordersStore.getState().loadOrdersFromAPI();
        } else if (role === 'merchant') {
          // ── تاجر: يحمّل طلباته فقط ──
          await ordersStore.getState().loadOrdersFromAPI();
        }
        // ── سائق: لا يحمّل شيء هنا — الطلبات تُجلب من useDriverOrders hook ──

      } catch (error: any) {
        loadedForUser.delete(user.id); // أعد المحاولة في المرة القادمة
        const isAuthError = error.message?.includes('401') || error.message?.includes('Unauthorized');
        if (!isAuthError) {
          toast({
            variant: 'destructive',
            title: 'خطأ في تحميل البيانات',
            description: 'تأكد من تشغيل Backend',
          });
        }
      }
    };

    loadData();

    // Socket.IO فقط للأدمن والتاجر (السائق يستخدم polling في useDriverOrders)
    if (isAdminRole || role === 'merchant') {
      connectSocket();

      const unsubscribeNewOrder = onNewOrder((data) => {
        ordersStore.getState().loadOrdersFromAPI();
        toast({
          title: '📦 طلب جديد',
          description: `تم إضافة طلب جديد: ${data.recipient || 'غير معروف'}`,
        });
      });

      return () => {
        unsubscribeNewOrder();
        disconnectSocket();
      };
    }
  }, [user, toast]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={0}>
            <DataLoader>
              {children}
            </DataLoader>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
