'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { 
    Clock, Truck, PackageCheck, Undo2, XCircle, 
    Phone, HandCoins, CheckCheck, CalendarClock,
    UserCheck, Package, AlertTriangle, RotateCcw,
    Ban, HelpCircle
} from 'lucide-react';

// Map status codes/names to icons with animations
const STATUS_CONFIG: Record<string, {
    icon: React.ElementType;
    animation: string;
    pulseColor: string;
}> = {
    // Arabic names
    'بالانتظار': {
        icon: Clock,
        animation: 'animate-spin-slow',
        pulseColor: 'bg-slate-400',
    },
    'بانتظار السائق': {
        icon: UserCheck,
        animation: 'animate-bounce-subtle',
        pulseColor: 'bg-slate-500',
    },
    'جاري التوصيل': {
        icon: Truck,
        animation: 'animate-truck',
        pulseColor: 'bg-blue-500',
    },
    'تم التوصيل': {
        icon: PackageCheck,
        animation: 'animate-check-bounce',
        pulseColor: 'bg-green-500',
    },
    'مؤجل': {
        icon: CalendarClock,
        animation: 'animate-pulse-scale',
        pulseColor: 'bg-amber-500',
    },
    'مرتجع': {
        icon: Undo2,
        animation: 'animate-return',
        pulseColor: 'bg-purple-500',
    },
    'ملغي': {
        icon: XCircle,
        animation: 'animate-shake',
        pulseColor: 'bg-red-500',
    },
    'لا يرد': {
        icon: Phone,
        animation: 'animate-ring',
        pulseColor: 'bg-orange-500',
    },
    'تم استلام المال في الفرع': {
        icon: HandCoins,
        animation: 'animate-coin',
        pulseColor: 'bg-teal-600',
    },
    'مكتمل': {
        icon: CheckCheck,
        animation: 'animate-double-check',
        pulseColor: 'bg-emerald-600',
    },
    'مرتجع جزئي': {
        icon: RotateCcw,
        animation: 'animate-spin-once',
        pulseColor: 'bg-violet-500',
    },
    'مرفوض - مدفوع': {
        icon: Ban,
        animation: 'animate-pulse',
        pulseColor: 'bg-rose-500',
    },
    'مرفوض - غير مدفوع': {
        icon: Ban,
        animation: 'animate-pulse',
        pulseColor: 'bg-rose-600',
    },
    'تم ارجاعه للفرع': {
        icon: Package,
        animation: 'animate-bounce-subtle',
        pulseColor: 'bg-indigo-500',
    },
};

// Default config for unknown statuses
const DEFAULT_CONFIG = {
    icon: HelpCircle,
    animation: '',
    pulseColor: 'bg-gray-400',
};

interface AnimatedStatusIconProps {
    status: string;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    showPulse?: boolean;
    className?: string;
}

export const AnimatedStatusIcon = ({
    status,
    color,
    size = 'md',
    showPulse = true,
    className,
}: AnimatedStatusIconProps) => {
    const config = STATUS_CONFIG[status] || DEFAULT_CONFIG;
    const Icon = config.icon;
    
    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    const pulseSizeClasses = {
        sm: 'h-1.5 w-1.5',
        md: 'h-2 w-2',
        lg: 'h-2.5 w-2.5',
    };

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <Icon 
                className={cn(
                    sizeClasses[size],
                    config.animation,
                    "transition-transform duration-300"
                )} 
                style={{ color: color }}
            />
            {showPulse && (
                <span 
                    className={cn(
                        "absolute -top-0.5 -right-0.5 rounded-full animate-ping opacity-75",
                        pulseSizeClasses[size],
                        config.pulseColor
                    )}
                />
            )}
        </div>
    );
};

// CSS animations to add to globals.css
export const STATUS_ANIMATIONS_CSS = `
/* Status Icon Animations */
@keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes truck {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(2px); }
    75% { transform: translateX(-2px); }
}

@keyframes check-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

@keyframes pulse-scale {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes return {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-20deg); }
    75% { transform: rotate(20deg); }
    100% { transform: rotate(0deg); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-1px); }
    20%, 40%, 60%, 80% { transform: translateX(1px); }
}

@keyframes ring {
    0%, 100% { transform: rotate(0deg); }
    10%, 30% { transform: rotate(10deg); }
    20%, 40% { transform: rotate(-10deg); }
    50% { transform: rotate(0deg); }
}

@keyframes coin {
    0%, 100% { transform: rotateY(0deg); }
    50% { transform: rotateY(180deg); }
}

@keyframes double-check {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.1) translateX(-1px); }
    50% { transform: scale(1.15); }
    75% { transform: scale(1.1) translateX(1px); }
}

@keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
}

@keyframes spin-once {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
}

.animate-spin-slow {
    animation: spin-slow 3s linear infinite;
}

.animate-truck {
    animation: truck 0.5s ease-in-out infinite;
}

.animate-check-bounce {
    animation: check-bounce 1s ease-in-out infinite;
}

.animate-pulse-scale {
    animation: pulse-scale 2s ease-in-out infinite;
}

.animate-return {
    animation: return 1s ease-in-out infinite;
}

.animate-shake {
    animation: shake 0.5s ease-in-out infinite;
}

.animate-ring {
    animation: ring 1s ease-in-out infinite;
}

.animate-coin {
    animation: coin 2s ease-in-out infinite;
}

.animate-double-check {
    animation: double-check 1.5s ease-in-out infinite;
}

.animate-bounce-subtle {
    animation: bounce-subtle 1s ease-in-out infinite;
}

.animate-spin-once {
    animation: spin-once 0.5s ease-out;
}
`;
