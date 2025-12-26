'use client';

import { useState } from 'react';
import { 
    Printer, 
    FileText, 
    Maximize2,
    Square,
    RectangleHorizontal,
    RectangleVertical,
    Smartphone,
    Tag,
    X,
    Eye,
    Layers,
    Copy
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PrintType = 'pdf' | 'colored' | 'thermal' | 'bulk-separate' | 'bulk-single';
type PaperSize = 'a4' | 'a5' | 'thermal-100x150' | 'thermal-100x100' | 'thermal-75x50' | 'thermal-60x40' | 'thermal-50x30';
type Orientation = 'portrait' | 'landscape';

interface PrintOptionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    onPrint: (type: PrintType, size: PaperSize, orientation: Orientation) => void;
}

// أحجام PDF والملون (قياسين فقط)
const STANDARD_SIZES: Record<string, { label: string; icon: React.ReactNode; dimensions: string }> = {
    'a4': { label: 'A4', icon: <FileText className="h-6 w-6" />, dimensions: '210 × 297 مم' },
    'a5': { label: 'A5', icon: <RectangleVertical className="h-6 w-6" />, dimensions: '148 × 210 مم' },
};

// أحجام الحراري (5 قياسات)
const THERMAL_SIZES: Record<string, { label: string; icon: React.ReactNode; dimensions: string }> = {
    'thermal-100x150': { label: '100×150', icon: <Tag className="h-6 w-6" />, dimensions: '100 × 150 مم' },
    'thermal-100x100': { label: '100×100', icon: <Square className="h-6 w-6" />, dimensions: '100 × 100 مم' },
    'thermal-75x50': { label: '75×50', icon: <RectangleHorizontal className="h-5 w-5" />, dimensions: '75 × 50 مم' },
    'thermal-60x40': { label: '60×40', icon: <Smartphone className="h-5 w-5" />, dimensions: '60 × 40 مم' },
    'thermal-50x30': { label: '50×30', icon: <Tag className="h-4 w-4" />, dimensions: '50 × 30 مم' },
};

