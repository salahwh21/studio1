'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  user: string;
  avatar?: string;
  action: string;
  details: string;
  timestamp: Date;
  type: 'order' | 'user' | 'driver' | 'system';
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const activityStyles = {
  order: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  user: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    icon: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
  },
  driver: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  system: {
    bg: 'bg-gray-50 dark:bg-gray-900/50',
    icon: 'text-gray-600 dark:text-gray-400',
    iconBg: 'bg-gray-100 dark:bg-gray-800/50',
  },
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: Activity['type']) => {
    const icons: Record<Activity['type'], string> = {
      order: 'ShoppingCart',
      user: 'User',
      driver: 'Truck',
      system: 'Settings'
    };
    return icons[type];
  };

  const formatTime = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon name="Activity" className="h-5 w-5 text-primary" />
          </div>
          الأنشطة الحديثة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                <Icon name="Activity" className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-muted-foreground">لا توجد أنشطة حالية</p>
              <p className="text-sm text-muted-foreground mt-1">سيتم عرض الأنشطة هنا عند حدوثها</p>
            </div>
          ) : (
            activities.map((activity) => {
              const styles = activityStyles[activity.type];
              
              return (
                <div 
                  key={activity.id} 
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm",
                    styles.bg,
                    "border-border"
                  )}
                >
                  <div className={cn("p-2 rounded-lg flex-shrink-0", styles.iconBg)}>
                    <Icon 
                      name={getActivityIcon(activity.type) as any} 
                      className={cn("h-4 w-4", styles.icon)} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {activity.user}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.action}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {activity.details}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon name="Clock" className="h-3 w-3" />
                      <span>{formatTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
