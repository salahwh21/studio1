import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Printer, X, FileText, Check, LayoutTemplate, Smartphone, RectangleVertical, RectangleHorizontal, Loader2 } from "lucide-react";
import { Order } from "@/components/orders-table/types";
import { Separator } from "@/components/ui/separator"; // تمت الإضافة
import { cn } from "@/lib/utils";
import { createThermalLabelHtml, createStandardPolicyHtml } from '@/services/pdf-templates';

interface PrintDialogUnifiedProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orders: Order[];
    onClose?: () => void;
}

type PolicyType = 'thermal' | 'standard' | 'colored';
type Orientation = 'portrait' | 'landscape';

const POLICY_TYPES = {
    thermal: {
        id: 'thermal',
        label: 'ملصق حراري',
        subLabel: '10×15 سم',
        description: 'للطابعات الحرارية (Zebra/Xprinter)',
        icon: Smartphone, // تشبه شكل الملصق الصغير
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        defaultDims: { w: 100, h: 150 }
    },
    standard: {
        id: 'standard',
        label: 'بوليصة قياسية',
        subLabel: 'A4',
        description: 'للطابعات العادية (Laser/Inkjet)',
        icon: FileText,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        defaultDims: { w: 210, h: 297 }
    },
    colored: {
        id: 'colored',
        label: 'بوليصة ملونة',
        subLabel: 'A4',
        description: 'تصميم احترافي ملون للعملاء',
        icon: LayoutTemplate,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        defaultDims: { w: 210, h: 297 }
    }
};

