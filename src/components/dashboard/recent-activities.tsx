'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/icon';

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

  const getActivityColor = (type: Activity['type']) => {
    const colors: Record<Activity['type'], string> = {
      order: 'bg-blue-100 text-blue-600',
      user: 'bg-purple-100 text-purple-600',
      driver: 'bg-green-100 text-green-600',
      system: 'bg-gray-100 text-gray-600'
    };
    return colors[type];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Activity" className="h-5 w-5" />
          الأنشطة الحديثة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>لا توجد أنشطة حالية</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.avatar} alt={activity.user} />
                  <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.user}
                        <span className="text-muted-foreground font-normal"> {activity.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                    </div>
                    <div className={`p-1.5 rounded-md ${getActivityColor(activity.type)}`}>
                      <Icon name={getActivityIcon(activity.type)} className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    منذ {Math.floor((Date.now() - activity.timestamp.getTime()) / 60000)} دقيقة
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
