/**
 * Table utilities for orders table
 * Includes color schemes, number formatting, and RTL support
 */

// Status color mapping
export const STATUS_COLORS = {
  'بالانتظار': {
    bg: '#fef3c7',
    text: '#92400e',
    border: '#fbbf24',
    icon: 'Clock',
  },
  'جاري التوصيل': {
    bg: '#dbeafe',
    text: '#1e40af',
    border: '#3b82f6',
    icon: 'Truck',
  },
  'تم التوصيل': {
    bg: '#d1fae5',
    text: '#065f46',
    border: '#10b981',
    icon: 'CheckCircle2',
  },
  'مرتجع': {
    bg: '#fce7f3',
    text: '#9f1239',
    border: '#ec4899',
    icon: 'Undo2',
  },
  'مؤجل': {
    bg: '#fed7aa',
    text: '#9a3412',
    border: '#f97316',
    icon: 'Clock',
  },
  'تم استلام المال في الفرع': {
    bg: '#ccfbf1',
    text: '#134e4a',
    border: '#14b8a6',
    icon: 'CheckCircle2',
  },
  'ملغي': {
    bg: '#fee2e2',
    text: '#991b1b',
    border: '#ef4444',
    icon: 'X',
  },
} as const;

// Source color mapping
export const SOURCE_COLORS = {
  'Shopify': {
    bg: '#dcfce7',
    text: '#166534',
    icon: 'Store',
  },
  'Manual': {
    bg: '#e0e7ff',
    text: '#3730a3',
    icon: 'Edit',
  },
  'API': {
    bg: '#fce7f3',
    text: '#9f1239',
    icon: 'FileText',
  },
  'WooCommerce': {
    bg: '#f3e8ff',
    text: '#6b21a8',
    icon: 'Store',
  },
} as const;

/**
 * Format number to English numerals (0-9)
 * Ensures all numbers are displayed in Western format
 */
export function formatToEnglishNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  // Format with commas for thousands
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Format currency with configurable symbol and position
 */
export function formatCurrency(
  value: number, 
  currencySymbol: string = 'د.أ', 
  position: 'before' | 'after' = 'after'
): string {
  const formatted = formatToEnglishNumber(value);
  return position === 'before' 
    ? `${currencySymbol} ${formatted}` 
    : `${formatted} ${currencySymbol}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as: 0799-123-456
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Get status color scheme
 */
export function getStatusColor(status: string) {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || {
    bg: '#f3f4f6',
    text: '#374151',
    border: '#d1d5db',
    icon: 'Package',
  };
}

/**
 * Get source color scheme
 */
export function getSourceColor(source: string) {
  return SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] || {
    bg: '#f3f4f6',
    text: '#374151',
    icon: 'FileText',
  };
}

/**
 * Get initials from name for avatar
 */
export function getInitials(name: string): string {
  if (!name) return '؟';

  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate avatar color based on name
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ];

  // Generate consistent color based on name
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Format date to Arabic
 */
export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-JO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get row background color based on status
 */
export function getRowColor(status: string, isSelected: boolean, isHovered: boolean): string {
  if (isSelected) return '#eff6ff';
  if (isHovered) return '#f8fafc';

  // Subtle status-based coloring
  const statusColor = getStatusColor(status);
  return `${statusColor.bg}10`; // Very light tint
}

/**
 * Validate and sanitize input
 */
export function sanitizeInput(value: string): string {
  return value.trim().replace(/[<>]/g, '');
}

/**
 * Check if value is financial (positive/negative)
 */
export function isNegativeFinancial(value: number): boolean {
  return value < 0;
}

/**
 * Get financial cell class
 */
export function getFinancialClass(value: number): string {
  return value < 0 ? 'financial-cell negative' : 'financial-cell';
}