export const PrintDialogUnified = ({ open, onOpenChange, orders, onClose }: PrintDialogUnifiedProps) => {
    const [policyType, setPolicyType] = useState<PolicyType>('standard');
    const [orientation, setOrientation] = useState<Orientation>('portrait');
    const [isLoading, setIsLoading] = useState(false);

    const getDimensions = () => {
        const base = POLICY_TYPES[policyType].defaultDims;
        // إذا كان أفقي، نعكس الأبعاد
        if (orientation === 'landscape') {
            return { width: base.h, height: base.w };
        }
        return { width: base.w, height: base.h };
    };

    const generatePrintHtml = () => {
        const dims = getDimensions();
        const htmlParts = orders.map(order => {
            const commonData = {
                companyName: 'الوميض',
                orderNumber: order.orderNumber,
                recipient: order.recipient,
                phone: order.phone,
                address: `${order.city || ''} - ${order.region || ''}`,
                cod: order.cod,
                barcode: String(order.orderNumber),
                city: order.city || 'غير محدد',
                region: order.region || 'غير محدد',
                merchant: order.merchant || 'التاجر',
                date: new Date().toISOString().split('T')[0],
                notes: `(عدد الطرود: 1)`
            };

            if (policyType === 'thermal') {
                return createThermalLabelHtml(commonData, dims);
            } else {
                return createStandardPolicyHtml(commonData, dims);
            }
        });

        return htmlParts.join('<div style="page-break-after: always;"></div>');
    };

    // فتح نافذة منبثقة (Popup Window) وليس لسان جديد
    const handlePopupPrint = () => {
        if (orders.length === 0) return;
        setIsLoading(true);

        setTimeout(() => {
            try {
                const dims = getDimensions();
                const fullHtml = generatePrintHtml();
                const filename = `orders_${Date.now()}.pdf`;

                // 1. فتح نافذة فارغة أولاً
                // نحدد الأبعاد لتكون نافذة منبثقة محترمة
                const windowName = `pdf_window_${Date.now()}`;
                const width = 1000;
                const height = 800;
                const left = (window.screen.width - width) / 2;
                const top = (window.screen.height - height) / 2;

                window.open(
                    '',
                    windowName,
                    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
                );

                // 2. إرسال النموذج لتلك النافذة
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/api/pdf-playwright?mode=inline';
                form.target = windowName; // نوجه النموذج للنافذة التي فتحناها للتو
                form.style.display = 'none';

                const addField = (name: string, value: string | number) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = String(value);
                    form.appendChild(input);
                };

                addField('html', fullHtml);
                addField('filename', filename);
                addField('width', dims.width);
                addField('height', dims.height);

                document.body.appendChild(form);
                form.submit();

                // تنظيف وإغلاق نافذة الخيارات
                setTimeout(() => {
                    document.body.removeChild(form);
                    setIsLoading(false);
                    onOpenChange(false);
                }, 500);

            } catch (error) {
                console.error('Popup Print Error:', error);
                setIsLoading(false);
            }
        }, 100);
    };

    const handleClose = () => {
        onOpenChange(false);
        if (onClose) onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-xl" dir="rtl">
                <DialogTitle className="sr-only">إعدادات الطباعة</DialogTitle>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                            <Printer className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">خيارات الطباعة</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                تجهيز {orders.length} طلب للطباعة
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-slate-200">
                        <X className="w-6 h-6 text-slate-500" />
                    </Button>
                </div>

                <div className="p-8 space-y-8">
                    {/* القسم الأول: نوع الورق والحجم */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                            نوع الورق والقياس
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(Object.entries(POLICY_TYPES) as [PolicyType, typeof POLICY_TYPES[keyof typeof POLICY_TYPES]][]).map(([key, info]) => (
                                <div
                                    key={key}
                                    onClick={() => setPolicyType(key)}
                                    className={cn(
                                        "relative cursor-pointer rounded-xl border-2 p-5 flex flex-col gap-3 transition-all duration-200",
                                        policyType === key
                                            ? `${info.border} ${info.bg} ring-1 ring-offset-2 ring-blue-500 shadow-md`
                                            : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className={cn("p-2.5 rounded-lg", policyType === key ? "bg-white/80" : "bg-slate-100")}>
                                            <info.icon className={cn("w-6 h-6", info.color)} />
                                        </div>
                                        {policyType === key && (
                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-slate-900">{info.label}</span>
                                        </div>
                                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-white border border-slate-200 text-slate-600 mb-2">
                                            {info.subLabel}
                                        </span>
                                        <p className="text-xs text-slate-500 leading-relaxed">{info.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* القسم الثاني: الاتجاه */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                            اتجاه الطباعة
                        </h3>
                        <div className="grid grid-cols-2 gap-4 max-w-lg">
                            <div
                                onClick={() => setOrientation('portrait')}
                                className={cn(
                                    "cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition-all",
                                    orientation === 'portrait'
                                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-500"
                                        : "border-slate-200 hover:border-slate-300 bg-white"
                                )}
                            >
                                <div className={cn("p-2 rounded-lg", orientation === 'portrait' ? "bg-white text-blue-600" : "bg-slate-100 text-slate-500")}>
                                    <RectangleVertical className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="font-bold block text-sm">عامودي (Portrait)</span>
                                    <span className="text-xs text-slate-500">الوضع الافتراضي</span>
                                </div>
                                {orientation === 'portrait' && <Check className="w-5 h-5 text-blue-600 mr-auto" />}
                            </div>

                            <div
                                onClick={() => setOrientation('landscape')}
                                className={cn(
                                    "cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition-all",
                                    orientation === 'landscape'
                                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-500"
                                        : "border-slate-200 hover:border-slate-300 bg-white"
                                )}
                            >
                                <div className={cn("p-2 rounded-lg", orientation === 'landscape' ? "bg-white text-blue-600" : "bg-slate-100 text-slate-500")}>
                                    <RectangleHorizontal className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="font-bold block text-sm">أفقي (Landscape)</span>
                                    <span className="text-xs text-slate-500">للمحتويات العريضة</span>
                                </div>
                                {orientation === 'landscape' && <Check className="w-5 h-5 text-blue-600 mr-auto" />}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
                    <Button variant="outline" size="lg" onClick={handleClose} className="px-6">إلغاء</Button>
                    <Button
                        onClick={handlePopupPrint}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 gap-2 shadow-lg shadow-blue-200"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                        طباعة في نافذة جديدة
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
