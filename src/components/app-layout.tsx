'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState, useContext, Suspense } from 'react';
import { AppHeader } from '@/components/header';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import Icon from '@/components/icon';
import { useRolesStore } from '@/store/roles-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';

type NavItem = {
    href: string;
    label: string;
    iconName: keyof typeof import('lucide-react');
    permissionId: string;
};

const allNavItems: NavItem[] = [
    { href: '/dashboard', iconName: 'LayoutDashboard', label: 'لوحة التحكم', permissionId: 'dashboard:view' },
    { href: '/dashboard/orders?view=active', iconName: 'ShoppingCart', label: 'الطلبات النشطة', permissionId: 'orders:view' },
    { href: '/dashboard/orders?view=driver-returns', iconName: 'Truck', label: 'طلبات السائق', permissionId: 'returns:view' },
    { href: '/dashboard/orders?view=branch-returns', iconName: 'Undo2', label: 'الراجع للفرع', permissionId: 'returns:view' },
    { href: '/dashboard/orders?view=merchant-returns', iconName: 'PackageX', label: 'مرتجعات التاجر', permissionId: 'returns:view' },
    { href: '/dashboard/orders?view=all', iconName: 'Archive', label: 'جميع الطلبات', permissionId: 'orders:view' },
    { href: '/dashboard/add-order', iconName: 'PackagePlus', label: 'إضافة طلبات', permissionId: 'orders:create' },
    { href: '/dashboard/drivers-map', iconName: 'Map', label: 'خريطة السائقين', permissionId: 'drivers-map:view' },
    { href: '/dashboard/financials', iconName: 'Calculator', label: 'المحاسبة', permissionId: 'financials:view' },
    { href: '/dashboard/settings', iconName: 'Settings', label: 'الإعدادات', permissionId: 'settings:view' },
];

const mobileMainItems: NavItem[] = [
    { href: '/dashboard', iconName: 'LayoutDashboard', label: 'الرئيسية', permissionId: 'dashboard:view' },
    { href: '/dashboard/add-order', iconName: 'PackagePlus', label: 'إضافة', permissionId: 'orders:create' },
    { href: '/dashboard/orders?view=active', iconName: 'ShoppingCart', label: 'الطلبات', permissionId: 'orders:view' },
    { href: '/dashboard/drivers-map', iconName: 'Map', label: 'الخريطة', permissionId: 'drivers-map:view' },
];


export function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view');
    const isOrdersPage = pathname === '/dashboard/orders';
    const [isMounted, setIsMounted] = useState(false);
    const settingsContext = useSettings();

    // --- RBAC Logic ---
    const { roles } = useRolesStore();
    // Get actual user role from AuthContext
    const { user } = useAuth();
    const currentUserRole = user?.roleId || 'admin'; // Fallback to admin if not logged in
    const userRole = roles.find(r => r.id === currentUserRole);
    const userPermissions = userRole?.permissions || [];
    const visiblePermissionIds = (settingsContext?.settings?.menuVisibility?.[currentUserRole]) || allNavItems.map(item => item.permissionId);

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
        if (isMounted && settingsContext?.isHydrated) {
            const { density, borderRadius, iconStrokeWidth, iconLibrary } = settingsContext.settings.ui;
            document.body.dataset.density = density;
            document.documentElement.style.setProperty('--radius', `${borderRadius}rem`);
            // The Icon component will read these directly from localStorage, no need to set dataset here.
        }
    }, [settingsContext?.isHydrated, settingsContext?.settings.ui]);

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === href && !currentView;
        
        const [basePath, query] = href.split('?');
        if (pathname === basePath) {
            if (query && query.includes('view=')) {
                const targetView = new URLSearchParams(query).get('view');
                return currentView === targetView;
            }
            if (!query && !currentView) {
                return true;
            }
        }
        
        return pathname.startsWith(basePath) && pathname !== '/dashboard/orders';
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
                <main className={cn(
                    "flex flex-1 flex-col bg-background",
                    isOrdersPage ? "p-0" : "gap-4 p-4 sm:p-4 md:px-6 md:py-4 pb-20 md:pb-8"
                )}>
                    {children}
                </main>
            </div>

            {/* Bottom Navigation for Mobile */}
            {!isOrdersPage && (
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
            )}
        </>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="flex min-h-screen w-full flex-col bg-muted/40"></div>}>
            <AppLayoutContent>{children}</AppLayoutContent>
        </Suspense>
    );
}