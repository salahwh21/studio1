
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState, useContext } from 'react';
import { AppHeader } from '@/components/header';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import Icon from '@/components/icon';
import { useRolesStore } from '@/store/roles-store';
import { useSettings } from '@/contexts/SettingsContext';

type NavItem = {
  href: string;
  label: string;
  iconName: keyof typeof import('lucide-react');
  permissionId: string;
};

const allNavItems: NavItem[] = [
  { href: '/dashboard', iconName: 'LayoutDashboard', label: 'لوحة التحكم', permissionId: 'dashboard:view' },
  { href: '/dashboard/orders', iconName: 'ShoppingCart', label: 'عرض الطلبات', permissionId: 'orders:view' },
  { href: '/dashboard/add-order', iconName: 'PackagePlus', label: 'إضافة طلبات', permissionId: 'orders:create' },
  { href: '/dashboard/optimize', iconName: 'Wand2', label: 'تحسين المسار', permissionId: 'optimize:use' },
  { href: '/dashboard/drivers-map', iconName: 'Map', label: 'خريطة السائقين', permissionId: 'drivers-map:view' },
  { href: '/dashboard/financials', iconName: 'Calculator', label: 'المحاسبة', permissionId: 'financials:view' },
  { href: '/dashboard/settings', iconName: 'Settings', label: 'الإعدادات', permissionId: 'settings:view' },
];

const mobileMainItems: NavItem[] = [
  { href: '/dashboard', iconName: 'LayoutDashboard', label: 'الرئيسية', permissionId: 'dashboard:view' },
  { href: '/dashboard/add-order', iconName: 'PackagePlus', label: 'إضافة', permissionId: 'orders:create' },
  { href: '/dashboard/orders', iconName: 'ShoppingCart', label: 'الطلبات', permissionId: 'orders:view' },
  { href: '/dashboard/drivers-map', iconName: 'Map', label: 'الخريطة', permissionId: 'drivers-map:view' },
];


export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const settingsContext = useSettings();
    const [isMounted, setIsMounted] = useState(false);
    
    // --- RBAC Logic ---
    const { roles } = useRolesStore();
    // Simulate a logged-in user. In a real app, this would come from an auth context.
    const currentUserRole = 'admin'; 
    const userRole = roles.find(r => r.id === currentUserRole);
    const userPermissions = userRole?.permissions || [];
    const visiblePermissionIds = settingsContext?.settings.menuVisibility[currentUserRole] || allNavItems.map(item => item.permissionId);

    const hasPermission = (permissionId: string) => {
        if (!userPermissions) return false;
        if (userPermissions.includes('all')) return true;
        // Check for specific permission or wildcard group permission (e.g., 'orders:*')
        const [group] = permissionId.split(':');
        if (userPermissions.includes(`${group}:*`)) return true;
        return userPermissions.includes(permissionId);
    };

    const navItems = allNavItems.filter(item => hasPermission(item.permissionId) && visiblePermissionIds.includes(item.permissionId));
    const mobileMoreItems = navItems.filter(
        item => !mobileMainItems.some(main => main.permissionId === item.permissionId)
    );
    // --- End RBAC Logic ---

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Apply UI settings from context to the body
    useEffect(() => {
        if (settingsContext?.isHydrated) {
            const { density, borderRadius, iconStrokeWidth, iconLibrary } = settingsContext.settings.ui;
            document.body.dataset.density = density;
            document.documentElement.style.setProperty('--radius', `${borderRadius}rem`);
            // The Icon component will read these directly from localStorage, no need to set dataset here.
        }
    }, [settingsContext?.isHydrated, settingsContext?.settings.ui]);

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === href;
        return pathname.startsWith(href);
    };

    if (!isMounted || !settingsContext?.isHydrated) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                {/* You can put a more sophisticated loader here */}
            </div>
        );
    }


  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40" data-density={settingsContext.settings.ui.density}>
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 bg-background p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
            {children}
        </main>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
          <div className="grid h-16 grid-cols-5 items-center justify-items-center gap-1">
              {mobileMainItems.filter(item => hasPermission(item.permissionId) && visiblePermissionIds.includes(item.permissionId)).map((item) => (
                  <Link 
                      key={item.href} 
                      href={item.href} 
                      className={cn(
                          "flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full transition-colors",
                          isActive(item.href) ? 'text-primary' : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      <Icon name={item.iconName as any} className="h-5 w-5" />
                      <span>{item.label}</span>
                  </Link>
              ))}
               <Sheet>
                    <SheetTrigger asChild>
                         <button className="flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full text-muted-foreground hover:bg-muted/50">
                            <Icon name="MoreHorizontal" className="h-5 w-5" />
                            <span>المزيد</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto rounded-t-lg p-4">
                        <SheetHeader>
                            <SheetTitle>قائمة إضافية</SheetTitle>
                        </SheetHeader>
                       <div className="grid grid-cols-2 gap-4 mt-4">
                            {mobileMoreItems.map((item) => (
                                 <Link 
                                    key={item.href} 
                                    href={item.href} 
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg p-3 transition-colors",
                                        isActive(item.href) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    )}
                                    >
                                    <Icon name={item.iconName as any} className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}
                       </div>
                    </SheetContent>
                </Sheet>
          </div>
      </footer>
    </>
  );
}
