'use client';

import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickAction {
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  tooltip?: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    label: 'إضافة طلب',
    icon: 'Plus',
    href: '/dashboard/add-order',
    variant: 'default',
    tooltip: 'إضافة طلب جديد',
  },
  {
    label: 'استيراد',
    icon: 'Upload',
    href: '/dashboard/orders?import=true',
    variant: 'outline',
    tooltip: 'استيراد طلبات من ملف Excel',
  },
  {
    label: 'تقرير',
    icon: 'FileText',
    onClick: () => {
      // Handle export
      console.log('Export report');
    },
    variant: 'outline',
    tooltip: 'تصدير تقرير Dashboard',
  },
  {
    label: 'تحديث',
    icon: 'RefreshCw',
    onClick: () => {
      window.location.reload();
    },
    variant: 'outline',
    tooltip: 'تحديث البيانات',
  },
  {
    label: 'إشعارات',
    icon: 'Bell',
    href: '/dashboard/settings/notifications',
    variant: 'outline',
    tooltip: 'إدارة الإشعارات',
  },
  {
    label: 'إعدادات',
    icon: 'Settings',
    href: '/dashboard/settings',
    variant: 'outline',
    tooltip: 'فتح الإعدادات',
  },
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2 mr-auto">
        <Icon name="Zap" className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground">إجراءات سريعة</span>
      </div>
      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => {
            const button = (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                asChild={action.href ? true : false}
                className="gap-2"
              >
                {action.href ? (
                  <Link href={action.href}>
                    <Icon name={action.icon as any} className="h-4 w-4" />
                    <span className="hidden sm:inline">{action.label}</span>
                  </Link>
                ) : (
                  <>
                    <Icon name={action.icon as any} className="h-4 w-4" />
                    <span className="hidden sm:inline">{action.label}</span>
                  </>
                )}
              </Button>
            );

            if (action.tooltip) {
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent>
                    <p>{action.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}

