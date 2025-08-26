'use client';

import Link from 'next/link';
import { Bell, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
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

export function AppHeader() {
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card/70 px-4 backdrop-blur-sm md:px-6">

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
