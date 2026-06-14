'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import Icon from '@/components/icon';
import { useRolesStore } from '@/store/roles-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

export function CollapsibleSidebar() {
    const [expanded, setExpanded] = useState(false);
    const pathname = usePathname();
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
        if (href === '/dashboard') return pathname === href;
        return pathname.startsWith(href);
    };

    const headerLogo = context?.settings?.login?.headerLogo;

    return (
        <TooltipProvider delayDuration={0}>
            {/* زر عائم صغير لفتح القائمة */}
            {!expanded && (
                <button
                    onClick={() => setExpanded(true)}
                    className="fixed top-3 right-3 z-50 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                    <Icon name="Menu" className="h-4 w-4" />
                </button>
            )}

            {/* overlay شفاف لإغلاق القائمة */}
            {expanded && (
                <div
                    className="fixed inset-0 z-40 bg-black/30"
                    onClick={() => setExpanded(false)}
                />
            )}

            <aside
                className={cn(
                    'fixed right-0 top-0 z-50 h-screen flex flex-col bg-sidebar border-l border-border shadow-xl transition-all duration-200 ease-in-out',
                    expanded ? 'w-56 translate-x-0' : 'w-56 translate-x-full'
                )}
            >
                {/* اللوجو وزر الإغلاق */}
                <div className="flex items-center justify-between h-14 px-3 border-b border-border shrink-0">
                    <Link href="/dashboard" className="flex items-center overflow-hidden">
                        {headerLogo
                            ? <img src={headerLogo} alt="logo" className="max-h-8 max-w-[120px] object-contain" />
                            : <Logo />
                        }
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setExpanded(false)}
                    >
                        <Icon name="X" className="h-4 w-4" />
                    </Button>
                </div>

                {/* روابط التنقل */}
                <nav className="flex-1 flex flex-col gap-1 py-3 px-2 overflow-y-auto overflow-x-hidden">
                    {navItems.map(item => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setExpanded(false)}
                                className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                                    'hover:bg-muted',
                                    active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground'
                                )}
                            >
                                <Icon name={item.iconName as any} className="h-5 w-5 shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* أسفل الشريط */}
                <div className="border-t border-border px-2 py-3 flex flex-col gap-1 shrink-0">
                    {/* تبديل الثيم */}
                    <Button
                        variant="ghost"
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 h-auto justify-start text-muted-foreground hover:bg-muted w-full"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Icon name="Sun" className="h-5 w-5 shrink-0 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
                        <Icon name="Moon" className="absolute h-5 w-5 shrink-0 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
                        <span className="text-sm font-medium">المظهر</span>
                    </Button>

                    {/* المستخدم */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted text-muted-foreground w-full">
                                <Avatar className="h-7 w-7 shrink-0">
                                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                <span className="truncate text-sm">{user?.name || 'حسابي'}</span>
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
        </TooltipProvider>
    );
}
