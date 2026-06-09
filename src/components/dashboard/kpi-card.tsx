'use client';

import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/icon';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  /**
   * Variant controls the visual style / colors of the card (background + icon).
   * Examples: revenue (green), orders (blue), success (purple), warning (orange).
   */
  variant?: 'revenue' | 'orders' | 'success' | 'warning';
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    previousValue?: string | number;
    period?: string;
  };
  progress?: number; // Progress percentage (0-100) for goals
  target?: string | number; // Target value for progress
  onClick?: () => void;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  variant = 'revenue',
  color = 'primary',
  trend,
  progress,
  target,
  onClick,
  loading = false
}: KPICardProps) {
  const variantStyles: Record<KPICardProps['variant'], { card: string; badge: string; title: string; subtitle: string; value: string }> = {
    revenue: {
      card: 'bg-success border-none text-success-foreground',
      badge: 'bg-success/20 text-success-foreground',
      title: 'text-success-foreground/90',
      subtitle: 'text-success-foreground/80',
      value: 'text-success-foreground',
    },
    orders: {
      card: 'bg-info border-none text-info-foreground',
      badge: 'bg-info/20 text-info-foreground',
      title: 'text-info-foreground/90',
      subtitle: 'text-info-foreground/80',
      value: 'text-info-foreground',
    },
    success: {
      card: 'bg-primary border-none text-primary-foreground',
      badge: 'bg-primary/20 text-primary-foreground',
      title: 'text-primary-foreground/90',
      subtitle: 'text-primary-foreground/80',
      value: 'text-primary-foreground',
    },
    warning: {
      card: 'bg-warning border-none text-warning-foreground',
      badge: 'bg-warning/20 text-warning-foreground',
      title: 'text-warning-foreground/90',
      subtitle: 'text-warning-foreground/80',
      value: 'text-warning-foreground',
    },
  };

  const currentVariant = variantStyles[variant] ?? variantStyles.revenue;

  const cardContent = (
    <CardContent className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <p className={`text-xs sm:text-sm font-medium tracking-tight ${currentVariant.title}`}>{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-white/20 rounded animate-pulse" />
          ) : (
            <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${currentVariant.value}`}>{value}</p>
          )}
          {subtitle && <p className={`text-xs leading-relaxed ${currentVariant.subtitle}`}>{subtitle}</p>}
          
          {/* Trend with comparison */}
          {trend && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 mt-2 cursor-help">
                    <Icon
                      name={trend.isPositive ? 'TrendingUp' : 'TrendingDown'}
                      className={`h-4 w-4 ${trend.isPositive ? 'text-success/80' : 'text-destructive/80'}`}
                    />
                    <span className={`text-xs font-medium ${trend.isPositive ? 'text-success/90' : 'text-destructive/90'}`}>
                      {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                    {trend.period && (
                      <span className="text-xs opacity-70">({trend.period})</span>
                    )}
                  </div>
                </TooltipTrigger>
                {trend.previousValue && (
                  <TooltipContent>
                    <p className="text-sm">
                      الفترة السابقة: {trend.previousValue}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Progress bar for goals */}
          {progress !== undefined && target && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={currentVariant.subtitle}>التقدم نحو الهدف</span>
                <span className={currentVariant.subtitle}>{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-white/20"
              />
              <p className={`text-xs ${currentVariant.subtitle}`}>
                الهدف: {target}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center">
          <div
            className={
              `p-3 rounded-xl shadow-sm flex items-center justify-center transition-transform hover:scale-110 ${currentVariant.badge}` +
              (typeof color === 'string' && color !== 'primary' ? ` text-${color}` : '')
            }
          >
            <Icon name={icon} className="h-5 w-5" />
          </div>
        </div>
      </div>
    </CardContent>
  );

  return (
    <Card 
      className={`overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border ${currentVariant.card} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {cardContent}
    </Card>
  );
}
