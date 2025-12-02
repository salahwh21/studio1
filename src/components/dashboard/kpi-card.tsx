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
      card: 'bg-emerald-500 bg-gradient-to-br from-emerald-500 to-emerald-600 border-none text-emerald-50',
      badge: 'bg-emerald-50/20 text-emerald-50',
      title: 'text-emerald-50/90',
      subtitle: 'text-emerald-50/80',
      value: 'text-emerald-50',
    },
    orders: {
      card: 'bg-sky-500 bg-gradient-to-br from-sky-500 to-sky-600 border-none text-sky-50',
      badge: 'bg-sky-50/20 text-sky-50',
      title: 'text-sky-50/90',
      subtitle: 'text-sky-50/80',
      value: 'text-sky-50',
    },
    success: {
      card: 'bg-violet-500 bg-gradient-to-br from-violet-500 to-violet-600 border-none text-violet-50',
      badge: 'bg-violet-50/20 text-violet-50',
      title: 'text-violet-50/90',
      subtitle: 'text-violet-50/80',
      value: 'text-violet-50',
    },
    warning: {
      card: 'bg-amber-500 bg-gradient-to-br from-amber-400 to-amber-500 border-none text-amber-50',
      badge: 'bg-amber-50/20 text-amber-50',
      title: 'text-amber-50/90',
      subtitle: 'text-amber-50/80',
      value: 'text-amber-50',
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
                      className={`h-4 w-4 ${trend.isPositive ? 'text-emerald-300' : 'text-red-300'}`}
                    />
                    <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-100' : 'text-red-100'}`}>
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
