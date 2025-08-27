'use client';

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
];

const bottomNavItems: NavItem[] = [
    { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-muted/40">
      <AppHeader navItems={navItems} bottomNavItems={bottomNavItems} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
