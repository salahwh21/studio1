
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, Moon, Settings, Sun, User, type LucideIcon, Menu } from 'lucide-react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from './logo';
import { Separator } from './ui/separator';
import { LoginExperienceContext } from '@/context/LoginExperienceContext';

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
  const pathname = usePathname();
  const context = useContext(LoginExperienceContext);
  const headerLogo = context?.settings.headerLogo;

  const isActive = (href: string) => {
    // Exact match for the main dashboard page
    if (href === '/dashboard') {
      return pathname === href;
    }
    // Match for parent routes like /settings or /orders
     if (href.startsWith('/dashboard/settings') && pathname.startsWith('/dashboard/settings')) {
        return true;
    }
    if (href.startsWith('/dashboard/orders') && pathname.startsWith('/dashboard/orders')) {
        return true;
    }
    return pathname.startsWith(href) && href !== '/dashboard';
  };
  
  const allNavItems = [...navItems, ...bottomNavItems];

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
                      <item.icon className="h-5 w-5" />
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
            {/* Mobile Navigation */}
             <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">فتح القائمة</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="flex flex-col p-2 w-72">
                         <SheetHeader className='p-4'>
                            <SheetTitle className='sr-only'>Main Menu</SheetTitle>
                            <HeaderLogo />
                        </SheetHeader>
                        <Separator />
                        <nav className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto">
                            {allNavItems.map(item => (
                                <Link 
                                    key={item.href} 
                                    href={item.href} 
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                        isActive(item.href)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>

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
                        <Link href="/dashboard/settings/general">
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
    </TooltipProvider>
  );
}
