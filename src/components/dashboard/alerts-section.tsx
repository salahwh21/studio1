'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
}

interface AlertsSectionProps {
  alerts: Alert[];
}

const alertStyles = {
  error: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-900',
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-900',
    icon: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-900',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
};

export function AlertsSection({ alerts }: AlertsSectionProps) {
  if (alerts.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Icon name="Bell" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            التنبيهات والإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
              <Icon name="CheckCircle" className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-medium text-muted-foreground">لا توجد تنبيهات حالية</p>
            <p className="text-sm text-muted-foreground mt-1">كل شيء يعمل بشكل طبيعي</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon name="Bell" className="h-5 w-5 text-primary" />
            </div>
            التنبيهات والإشعارات
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {alerts.length} تنبيه
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const styles = alertStyles[alert.type];
          
          return (
            <div 
              key={alert.id} 
              className={cn(
                "p-4 rounded-lg border-2 transition-all hover:shadow-md",
                styles.bg,
                styles.border
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-2.5 rounded-lg flex-shrink-0", styles.iconBg)}>
                  <Icon
                    name={alert.type === 'error' ? 'AlertCircle' : alert.type === 'warning' ? 'AlertTriangle' : 'Info'}
                    className={cn("h-5 w-5", styles.icon)}
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                    <Badge className={cn("text-xs flex-shrink-0", styles.badge)}>
                      {alert.type === 'error' ? 'حرج' : alert.type === 'warning' ? 'تحذير' : 'معلومة'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Clock" className="h-3.5 w-3.5" />
                    <span>{alert.timestamp.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
