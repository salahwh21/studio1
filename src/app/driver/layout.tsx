'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useOrdersStore } from '@/store/orders-store';

const driverNavItems = [
  { href: '/driver', icon: 'Home', label: 'الرئيسية', exact: true },
  { href: '/driver/orders', icon: 'Package', label: 'طلباتي', badge: true },
  { href: '/driver/scan', icon: 'ScanBarcode', label: 'مسح', isCenter: true },
  { href: '/driver/records', icon: 'ClipboardList', label: 'السجلات' },
  { href: '/driver/settings', icon: 'Settings', label: 'الإعدادات' },
];

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { orders } = useOrdersStore();
  const [isOnline, setIsOnline] = useState(true);

  // حساب عدد الطلبات النشطة
  const activeOrdersCount = orders.filter(
    o => o.driver === user?.name && 
    (o.status === 'جاري التوصيل' || o.status === 'بالانتظار')
  ).length;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute allowedRoles={['driver']}>
      <div className="min-h-screen bg-background pb-20 md:pb-0" dir="rtl">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || 'س'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold">{user?.name || 'السائق'}</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {isOnline ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Icon name="Bell" className="h-5 w-5" />
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  3
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOnline(!isOnline)}
                className={cn(
                  "gap-2",
                  isOnline ? "text-green-600" : "text-gray-400"
                )}
              >
                <Icon name={isOnline ? "Wifi" : "WifiOff"} className="h-4 w-4" />
                {isOnline ? 'متصل' : 'غير متصل'}
              </Button>
            </div>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block fixed top-0 right-0 z-50 h-full w-64 border-l bg-background">
          <div className="flex h-full flex-col">
            {/* Logo & Driver Info */}
            <div className="border-b p-4">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="Truck" className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">تطبيق السائق</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) || 'س'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user?.name || 'السائق'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    )} />
                    <span className="text-xs text-muted-foreground">
                      {isOnline ? 'متصل' : 'غير متصل'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOnline(!isOnline)}
                >
                  <Icon name={isOnline ? "Wifi" : "WifiOff"} className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {driverNavItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors relative',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon name={item.icon as any} className="h-5 w-5" />
                    {item.label}
                    {item.badge && activeOrdersCount > 0 && (
                      <Badge className="mr-auto" variant="destructive">
                        {activeOrdersCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <Icon name="LogOut" className="h-5 w-5" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:mr-64">
          <div className="container mx-auto p-4 max-w-7xl">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
          <div className="grid grid-cols-5 gap-1 p-2 relative">
            {driverNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              // زر الباركود في الوسط بتصميم مميز
              if (item.isCenter) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center -mt-6"
                  >
                    <div className={cn(
                      "h-14 w-14 rounded-full flex items-center justify-center shadow-lg border-4 border-background transition-transform active:scale-95",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    )}>
                      <Icon name={item.icon as any} className="h-7 w-7" />
                    </div>
                    <span className={cn(
                      "text-xs font-medium mt-1",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors relative',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon name={item.icon as any} className="h-5 w-5" />
                  {item.label}
                  {item.badge && activeOrdersCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs" variant="destructive">
                      {activeOrdersCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
