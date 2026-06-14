'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import Icon from '@/components/icon';
import { useRolesStore } from '@/store/roles-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
    { href: '/dashboard/drivers-map', iconName: 'Map', label: 'خريطة السائقين', permissionId: 'drivers-map:view' },
    { href: '/dashboard/returns', iconName: 'Undo2', label: 'إدارة المرتجعات', permissionId: 'returns:view' },
    { href: '/dashboard/financials', iconName: 'Calculator', label: 'المحاسبة', permissionId: 'financials:view' },
    { href: '/dashboard/settings', iconName: 'Settings', label: 'الإعدادات', permissionId: 'settings:view' },
];

function AppSidebarInner() {
    const [collapsed, setCollapsed] = useState(true);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view');
    const { setTheme, theme } = useTheme();
    const context = useSettings();
    const { user, logout } = useAuth();
    const { roles } = useRolesStore();

    const currentUserRole = user?.roleId || 'admin';
    const userRole = roles.find(r => r.id === currentUserRole);
    const userPermissions = userRole?.permissions || [];
    const visiblePermissionIds = context?.settings?.menuVisibility?.[currentUserRole] || allNavItems.map(i => i.permissionId);

    const hasPermission = (permissionId: string) => {
        if (!userPermissions) return false;
        if (userPermissions.includes('all')) return true;
        const [group] = permissionId.split(':');
        if (userPermissions.includes(`${group}:*`)) return true;
        return userPermissions.includes(permissionId);
    };

    const navItems = allNavItems.filter(i => hasPermission(i.permissionId) && visiblePermissionIds.includes(i.permissionId));

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard' && !currentView;
        const [basePath, query] = href.split('?');
        if (pathname === basePath) {
            if (query) {
                const targetView = new URLSearchParams(query).get('view');
                return currentView === targetView;
            }
            return !currentView;
        }
        return false;
    };

    const headerLogo = context?.settings?.login?.headerLogo;

    const iconBtn = (icon: string, label: string, onClick?: () => void) => (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={onClick}
                    className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0"
                >
                    <Icon name={icon as any} className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="left"><p>{label}</p></TooltipContent>}
        </Tooltip>
    );

    return (
        <aside className={cn(
                'flex flex-col h-screen sticky top-0 bg-sidebar border-l border-border transition-all duration-200 shrink-0',
                collapsed ? 'w-14' : 'w-52'
            )}>

                {/* الرأس: لوجو + زر الطي */}
                <div className={cn(
                    "flex items-center h-14 px-2 border-b border-border shrink-0",
                    collapsed ? "justify-center" : "justify-between"
                )}>
                    {!collapsed && (
                        <Link href="/dashboard" className="flex items-center overflow-hidden px-1">
                            {headerLogo
                                ? <img src={headerLogo} alt="logo" className="max-h-8 max-w-[110px] object-contain" />
                                : <Logo />
                            }
                        </Link>
                    )}
                    <button
                        onClick={() => setCollapsed(p => !p)}
                        className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors shrink-0"
                    >
                        <Icon name={collapsed ? 'PanelRightOpen' : 'PanelRightClose'} className="h-4 w-4" />
                    </button>
                </div>

                {/* روابط التنقل */}
                <nav className="flex-1 flex flex-col gap-0.5 py-2 px-1.5 overflow-y-auto overflow-x-hidden">
                    {navItems.map(item => {
                        const active = isActive(item.href);
                        const linkEl = (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                                    'hover:bg-muted',
                                    active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground',
                                    collapsed && 'justify-center px-0'
                                )}
                            >
                                <Icon name={item.iconName as any} className="h-4 w-4 shrink-0" />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                                    <TooltipContent side="left"><p>{item.label}</p></TooltipContent>
                                </Tooltip>
                            );
                        }
                        return linkEl;
                    })}
                </nav>

                {/* الأسفل: ثيم + إشعارات + مستخدم */}
                <div className={cn(
                    "border-t border-border px-1.5 py-2 flex flex-col gap-1 shrink-0",
                    collapsed ? "items-center" : ""
                )}>
                    {/* الإشعارات */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "rounded-md text-muted-foreground hover:bg-muted transition-colors",
                                collapsed
                                    ? "h-8 w-8 flex items-center justify-center"
                                    : "flex items-center gap-2.5 px-2 py-2 text-sm font-medium w-full"
                            )}>
                                <Icon name="Bell" className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>الإشعارات</span>}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="left">
                            <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <div className="p-4 text-sm text-center text-muted-foreground">لا توجد إشعارات جديدة</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* تبديل الثيم */}
                    {collapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    <Icon name="Sun" className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
                                    <Icon name="Moon" className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="left"><p>تبديل المظهر</p></TooltipContent>
                        </Tooltip>
                    ) : (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors w-full"
                        >
                            <Icon name="Sun" className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all shrink-0" />
                            <Icon name="Moon" className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
                            <span>المظهر</span>
                        </button>
                    )}

                    {/* المستخدم */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "rounded-md hover:bg-muted transition-colors",
                                collapsed
                                    ? "h-8 w-8 flex items-center justify-center"
                                    : "flex items-center gap-2.5 px-2 py-2 text-sm font-medium text-muted-foreground w-full"
                            )}>
                                <Avatar className="h-6 w-6 shrink-0">
                                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                {!collapsed && <span className="truncate">{user?.name || 'حسابي'}</span>}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top">
                            <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings/account">
                                        <Icon name="User" className="mr-2 h-4 w-4" /><span>الملف الشخصي</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings">
                                        <Icon name="Settings" className="mr-2 h-4 w-4" /><span>الإعدادات</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                                <Icon name="LogOut" className="mr-2 h-4 w-4" /><span>تسجيل الخروج</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>
    );
}

export function AppSidebar() {
    return (
        <Suspense fallback={<div className="w-52 shrink-0 bg-sidebar border-l border-border" />}>
            <AppSidebarInner />
        </Suspense>
    );
}
