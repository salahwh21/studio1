'use client';

import { useState, useEffect } from 'react';
import {
    Printer,
    FileText,
    Palette,
    Tag,
    Eye,
    Download,
    Check,
    RectangleVertical,
    RectangleHorizontal
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// أنواع البوليصة المبسطة
type PolicyType = 'thermal' | 'standard' | 'colored';
type Orientation = 'portrait' | 'landscape';

// أحجام الورق
type PaperSize = 'a4' | 'a5' | 'thermal-100x150' | 'thermal-100x100' | 'thermal-75x50' | 'thermal-60x40' | 'thermal-50x30';

interface PrintOptionsDialogV2Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    onPrint: (type: PolicyType, size: PaperSize, orientation: Orientation) => void;
    onPreview: (type: PolicyType, size: PaperSize, orientation: Orientation) => void;
}

// تعريف أنواع البوليصات
const POLICY_TYPES = {
    thermal: {
        label: 'ملصق حراري',
        description: 'للطابعات الحرارية',
        icon: Tag,
        gradient: 'from-emerald-500 to-teal-600',
        bgLight: 'bg-emerald-50',
        borderColor: 'border-emerald-500',
        textColor: 'text-emerald-600',
    },
    standard: {
        label: 'بوليصة قياسية',
        description: 'أبيض وأسود',
        icon: FileText,
        gradient: 'from-blue-500 to-indigo-600',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-600',
    },
    colored: {
        label: 'بوليصة ملونة',
        description: 'تصميم احترافي',
        icon: Palette,
        gradient: 'from-purple-500 to-pink-600',
        bgLight: 'bg-purple-50',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-600',
    },
};

// أحجام الورق الحراري
const THERMAL_SIZES = {
    'thermal-100x150': { label: '100×150', width: 100, height: 150 },
    'thermal-100x100': { label: '100×100', width: 100, height: 100 },
    'thermal-75x50': { label: '75×50', width: 75, height: 50 },
    'thermal-60x40': { label: '60×40', width: 60, height: 40 },
    'thermal-50x30': { label: '50×30', width: 50, height: 30 },
};

// أحجام الورق القياسي
const STANDARD_SIZES = {
    'a4': { label: 'A4', width: 210, height: 297 },
    'a5': { label: 'A5', width: 148, height: 210 },
};

// مفتاح التخزين المحلي
const STORAGE_KEY = 'print-options-preferences-v2';

