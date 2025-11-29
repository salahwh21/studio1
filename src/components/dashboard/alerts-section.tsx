'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';

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

export function AlertsSection({ alerts }: AlertsSectionProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bell" className="h-5 w-5" />
            التنبيهات والإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="CheckCircle" className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>لا توجد تنبيهات حالية</p>
            <p className="text-xs mt-1">كل شيء يعمل بشكل طبيعي</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Bell" className="h-5 w-5" />
          التنبيهات والإشعارات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-3 rounded-lg bg-muted border-l-4" 
            style={{
              borderLeftColor: alert.type === 'error' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6'
            }}>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Icon
                  name={alert.type === 'error' ? 'AlertCircle' : alert.type === 'warning' ? 'AlertTriangle' : 'Info'}
                  className={`h-5 w-5 ${
                    alert.type === 'error' ? 'text-red-500' : alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {alert.type === 'error' ? 'حرج' : alert.type === 'warning' ? 'تحذير' : 'معلومة'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {alert.timestamp.toLocaleTimeString('ar-JO')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
