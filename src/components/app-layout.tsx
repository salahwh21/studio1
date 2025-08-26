
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Sparkles,
  RotateCw,
  Wallet,
  Settings,
  Truck,
  BotMessageSquare,
  Store,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/header';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/orders', label: 'إدارة الطلبات', icon: ShoppingCart },
  { href: '/parse-order', label: 'إدخال الطلبات بالذكاء الاصطناعي', icon: Sparkles },
  { href: '/returns', label: 'متابعة المرتجعات', icon: RotateCw },
  { href: '/financials', label: 'الإدارة المالية', icon: Wallet },
  { href: '/settings', label: 'مركز التحكم', icon: Settings },
];

const secondaryNavItems: NavItem[] = [
    { href: '/driver-app', label: 'تطبيق السائق', icon: Truck },
    { href: '/merchant', label: 'واجهة التاجر', icon: Store },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar side="right">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BotMessageSquare className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">الوميض</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className={cn(
                    'justify-start',
                    pathname === item.href &&
                      'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                  tooltip={{
                    children: item.label,
                    className: 'bg-primary/90 text-primary-foreground',
                  }}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
           <SidebarMenu className="mt-auto">
            {secondaryNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                   className={cn(
                    'justify-start text-muted-foreground',
                    pathname === item.href &&
                      'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                  tooltip={{
                    children: item.label,
                     className: 'bg-primary/90 text-primary-foreground',
                  }}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
