'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
  icon: string;
  color?: string;
}

interface GoalsSectionProps {
  goals?: Goal[];
}

const goalColors = {
  orders: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    iconBg: 'bg-blue-50',
    icon: 'text-blue-600',
    progress: 'bg-blue-500',
  },
  revenue: {
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    progress: 'bg-emerald-500',
  },
  'success-rate': {
    bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
    iconBg: 'bg-violet-50',
    icon: 'text-violet-600',
    progress: 'bg-violet-500',
  },
};

export function GoalsSection({ goals = [] }: GoalsSectionProps) {
  const { formatCurrency } = useSettings();

  const formatValue = (value: number, unit?: string) => {
    if (unit === 'currency') {
      return formatCurrency(value);
    }
    return `${value}${unit || ''}`;
  };

  if (goals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="Target" className="h-5 w-5 text-primary" />
            الأهداف اليومية
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            تتبع التقدم نحو تحقيق الأهداف المحددة
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const isAchieved = goal.current >= goal.target;
          const remaining = Math.max(goal.target - goal.current, 0);
          const colors = goalColors[goal.id as keyof typeof goalColors] || goalColors.orders;

          return (
            <Card 
              key={goal.id} 
              className={cn(
                "overflow-hidden border-2 transition-all hover:shadow-lg",
                isAchieved ? "border-emerald-500" : "border-border"
              )}
            >
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-lg", colors.iconBg)}>
                        <Icon 
                          name={goal.icon as any} 
                          className={cn("h-5 w-5", colors.icon)} 
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{goal.label}</p>
                        <p className="text-2xl font-bold mt-1">
                          {formatValue(goal.current, goal.unit)}
                        </p>
                      </div>
                    </div>
                    {isAchieved && (
                      <div className="p-1.5 rounded-full bg-emerald-100">
                        <Icon name="CheckCircle" className="h-4 w-4 text-emerald-600" />
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">من {formatValue(goal.target, goal.unit)}</span>
                      <span className={cn(
                        "font-semibold",
                        isAchieved ? "text-emerald-600" : "text-muted-foreground"
                      )}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className={cn(
                        "h-2.5",
                        isAchieved ? colors.progress : ""
                      )}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    {!isAchieved ? (
                      <span className="text-xs text-muted-foreground">
                        متبقي: <span className="font-semibold">{formatValue(remaining, goal.unit)}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <Icon name="CheckCircle" className="h-3 w-3" />
                        تم تحقيق الهدف
                      </span>
                    )}
                    <div className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      progress >= 80 ? "bg-emerald-100 text-emerald-700" :
                      progress >= 50 ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {progress >= 80 ? "ممتاز" : progress >= 50 ? "جيد" : "يحتاج تحسين"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