export const PrintOptionsDialogV2 = ({
    open,
    onOpenChange,
    selectedCount,
    onPrint,
    onPreview,
}: PrintOptionsDialogV2Props) => {
    // استرجاع الخيارات المحفوظة
    const getStoredPreferences = () => {
        if (typeof window === 'undefined') return { type: 'thermal', size: 'thermal-100x150', orientation: 'portrait' };
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : { type: 'thermal', size: 'thermal-100x150', orientation: 'portrait' };
        } catch {
            return { type: 'thermal', size: 'thermal-100x150', orientation: 'portrait' };
        }
    };

    const [policyType, setPolicyType] = useState<PolicyType>('thermal');
    const [paperSize, setPaperSize] = useState<PaperSize>('thermal-100x150');
    const [orientation, setOrientation] = useState<Orientation>('portrait');
    const [isLoading, setIsLoading] = useState(false);

    // استرجاع الخيارات عند الفتح
    useEffect(() => {
        if (open) {
            const prefs = getStoredPreferences();
            setPolicyType(prefs.type as PolicyType);
            setPaperSize(prefs.size as PaperSize);
            setOrientation(prefs.orientation as Orientation);
        }
    }, [open]);

    // حفظ الخيارات
    const savePreferences = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: policyType, size: paperSize, orientation }));
        }
    };

    // تغيير نوع البوليصة
    const handleTypeChange = (type: PolicyType) => {
        setPolicyType(type);
        if (type === 'thermal') {
            setPaperSize('thermal-100x150');
        } else {
            setPaperSize('a4');
        }
    };

    // الطباعة
    const handlePrint = async () => {
        setIsLoading(true);
        savePreferences();
        try {
            await onPrint(policyType, paperSize, orientation);
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    // المعاينة
    const handlePreview = () => {
        savePreferences();
        onPreview(policyType, paperSize, orientation);
        onOpenChange(false);
    };

    const currentType = POLICY_TYPES[policyType];
    const sizes = policyType === 'thermal' ? THERMAL_SIZES : STANDARD_SIZES;
    const currentSize = sizes[paperSize as keyof typeof sizes];

    // حساب الأبعاد المعروضة
    const displayWidth = orientation === 'portrait' ? currentSize?.width : currentSize?.height;
    const displayHeight = orientation === 'portrait' ? currentSize?.height : currentSize?.width;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent dir="rtl" className="max-w-2xl p-0 gap-0 overflow-hidden border-0 shadow-2xl">
                {/* Header */}
                <div className={cn("px-6 py-4", `bg-gradient-to-l ${currentType.gradient}`)}>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-white flex items-center gap-3">
                            <Printer className="h-5 w-5" />
                            طباعة البوليصة
                            <Badge className="bg-white/20 text-white text-xs mr-auto">
                                {selectedCount} طلب
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-5 space-y-5">
                    {/* نوع البوليصة */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                            نوع البوليصة
                        </Label>

                        <div className="grid grid-cols-3 gap-3">
                            {(Object.entries(POLICY_TYPES) as [PolicyType, typeof POLICY_TYPES.thermal][]).map(([key, config]) => {
                                const Icon = config.icon;
                                const isSelected = policyType === key;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleTypeChange(key)}
                                        className={cn(
                                            "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                                            isSelected
                                                ? `${config.borderColor} ${config.bgLight} shadow-lg`
                                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                            isSelected
                                                ? `bg-gradient-to-br ${config.gradient} shadow-lg text-white`
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                                        )}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="text-center">
                                            <span className="font-bold text-xs block">{config.label}</span>
                                            <span className="text-[10px] text-gray-500">{config.description}</span>
                                        </div>
                                        {isSelected && (
                                            <div className={cn(
                                                "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow",
                                                `bg-gradient-to-br ${config.gradient}`
                                            )}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <Separator />

                    {/* حجم الورق والاتجاه */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* حجم الورق */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-600" />
                                حجم الورق
                            </Label>

                            <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1">
                                {Object.entries(sizes).map(([key, config]) => {
                                    const isSelected = paperSize === key;

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setPaperSize(key as PaperSize)}
                                            className={cn(
                                                "flex items-center justify-between gap-2 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]",
                                                isSelected
                                                    ? `${currentType.borderColor} ${currentType.bgLight} shadow-md`
                                                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                            )}
                                        >
                                            <span className={cn(
                                                "font-bold text-sm",
                                                isSelected ? currentType.textColor : "text-gray-700 dark:text-gray-300"
                                            )}>
                                                {config.label}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                {config.width}×{config.height} مم
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* الاتجاه */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600" />
                                الاتجاه
                            </Label>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setOrientation('portrait')}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                                        orientation === 'portrait'
                                            ? `${currentType.borderColor} ${currentType.bgLight} shadow-md`
                                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                    )}
                                >
                                    <RectangleVertical className={cn(
                                        "h-8 w-6",
                                        orientation === 'portrait' ? currentType.textColor : "text-gray-500"
                                    )} />
                                    <span className="text-xs font-medium">عمودي</span>
                                </button>
                                <button
                                    onClick={() => setOrientation('landscape')}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                                        orientation === 'landscape'
                                            ? `${currentType.borderColor} ${currentType.bgLight} shadow-md`
                                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                                    )}
                                >
                                    <RectangleHorizontal className={cn(
                                        "h-6 w-8",
                                        orientation === 'landscape' ? currentType.textColor : "text-gray-500"
                                    )} />
                                    <span className="text-xs font-medium">أفقي</span>
                                </button>
                            </div>

                            {/* معاينة الأبعاد */}
                            <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2">
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded transition-all",
                                        currentType.borderColor
                                    )}
                                    style={{
                                        width: Math.min(displayWidth || 50, 60),
                                        height: Math.min(displayHeight || 70, 80) * 0.7,
                                    }}
                                />
                                <span className="text-xs text-gray-500 mr-3">
                                    {displayWidth}×{displayHeight} مم
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* ملخص وأزرار الإجراء */}
                    <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const Icon = currentType.icon;
                                    return <Icon className={cn("h-5 w-5", currentType.textColor)} />;
                                })()}
                                <div>
                                    <span className="font-bold text-sm">{currentType.label}</span>
                                    <span className="text-xs text-gray-500 mr-2">
                                        - {currentSize?.label} ({orientation === 'portrait' ? 'عمودي' : 'أفقي'})
                                    </span>
                                </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {selectedCount} طلب
                            </Badge>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                className="flex-1 gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                معاينة
                            </Button>
                            <Button
                                onClick={handlePrint}
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 gap-2 text-white",
                                    `bg-gradient-to-r ${currentType.gradient} hover:opacity-90`
                                )}
                            >
                                {isLoading ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                طباعة PDF
                            </Button>
                        </div>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};
