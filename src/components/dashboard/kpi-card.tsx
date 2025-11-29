'use client';

import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/icon';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  color = 'text-blue-500',
  trend
}: KPICardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <Icon
                  name={trend.isPositive ? 'TrendingUp' : 'TrendingDown'}
                  className={`h-4 w-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
                />
                <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-muted ${color}`}>
            <Icon name={icon} className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
