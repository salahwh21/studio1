
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ShoppingCart,
  PackagePlus,
  Archive,
  ArchiveRestore,
  Calculator,
  Settings,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
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
    { href: '/dashboard/orders/archive', icon: Archive, label: 'الطلبات المؤرشفة' },
    { href: '/dashboard/returns', icon: ArchiveRestore, label: 'إدارة المرتجعات' },
    { href: '/dashboard/financials', icon: Calculator, label: 'المحاسبة' },
    { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
];


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    if (href === '/dashboard/orders/archive') {
        return pathname === href;
    }
    if (href.startsWith('/dashboard/orders')) {
        return pathname.startsWith('/dashboard/orders') && !pathname.includes('archive');
    }
    return pathname.startsWith(href);
  };
  
  return (
      <div className="flex h-screen bg-muted/40 overflow-hidden">
        <Sidebar side="right" className="z-40 hidden md:flex flex-col">
           <SidebarHeader>
             <div className="flex h-16 items-center justify-center p-2">
               <Link href="/dashboard" className="flex items-center gap-2">
                 <Logo className="h-10 w-10" />
               </Link>
             </div>
           </SidebarHeader>
           <SidebarContent>
             <SidebarMenu>
               {navItems.map((item) => (
                 <SidebarMenuItem key={item.href}>
                   <SidebarMenuButton
                     asChild
                     isActive={isActive(item.href)}
                     className="justify-start"
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
        <div className="flex flex-col flex-1 overflow-y-auto">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
  );
}
