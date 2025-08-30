'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  PackagePlus,
  Undo2,
  Calculator,
  Settings,
  Wand2,
  Map,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppHeader } from '@/components/header';
import { cn } from '@/lib/utils';


type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { href: '/dashboard/orders', icon: ShoppingCart, label: 'عرض الطلبات' },
  { href: '/dashboard/parse-order', icon: PackagePlus, label: 'إضافة طلبات' },
  { href: '/dashboard/optimize', icon: Wand2, label: 'تحسين المسار' },
  { href: '/dashboard/drivers-map', icon: Map, label: 'خريطة السائقين' },
  { href: '/dashboard/returns', icon: Undo2, label: 'إدارة المرتجعات' },
  { href: '/dashboard/financials', icon: Calculator, label: 'المحاسبة' },
  { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
];

const mobileNavItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
  { href: '/dashboard/parse-order', icon: PackagePlus, label: 'إضافة' },
  { href: '/dashboard/orders', icon: ShoppingCart, label: 'الطلبات' },
  { href: '/dashboard/drivers-map', icon: Map, label: 'الخريطة' },
  { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
]


export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === href;
        return pathname.startsWith(href);
    };


  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppHeader navItems={navItems} bottomNavItems={[]} />
        <main className="flex flex-1 flex-col gap-4 bg-background sm:gap-8 p-4 sm:p-6 md:p-8">
            {children}
        </main>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
          <div className="grid h-16 grid-cols-5 items-center justify-items-center gap-1">
              {mobileNavItems.map((item) => (
                  <Link 
                      key={item.href} 
                      href={item.href} 
                      className={cn(
                          "flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full transition-colors",
                          isActive(item.href) ? 'text-primary' : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                  </Link>
              ))}
          </div>
      </footer>
    </>
  );
}
