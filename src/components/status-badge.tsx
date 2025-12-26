'use client';

import { cn } from '@/lib/utils';
import { getStatusColor, formatToEnglishNumber } from '@/lib/table-utils';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';

interface StatusBadgeProps {
  status: string;
  onClick?: () => void;
  disabled?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ 
  status, 
  onClick, 
  disabled = false,
  showIcon = true,
  className 
}: StatusBadgeProps) {
  const colors = getStatusColor(status);
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'px-4 py-2 rounded-lg',
        'font-semibold text-sm',
        'transition-all duration-200',
        'min-w-[140px]',
        onClick && !disabled && 'cursor-pointer hover:opacity-85 hover:-translate-y-0.5 hover:shadow-md',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `2px solid ${colors.border}`,
      }}
    >
      {showIcon && <Icon name={colors.icon as any} className="h-4 w-4" />}
      <span>{status}</span>
    </Component>
  );
}

interface SourceBadgeProps {
  source: string;
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const colors = {
    'Shopify': { bg: '#dcfce7', text: '#166534', icon: 'Store' },
    'Manual': { bg: '#e0e7ff', text: '#3730a3', icon: 'Edit' },
    'API': { bg: '#fce7f3', text: '#9f1239', icon: 'FileText' },
    'WooCommerce': { bg: '#f3e8ff', text: '#6b21a8', icon: 'Store' },
  }[source] || { bg: '#f3f4f6', text: '#374151', icon: 'FileText' };
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        'px-3 py-1 rounded-full',
        'text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      <Icon name={colors.icon as any} className="h-3 w-3" />
      <span>{source}</span>
    </div>
  );
}

interface UserAvatarProps {
  name: string;
  role?: 'driver' | 'merchant';
  className?: string;
}

export function UserAvatar({ name, role, className }: UserAvatarProps) {
  const getInitials = (name: string) => {
    if (!name || name === 'غير معين') return '؟';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };
  
  const getAvatarColor = (name: string) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm"
        style={{ background: getAvatarColor(name) }}
      >
        {getInitials(name)}
      </div>
      <span className="font-medium">{name}</span>
    </div>
  );
}

interface FinancialCellProps {
  value: number;
  currency?: boolean;
  className?: string;
}

export function FinancialCell({ value, currency = true, className }: FinancialCellProps) {
  const { settings } = useSettings();
  const isNegative = value < 0;
  const formatted = formatToEnglishNumber(Math.abs(value));
  const symbol = settings.regional.currencySymbol;
  const position = settings.regional.currencySymbolPosition;
  
  return (
    <div
      className={cn(
        'font-semibold tabular-nums',
        isNegative ? 'text-red-600' : 'text-green-600',
        className
      )}
      dir="ltr"
    >
      {isNegative && '-'}
      {currency && position === 'before' && `${symbol} `}
      {formatted}
      {currency && position === 'after' && ` ${symbol}`}
    </div>
  );
}
