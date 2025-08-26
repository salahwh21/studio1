'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ShoppingCart,
  Sparkles,
  RotateCw,
  Wallet,
  Settings,
  Truck,
  Store,
  BotMessageSquare,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/header';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'إدارة الطلبات', icon: ShoppingCart },
  { href: '/dashboard/parse-order', label: 'إدخال سريع بالذكاء الاصطناعي', icon: Sparkles },
  { href: '/dashboard/returns', label: 'متابعة المرتجعات', icon: RotateCw },
  { href: '/dashboard/financials', label: 'الإدارة المالية', icon: Wallet },
];

const secondaryNavItems: NavItem[] = [
  { href: '/dashboard/driver-app', label: 'تطبيق السائق', icon: Truck },
  { href: '/dashboard/merchant', label: 'واجهة التاجر', icon: Store },
];

const settingsNavItem: NavItem = { href: '/dashboard/settings', label: 'مركز التحكم', icon: Settings };

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/dashboard') return pathname === href;
    // Starts with for other main nav items
    return pathname.startsWith(href);
  };
  
  return (
    <SidebarProvider>
      <Sidebar side="right" collapsible="icon">
        <SidebarHeader className="p-0">
           <div className="flex h-16 items-center justify-center p-2 group-data-[collapsible=icon]:h-12">
            <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
              <BotMessageSquare className="w-8 h-8 text-primary group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6 transition-all" />
              <span className="text-lg font-semibold text-foreground whitespace-nowrap group-data-[collapsible=icon]:hidden">
                الوميض
              </span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  className="justify-start"
                  tooltip={{
                    children: item.label,
                    side: 'left',
                    align: 'center',
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
                  isActive={isActive(item.href)}
                  className="justify-start text-muted-foreground"
                  tooltip={{
                    children: item.label,
                    side: 'left',
                    align: 'center',
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
             <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(settingsNavItem.href)}
                  className="justify-start"
                  tooltip={{
                    children: settingsNavItem.label,
                    side: 'left',
                    align: 'center',
                    className: 'bg-primary/90 text-primary-foreground',
                  }}
                >
                  <Link href={settingsNavItem.href}>
                    <settingsNavItem.icon className="h-5 w-5" />
                    <span>{settingsNavItem.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-background/95">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
