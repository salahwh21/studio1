'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, Truck, PackageCheck, Undo2, CalendarDays, 
    XCircle, Phone, HandCoins, CheckCheck, CalendarClock,
    Sparkles
} from 'lucide-react';
import { FilterDefinition } from '@/app/actions/get-orders';
import { cn } from '@/lib/utils';

interface QuickFilter {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    hoverBg: string;
    filter: FilterDefinition;
}

const QUICK_FILTERS: QuickFilter[] = [
    {
        id: 'today',
        label: 'اليوم',
        icon: CalendarDays,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/40',
        hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/50',
        filter: {
            field: 'date',
            operator: 'equals',
            value: new Date().toISOString().split('T')[0],
        },
    },
    {
        id: 'pending',
        label: 'بالانتظار',
        icon: Clock,
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-50 dark:bg-slate-800/40',
        hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-700/50',
        filter: {
            field: 'status',
            operator: 'equals',
            value: 'بالانتظار',
        },
    },
    {
        id: 'out_for_delivery',
        label: 'جاري التوصيل',
        icon: Truck,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/40',
        hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/50',
        filter: {
            field: 'status',
            operator: 'equals',
            value: 'جاري التوصيل',
        },
    },
    {
        id: 'delivered',
        label: 'تم التوصيل',
        icon: PackageCheck,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/40',
        hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/50',
        filter: {
            field: 'status',
            operator: 'equals',
            value: 'تم التوصيل',
        },
    },
    {
        id: 'postponed',
        label: 'مؤجل',
        icon: CalendarClock,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/40',
        hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/50',
        filter: {
            field: 'status',
            operator: 'equals',
            value: 'مؤجل',
        },
    },
    {
        id: 'returned',
        label: 'مرتجع',
        icon: Undo2,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950/40',
        hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/50',
        filter: {
            field: 'status',
            operator: 'equals',
            value: 'مرتجع',
        },
    },
    {
        id: 'no_answer',
        label: 'لا يرد',
        icon: Phone,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/40',
        hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900/50',
        filter: {
            field: 'status',
            operator: 'equals',
            value: 'لا يرد',
        },
    },
    {
        id: 'cancelled',
        label: 'ملغي',
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/40',
        hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/50',
        filter: {
            field: 'status',
            operator: 'equals',
            value: 'ملغي',
        },
    },
    {
        id: 'money_received',
        label: 'تم استلام المال',
        icon: HandCoins,
        color: 'text-teal-600 dark:text-teal-400',
        bgColor: 'bg-teal-50 dark:bg-teal-950/40',
        hoverBg: 'hover:bg-teal-100 dark:hover:bg-teal-900/50',
        filter: {
            field: 'status',
            operator: 'equals',
            value: 'تم استلام المال في الفرع',
        },
    },
    {
        id: 'completed',
        label: 'مكتمل',
        icon: CheckCheck,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
        hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
        filter: {
            field: 'status',
            operator: 'equals',
            value: 'مكتمل',
        },
    },
];

interface QuickFiltersProps {
    activeFilters: FilterDefinition[];
    onFilterToggle: (filter: FilterDefinition) => void;
    className?: string;
}

export const QuickFilters = ({ activeFilters, onFilterToggle, className }: QuickFiltersProps) => {
    const isFilterActive = (filter: FilterDefinition) => {
        return activeFilters.some(
            f => f.field === filter.field && f.operator === filter.operator && f.value === filter.value
        );
    };

    return (
        <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>فلاتر سريعة:</span>
            </div>
            {QUICK_FILTERS.map((qf) => {
                const Icon = qf.icon;
                const isActive = isFilterActive(qf.filter);
                
                return (
                    <Button
                        key={qf.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => onFilterToggle(qf.filter)}
                        className={cn(
                            "h-7 px-2.5 gap-1.5 text-xs font-medium transition-all duration-200 rounded-full border",
                            isActive 
                                ? `${qf.bgColor} ${qf.color} border-current shadow-sm scale-105` 
                                : `bg-white/50 dark:bg-slate-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 ${qf.hoverBg}`,
                        )}
                    >
                        <Icon className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            isActive && "animate-pulse"
                        )} />
                        <span>{qf.label}</span>
                        {isActive && (
                            <Badge 
                                variant="secondary" 
                                className="h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-white/80 dark:bg-slate-800/80"
                            >
                                ✓
                            </Badge>
                        )}
                    </Button>
                );
            })}
        </div>
    );
};
