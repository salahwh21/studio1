'use client';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { ordersStore } from '@/store/orders-store';
import { useAuth } from '@/contexts/AuthContext';
import { connectSocket, disconnectSocket, onNewOrder } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';

function DataLoader({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      // Load data from API when user is authenticated
      const loadData = async () => {
        try {
          console.log('🔄 Loading data from API for user:', user.name);
          
          // Load areas (cities and regions) first
          const { useAreasStore } = await import('@/store/areas-store');
          await useAreasStore.getState().fetchAreas();
          const citiesCount = useAreasStore.getState().cities.length;
          const regionsCount = useAreasStore.getState().regions.length;
          console.log('✅ Areas loaded:', citiesCount, 'cities,', regionsCount, 'regions');
          
          // Load users (includes drivers and merchants)
          const { usersStore } = await import('@/store/user-store');
          await usersStore.getState().loadUsersFromAPI();
          const usersCount = usersStore.getState().users.length;
          console.log('✅ Users loaded:', usersCount);
          
          // Load orders
          await ordersStore.getState().loadOrdersFromAPI();
          const ordersCount = ordersStore.getState().orders.length;
          console.log('✅ Orders loaded:', ordersCount);
          
          // Show success toast with all loaded data
          if (citiesCount > 0 || usersCount > 0 || ordersCount > 0) {
            toast({
              title: 'تم تحميل البيانات من قاعدة البيانات',
              description: `${citiesCount} مدينة، ${regionsCount} منطقة، ${usersCount} مستخدم، ${ordersCount} طلب`,
            });
          }
        } catch (error: any) {
          console.error('Failed to load data:', error);
          
          // Don't show error toast for authentication issues
          const isAuthError = error.message?.includes('Access token') || 
                             error.message?.includes('401') ||
                             error.message?.includes('Unauthorized');
          
          if (!isAuthError) {
            toast({
              variant: 'destructive',
              title: 'خطأ في تحميل البيانات',
              description: 'تأكد من تشغيل Backend',
            });
          } else {
            console.log('ℹ️ Backend not available - please start backend server');
          }
        }
      };
      
      loadData();
      
      // Connect Socket.IO for real-time updates
      connectSocket();
      
      // Listen for new orders
      const unsubscribeNewOrder = onNewOrder((data) => {
        console.log('New order received:', data);
        ordersStore.getState().loadOrdersFromAPI();
        toast({
          title: '📦 طلب جديد',
          description: `تم إضافة طلب جديد: ${data.recipient || 'غير معروف'}`,
        });
      });
      
      // Cleanup on unmount
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
          <DataLoader>
            {children}
          </DataLoader>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
