
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
  MoreHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppHeader } from '@/components/header';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import Icon from '@/components/icon';


type NavItem = {
  href: string;
  label: string;
  iconName: keyof typeof import('lucide-react');
};

const navItems: NavItem[] = [
  { href: '/dashboard', iconName: 'LayoutDashboard', label: 'لوحة التحكم' },
  { href: '/dashboard/orders', iconName: 'ShoppingCart', label: 'عرض الطلبات' },
  { href: '/dashboard/parse-order', iconName: 'PackagePlus', label: 'إضافة طلبات' },
  { href: '/dashboard/optimize', iconName: 'Wand2', label: 'تحسين المسار' },
  { href: '/dashboard/drivers-map', iconName: 'Map', label: 'خريطة السائقين' },
  { href: '/dashboard/returns', iconName: 'Undo2', label: 'إدارة المرتجعات' },
  { href: '/dashboard/financials', iconName: 'Calculator', label: 'المحاسبة' },
  { href: '/dashboard/settings', iconName: 'Settings', label: 'الإعدادات' },
];

const mobileMainItems: NavItem[] = [
  { href: '/dashboard', iconName: 'LayoutDashboard', label: 'الرئيسية' },
  { href: '/dashboard/parse-order', iconName: 'PackagePlus', label: 'إضافة' },
  { href: '/dashboard/orders', iconName: 'ShoppingCart', label: 'الطلبات' },
  { href: '/dashboard/drivers-map', iconName: 'Map', label: 'الخريطة' },
];

const mobileMoreItems: NavItem[] = [
    { href: '/dashboard/optimize', iconName: 'Wand2', label: 'تحسين المسار' },
    { href: '/dashboard/returns', iconName: 'Undo2', label: 'إدارة المرتجعات' },
    { href: '/dashboard/financials', iconName: 'Calculator', label: 'المحاسبة' },
    { href: '/dashboard/settings', iconName: 'Settings', label: 'الإعدادات' },
];


export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        const applySettings = () => {
            const density = localStorage.getItem('ui-density') || 'comfortable';
            const radius = localStorage.getItem('ui-border-radius') || '0.5';
            const stroke = localStorage.getItem('ui-icon-stroke') || '2';
            const library = localStorage.getItem('ui-icon-library') || 'lucide';
            
            document.body.dataset.density = density;
            document.documentElement.style.setProperty('--radius', `${radius}rem`);
            document.body.dataset.iconStroke = stroke;
            document.body.dataset.iconLibrary = library;
        }
        applySettings();
        
        window.addEventListener('storage', applySettings);

        return () => {
            window.removeEventListener('storage', applySettings);
        }

    }, []);

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === href;
        return pathname.startsWith(href);
    };

    if (!isMounted) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                {/* Basic skeleton or loader */}
            </div>
        );
    }


  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 bg-background p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
            {children}
        </main>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
          <div className="grid h-16 grid-cols-5 items-center justify-items-center gap-1">
              {mobileMainItems.map((item) => (
                  <Link 
                      key={item.href} 
                      href={item.href} 
                      className={cn(
                          "flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full transition-colors",
                          isActive(item.href) ? 'text-primary' : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      <Icon name={item.iconName} className="h-5 w-5" />
                      <span>{item.label}</span>
                  </Link>
              ))}
               <Sheet>
                    <SheetTrigger asChild>
                         <button className="flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full text-muted-foreground hover:bg-muted/50">
                            <Icon name="MoreHorizontal" className="h-5 w-5" />
                            <span>المزيد</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto rounded-t-lg p-4">
                       <div className="grid grid-cols-2 gap-4">
                            {mobileMoreItems.map((item) => (
                                 <Link 
                                    key={item.href} 
                                    href={item.href} 
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg p-3 transition-colors",
                                        isActive(item.href) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    )}
                                    >
                                    <Icon name={item.iconName} className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}
                       </div>
                    </SheetContent>
                </Sheet>
          </div>
      </footer>
    </>
  );
}