export const PrintOptionsDialog = ({
    open,
    onOpenChange,
    selectedCount,
    onPrint,
}: PrintOptionsDialogProps) => {
    const [printType, setPrintType] = useState<PrintType>('bulk-separate');
    const [paperSize, setPaperSize] = useState<PaperSize>('thermal-100x150');
    const [orientation, setOrientation] = useState<Orientation>('portrait');

    const handlePrint = () => {
        onPrint(printType, paperSize, orientation);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent dir="rtl" className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden border-0 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-l from-blue-600 to-blue-700 px-6 py-4 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-white flex items-center gap-3">
                            <Printer className="h-5 w-5" />
                            خيارات الطباعة
                            <Badge className="bg-white/20 text-white text-xs mr-2">
                                {selectedCount} طلب
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto flex-1">
                    {/* نوع الطباعة */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                            نوع البوليصة
                        </Label>
                        <RadioGroup 
                            value={printType} 
                            onValueChange={(v) => {
                                setPrintType(v as PrintType);
                                // Reset paper size based on type
                                if (v === 'thermal' || v === 'bulk-separate' || v === 'bulk-single') {
                                    setPaperSize('thermal-100x150');
                                } else {
                                    setPaperSize('a4');
                                }
                            }} 
                            className="grid grid-cols-2 gap-3"
                        >
                            {/* طباعة مجمعة - تبويبات منفصلة */}
                            <label 
                                className={cn(
                                    "group relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                                    printType === 'bulk-separate' 
                                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 shadow-lg shadow-blue-200/50" 
                                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 dark:border-gray-700"
                                )}
                            >
                                <RadioGroupItem value="bulk-separate" className="sr-only" />
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                                    printType === 'bulk-separate' 
                                        ? "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-300/50" 
                                        : "bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200"
                                )}>
                                    <Layers className={cn("h-7 w-7 transition-colors", printType === 'bulk-separate' ? "text-white" : "text-blue-600")} />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-sm block text-gray-900 dark:text-gray-100">طباعة مجمعة</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 block">تبويب لكل طلب</span>
                                </div>
                                {printType === 'bulk-separate' && (
                                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </label>

                            {/* طباعة مجمعة - نافذة واحدة */}
                            <label 
                                className={cn(
                                    "group relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                                    printType === 'bulk-single' 
                                        ? "border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 shadow-lg shadow-orange-200/50" 
                                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 dark:border-gray-700"
                                )}
                            >
                                <RadioGroupItem value="bulk-single" className="sr-only" />
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                                    printType === 'bulk-single' 
                                        ? "bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-300/50" 
                                        : "bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200"
                                )}>
                                    <Copy className={cn("h-7 w-7 transition-colors", printType === 'bulk-single' ? "text-white" : "text-orange-600")} />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-sm block text-gray-900 dark:text-gray-100">طباعة موحدة</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 block">نافذة واحدة</span>
                                </div>
                                {printType === 'bulk-single' && (
                                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </label>
                            
                            {/* بوليصة عادية */}
                            <label 
                                className={cn(
                                    "group relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                                    printType === 'pdf' 
                                        ? "border-red-500 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/40 dark:to-pink-950/40 shadow-lg shadow-red-200/50" 
                                        : "border-gray-200 hover:border-red-300 hover:bg-red-50/30 dark:border-gray-700"
                                )}
                            >
                                <RadioGroupItem value="pdf" className="sr-only" />
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                                    printType === 'pdf' 
                                        ? "bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-300/50" 
                                        : "bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200"
                                )}>
                                    <FileText className={cn("h-7 w-7 transition-colors", printType === 'pdf' ? "text-white" : "text-red-600")} />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-sm block text-gray-900 dark:text-gray-100">بوليصة عادية</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 block">طلب واحد</span>
                                </div>
                                {printType === 'pdf' && (
                                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </label>

                            {/* ملصق حراري */}
                            <label 
                                className={cn(
                                    "group relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                                    printType === 'thermal' 
                                        ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 shadow-lg shadow-emerald-200/50" 
                                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-gray-700"
                                )}
                            >
                                <RadioGroupItem value="thermal" className="sr-only" />
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                                    printType === 'thermal' 
                                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-300/50" 
                                        : "bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200"
                                )}>
                                    <Tag className={cn("h-7 w-7 transition-colors", printType === 'thermal' ? "text-white" : "text-emerald-600")} />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-sm block text-gray-900 dark:text-gray-100">ملصق حراري</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 block">طلب واحد</span>
                                </div>
                                {printType === 'thermal' && (
                                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </label>

                            {/* بوليصة ملونة */}
                            <label 
                                className={cn(
                                    "group relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                                    printType === 'colored' 
                                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 shadow-lg shadow-purple-200/50" 
                                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 dark:border-gray-700"
                                )}
                            >
                                <RadioGroupItem value="colored" className="sr-only" />
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                                    printType === 'colored' 
                                        ? "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 shadow-lg shadow-purple-300/50" 
                                        : "bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200"
                                )}>
                                    <Maximize2 className={cn("h-7 w-7 transition-colors", printType === 'colored' ? "text-white" : "text-purple-600")} />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-sm block text-gray-900 dark:text-gray-100">بوليصة ملونة</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 block">طلب واحد</span>
                                </div>
                                {printType === 'colored' && (
                                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </label>
                        </RadioGroup>
                    </div>

                    {/* حجم الورق */}
                    <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <CardContent className="p-5 space-y-3 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <Label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-600" />
                                حجم الورق
                            </Label>
                            
                            {(printType === 'thermal' || printType === 'bulk-separate' || printType === 'bulk-single') ? (
                                <RadioGroup 
                                    value={paperSize} 
                                    onValueChange={(v) => setPaperSize(v as PaperSize)} 
                                    className="grid grid-cols-5 gap-2.5"
                                >
                                    {Object.entries(THERMAL_SIZES).map(([key, config]) => (
                                        <label 
                                            key={key}
                                            className={cn(
                                                "group flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105",
                                                paperSize === key 
                                                    ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 shadow-md" 
                                                    : "border-gray-200 hover:border-emerald-300 dark:border-gray-700"
                                            )}
                                        >
                                            <RadioGroupItem value={key} className="sr-only" />
                                            <div className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                                                paperSize === key 
                                                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md" 
                                                    : "bg-gray-100 text-gray-600 group-hover:bg-emerald-100 dark:bg-gray-800 dark:text-gray-400"
                                            )}>
                                                {config.icon}
                                            </div>
                                            <span className={cn("font-bold text-xs", paperSize === key ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300")}>{config.label}</span>
                                            <span className="text-[9px] text-gray-500 dark:text-gray-400">{config.dimensions}</span>
                                        </label>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <RadioGroup 
                                    value={paperSize} 
                                    onValueChange={(v) => setPaperSize(v as PaperSize)} 
                                    className="grid grid-cols-2 gap-3"
                                >
                                    {Object.entries(STANDARD_SIZES).map(([key, config]) => (
                                        <label 
                                            key={key}
                                            className={cn(
                                                "group flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                                                paperSize === key 
                                                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 shadow-md" 
                                                    : "border-gray-200 hover:border-blue-300 dark:border-gray-700"
                                            )}
                                        >
                                            <RadioGroupItem value={key} className="sr-only" />
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                                paperSize === key 
                                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
                                                    : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-400"
                                            )}>
                                                {config.icon}
                                            </div>
                                            <div>
                                                <span className={cn("font-bold text-sm block", paperSize === key ? "text-blue-700 dark:text-blue-400" : "text-gray-800 dark:text-gray-200")}>{config.label}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{config.dimensions}</span>
                                            </div>
                                        </label>
                                    ))}
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>

                    {/* الاتجاه - لجميع الأنواع */}
                    <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <CardContent className="p-5 space-y-3 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <Label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600" />
                                اتجاه الصفحة
                            </Label>
                            <RadioGroup 
                                value={orientation} 
                                onValueChange={(v) => setOrientation(v as Orientation)} 
                                className="grid grid-cols-2 gap-3"
                            >
                                <label 
                                    className={cn(
                                        "group flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                                        orientation === 'portrait' 
                                            ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 shadow-md" 
                                            : "border-gray-200 hover:border-violet-300 dark:border-gray-700"
                                    )}
                                >
                                    <RadioGroupItem value="portrait" className="sr-only" />
                                    <div className={cn(
                                        "w-10 h-12 rounded-lg border-2 flex items-center justify-center transition-all",
                                        orientation === 'portrait' 
                                            ? "border-violet-500 bg-violet-100 dark:bg-violet-900/30" 
                                            : "border-gray-300 bg-gray-50 group-hover:bg-violet-50 dark:bg-gray-800 dark:border-gray-600"
                                    )}>
                                        <div className={cn(
                                            "w-5 h-7 rounded-sm transition-colors",
                                            orientation === 'portrait' 
                                                ? "bg-gradient-to-br from-violet-500 to-purple-600" 
                                                : "bg-gray-300 dark:bg-gray-600"
                                        )} />
                                    </div>
                                    <div>
                                        <span className={cn("font-bold text-sm block", orientation === 'portrait' ? "text-violet-700 dark:text-violet-400" : "text-gray-800 dark:text-gray-200")}>عمودي</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Portrait</span>
                                    </div>
                                </label>
                                
                                <label 
                                    className={cn(
                                        "group flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                                        orientation === 'landscape' 
                                            ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 shadow-md" 
                                            : "border-gray-200 hover:border-violet-300 dark:border-gray-700"
                                    )}
                                >
                                    <RadioGroupItem value="landscape" className="sr-only" />
                                    <div className={cn(
                                        "w-12 h-10 rounded-lg border-2 flex items-center justify-center transition-all",
                                        orientation === 'landscape' 
                                            ? "border-violet-500 bg-violet-100 dark:bg-violet-900/30" 
                                            : "border-gray-300 bg-gray-50 group-hover:bg-violet-50 dark:bg-gray-800 dark:border-gray-600"
                                    )}>
                                        <div className={cn(
                                            "w-7 h-5 rounded-sm transition-colors",
                                            orientation === 'landscape' 
                                                ? "bg-gradient-to-br from-violet-500 to-purple-600" 
                                                : "bg-gray-300 dark:bg-gray-600"
                                        )} />
                                    </div>
                                    <div>
                                        <span className={cn("font-bold text-sm block", orientation === 'landscape' ? "text-violet-700 dark:text-violet-400" : "text-gray-800 dark:text-gray-200")}>أفقي</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Landscape</span>
                                    </div>
                                </label>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* معلومات الطباعة المجمعة */}
                    {(printType === 'bulk-separate' || printType === 'bulk-single') && (
                        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                        <Layers className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-blue-800 dark:text-blue-300">
                                            {printType === 'bulk-separate' ? 'طباعة مجمعة - تبويبات منفصلة' : 'طباعة موحدة - نافذة واحدة'}
                                        </h4>
                                        <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                            {printType === 'bulk-separate' ? (
                                                <>
                                                    <p>• سيتم فتح تبويب منفصل لكل طلب ({selectedCount} تبويب)</p>
                                                    <p>• يمكنك طباعة كل ملصق بشكل منفصل</p>
                                                    <p>• تأكد من السماح بالنوافذ المنبثقة في المتصفح</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>• سيتم جمع جميع الملصقات في نافذة واحدة</p>
                                                    <p>• طباعة سريعة لجميع الطلبات ({selectedCount} ملصق)</p>
                                                    <p>• مناسب للطباعة المتتالية</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700 shrink-0">
                    <DialogClose asChild>
                        <Button variant="ghost" size="sm" className="gap-2 h-10 hover:bg-white/80 dark:hover:bg-gray-800">
                            <X className="h-4 w-4" />
                            إلغاء
                        </Button>
                    </DialogClose>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline"
                            size="sm"
                            className="gap-2 h-10 border-2 hover:bg-white dark:hover:bg-gray-800"
                            onClick={handlePrint}
                        >
                            <Eye className="h-4 w-4" />
                            معاينة
                        </Button>
                        <Button 
                            onClick={handlePrint} 
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2 h-10 px-6 shadow-lg shadow-blue-500/30"
                            size="sm"
                        >
                            <Printer className="h-4 w-4" />
                            <span className="font-bold">طباعة الآن</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
