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
import { Separator } from './ui/separator';

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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader navItems={navItems} bottomNavItems={bottomNavItems} />
      <main className="flex flex-1 flex-col gap-4 bg-background sm:gap-8">
        {children}
      </main>
    </div>
  );
}
