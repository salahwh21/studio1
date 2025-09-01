
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useContext } from 'react';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from './logo';
import { useSettings } from '@/contexts/SettingsContext';
import Icon from '@/components/icon';
import { useRolesStore } from '@/store/roles-store';

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
  { href: '/dashboard/returns', iconName: 'Undo2', label: 'إدارة المرتجعات', permissionId: 'returns:view' },
  { href: '/dashboard/financials', iconName: 'Calculator', label: 'المحاسبة', permissionId: 'financials:view' },
  { href: '/dashboard/settings', iconName: 'Settings', label: 'الإعدادات', permissionId: 'settings:view' },
];


export function AppHeader() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const context = useSettings();
  const headerLogo = context?.settings.login.headerLogo;

  // --- RBAC Logic ---
  const { roles } = useRolesStore();
  // Simulate a logged-in user. In a real app, this would come from an auth context.
  const currentUserRole = 'supervisor'; 
  const userRole = roles.find(r => r.id === currentUserRole);
  const userPermissions = userRole?.permissions || [];

  const hasPermission = (permissionId: string) => {
      if (!userPermissions) return false;
      if (userPermissions.includes('all')) return true;
      // Check for specific permission or wildcard group permission (e.g., 'orders:*')
      const [group] = permissionId.split(':');
      if (userPermissions.includes(`${group}:*`)) return true;
      return userPermissions.includes(permissionId);
  };

  const navItems = allNavItems.filter(item => hasPermission(item.permissionId));
  // --- End RBAC Logic ---

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };
  
  const HeaderLogo = () => {
    if (headerLogo) {
      return <Image src={headerLogo} alt="Company Logo" width={120} height={32} style={{objectFit: 'contain'}} />
    }
    return <Logo />;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
        
        <div className="flex items-center gap-4">
          <HeaderLogo />
        </div>

        <nav className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-2 rounded-full border bg-muted/50 p-1">
            {navItems.map(item => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant={isActive(item.href) ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-full"
                  >
                    <Link href={item.href}>
                      <Icon name={item.iconName as any} className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </nav>
        
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Icon name="Bell" className="h-5 w-5" />
                        <span className="sr-only">فتح الإشعارات</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <div className="p-4 text-sm text-center text-muted-foreground">
                            لا توجد إشعارات جديدة
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Icon name="Sun" className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Icon name="Moon" className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">تبديل المظهر</span>
            </Button>
            
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" data-ai-hint="manager profile" />
                    <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings/general">
                            <Icon name="User" className="mr-2 h-4 w-4"/>
                            <span>الملف الشخصي</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings">
                           <Icon name="Settings" className="mr-2 h-4 w-4" />
                           <span>الإعدادات</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/">
                        <Icon name="LogOut" className="mr-2 h-4 w-4" />
                        <span>تسجيل الخروج</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}
