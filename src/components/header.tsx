'use client';

import Link from 'next/link';
import { Bell, LogOut, Moon, Settings, Sun, User, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from './logo';

const navItems = [
    { href: '/dashboard', label: 'لوحة التحكم' },
    { href: '/dashboard/orders', label: 'عرض الطلبات' },
    { href: '/dashboard/parse-order', label: 'إضافة طلبات' },
    { href: '/dashboard/orders/archive', label: 'الطلبات المؤرشفة' },
    { href: '/dashboard/returns', label: 'إدارة المرتجعات' },
    { href: '/dashboard/financials', label: 'المحاسبة' },
    { href: '/dashboard/settings', label: 'الإعدادات' },
];

export function AppHeader() {
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">فتح القائمة</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>
                        <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Logo />
                        </Link>
                      </SheetTitle>
                      <SheetDescription>
                        قائمة التنقل الرئيسية للتطبيق.
                      </SheetDescription>
                    </SheetHeader>
                    <nav className="grid gap-6 text-lg font-medium mt-4">
                        {navItems.map(item => (
                            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>

        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial" />
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bell className="h-5 w-5" />
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
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
                        <Link href="/dashboard/settings">
                            <User className="mr-2 h-4 w-4"/>
                            <span>الملف الشخصي</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings">
                           <Settings className="mr-2 h-4 w-4" />
                           <span>الإعدادات</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>تسجيل الخروج</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
  );
}
