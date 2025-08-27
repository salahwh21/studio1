
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ShoppingCart,
  PackagePlus,
  Archive,
  Undo2,
  Calculator,
  Settings,
  Home,
  Package,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { AppHeader } from '@/components/header';
import { Logo } from '@/components/logo';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { href: '/dashboard/orders', icon: ShoppingCart, label: 'عرض الطلبات' },
  { href: '/dashboard/parse-order', icon: PackagePlus, label: 'إضافة طلبات' },
  { href: '/dashboard/returns', icon: Undo2, label: 'إدارة المرتجعات' },
  { href: '/dashboard/financials', icon: Calculator, label: 'المحاسبة' },
];

const bottomNavItems: NavItem[] = [
    { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex h-screen bg-muted/40 overflow-hidden">
      <aside className="fixed inset-y-0 right-0 z-10 hidden w-16 flex-col border-l bg-card sm:flex">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
                href="/dashboard"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
                <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">الوميض</span>
            </Link>
            {navItems.map((item) => (
                <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                    <Link
                    href={item.href}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                        isActive(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="left">{item.label}</TooltipContent>
                </Tooltip>
            ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
             {bottomNavItems.map((item) => (
                <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                        isActive(item.href)
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="left">{item.label}</TooltipContent>
                </Tooltip>
             ))}
            </nav>
        </TooltipProvider>
      </aside>
      <div className="flex flex-col flex-1 overflow-y-auto sm:pr-16">
        <AppHeader navItems={navItems} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
