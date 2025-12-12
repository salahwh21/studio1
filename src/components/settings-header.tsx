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
  blue: 'from-blue-600 to-blue-800',
  purple: 'from-purple-600 to-purple-800',
  emerald: 'from-emerald-600 to-emerald-800',
  amber: 'from-amber-600 to-amber-800',
  indigo: 'from-indigo-600 to-indigo-800',
  default: 'from-slate-700 to-slate-900',
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
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradientClass} border border-white/10 p-6 shadow-xl`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg">
              <Icon name={icon as any} className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              <p className="text-white/70 mt-0.5">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <Link href={backHref}>
              <Button variant="secondary" size="sm" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
                <ArrowLeft className="h-4 w-4" />
                رجوع
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
