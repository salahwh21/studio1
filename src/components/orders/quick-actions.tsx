'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    Eye, Edit3, Printer, Trash2, Truck, 
    ArrowRightLeft, Copy, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface QuickActionsProps {
    orderId: string;
    isEditMode: boolean;
    onViewOrder?: () => void;
    onEditOrder?: () => void;
    onPrintOrder?: () => void;
    onDeleteOrder?: () => void;
    onAssignDriver?: () => void;
    onChangeStatus?: () => void;
    onCopyId?: () => void;
    className?: string;
}

export const QuickActions = ({
    orderId,
    isEditMode,
    onViewOrder,
    onEditOrder,
    onPrintOrder,
    onDeleteOrder,
    onAssignDriver,
    onChangeStatus,
    onCopyId,
    className,
}: QuickActionsProps) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onCopyId?.();
    };

    const actions = [
        {
            id: 'view',
            icon: Eye,
            label: 'عرض التفاصيل',
            onClick: onViewOrder,
            href: `/dashboard/orders/${orderId}`,
            color: 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50',
            show: true,
        },
        {
            id: 'copy',
            icon: copied ? Copy : Copy,
            label: copied ? 'تم النسخ!' : 'نسخ رقم الطلب',
            onClick: handleCopyId,
            color: copied 
                ? 'text-green-500 bg-green-50 dark:bg-green-950/50' 
                : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50',
            show: true,
        },
        {
            id: 'status',
            icon: ArrowRightLeft,
            label: 'تغيير الحالة',
            onClick: onChangeStatus,
            color: 'text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50',
            show: isEditMode,
        },
        {
            id: 'driver',
            icon: Truck,
            label: 'تعيين سائق',
            onClick: onAssignDriver,
            color: 'text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50',
            show: isEditMode,
        },
        {
            id: 'print',
            icon: Printer,
            label: 'طباعة',
            onClick: onPrintOrder,
            color: 'text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50',
            show: true,
        },
        {
            id: 'delete',
            icon: Trash2,
            label: 'حذف',
            onClick: onDeleteOrder,
            color: 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50',
            show: isEditMode,
        },
    ];

    return (
        <div 
            className={cn(
                "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300",
                "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700",
                "px-1 py-0.5 scale-90 group-hover:scale-100",
                className
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {actions.filter(a => a.show).map((action) => {
                const Icon = action.icon;
                const content = (
                    <Tooltip key={action.id}>
                        <TooltipTrigger asChild>
                            {action.href ? (
                                <Link href={action.href}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-7 w-7 p-0 rounded-md transition-all duration-200",
                                            action.color
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={action.onClick}
                                    className={cn(
                                        "h-7 w-7 p-0 rounded-md transition-all duration-200",
                                        action.color
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            {action.label}
                        </TooltipContent>
                    </Tooltip>
                );
                return content;
            })}
        </div>
    );
};
