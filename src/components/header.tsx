'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, Moon, Settings, Sun, User, Menu, Undo2, type LucideIcon } from 'lucide-react';
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
import { Separator } from './ui/separator';


type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

interface AppHeaderProps {
    navItems: NavItem[];
    bottomNavItems: NavItem[];
}

export function AppHeader({ navItems, bottomNavItems }: AppHeaderProps) {
  const { setTheme, theme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
     if (href.startsWith('/dashboard/orders')) {
        return pathname.startsWith('/dashboard/orders');
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
        <Logo />
        <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">فتح القائمة</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col p-2 w-72">
                     <SheetHeader className="p-4 border-b text-right">
                        <SheetTitle>
                             <Link 
                                href="/dashboard" 
                                className="group flex items-center gap-2 text-lg font-semibold"
                                onClick={() => setIsSheetOpen(false)}
                            >
                               <Logo className="h-6 w-6" />
                               <span>لوحة تحكم الوميض</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto">
                        {navItems.map(item => (
                            <Link 
                                key={item.href} 
                                href={item.href} 
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                    isActive(item.href)
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                                onClick={() => setIsSheetOpen(false)}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                     <nav className="mt-auto flex flex-col gap-2 p-2 border-t">
                        {bottomNavItems.map(item => (
                             <Link 
                                key={item.href} 
                                href={item.href} 
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                    isActive(item.href)
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                                onClick={() => setIsSheetOpen(false)}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                     </nav>
                </SheetContent>
            </Sheet>
            
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
