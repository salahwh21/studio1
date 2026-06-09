'use client';

import Link from 'next/link';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';

interface SettingsHeaderProps {
  icon: string;
  title: string;
  description: string;
  backHref?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'indigo' | 'default';
}

const colorVariants = {
  blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  amber: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
  default: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
};

export function SettingsHeader({
  icon,
  title,
  description,
  backHref = '/dashboard/settings',
  actions,
  breadcrumbs = [],
  color = 'default'
}: SettingsHeaderProps) {
  const allBreadcrumbs = [
    { label: 'لوحة التحكم', href: '/dashboard' },
    { label: 'الإعدادات', href: '/dashboard/settings' },
    ...breadcrumbs,
    { label: title }
  ];

  const gradientClass = colorVariants[color];

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        {allBreadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronLeft className="h-4 w-4" />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Header Card */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${colorVariants[color]}`}>
            <Icon name={icon as any} className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <Link href={backHref}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              رجوع
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
