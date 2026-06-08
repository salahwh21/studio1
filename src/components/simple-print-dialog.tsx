'use client';

import { useState, useEffect } from 'react';
import { Printer, X, Eye, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';
import { openPdfInNewTab } from '@/services/pdf-service';
import { createStandardPolicyHtml, createThermalLabelHtml } from '@/services/pdf-templates';


type PrintType = 'pdf' | 'colored' | 'thermal';
type PaperSize = 'a4' | 'a5' | '100x150' | '100x100' | '75x50' | '60x40' | '50x30';
type Orientation = 'portrait' | 'landscape';

interface SavedTemplate {
    id: string;
    name: string;
    settings: any;
    html?: string;
    paperSize?: string;
    orientation?: string;
}

interface SimplePrintDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    onPrint: (type: PrintType, size: PaperSize, orientation: Orientation) => void;
    orders?: any[];
}

const PAGE_SIZES: Record<PaperSize, { w: number; h: number }> = {
    'a4': { w: 210, h: 297 },
    'a5': { w: 148, h: 210 },
    '100x150': { w: 100, h: 150 },
    '100x100': { w: 100, h: 100 },
    '75x50': { w: 75, h: 50 },
    '60x40': { w: 60, h: 40 },
    '50x30': { w: 50, h: 30 }
};

export const SimplePrintDialog = ({
    open,
    onOpenChange,
    selectedCount,
    onPrint,
    orders = []
}: SimplePrintDialogProps) => {
    const [type, setType] = useState<PrintType>('thermal');
    const [size, setSize] = useState<PaperSize>('100x150');
    const [orientation, setOrientation] = useState<Orientation>('portrait');
    const [isGenerating, setIsGenerating] = useState(false);
    const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const { settings } = useSettings();
    const companyName = settings?.login?.companyName || 'شركة الشحن';

    // تحميل القوالب المحفوظة من قاعدة البيانات
    useEffect(() => {
        if (open) {
            loadSavedTemplates();
        }
    }, [open]);

    const loadSavedTemplates = async () => {
        setIsLoadingTemplates(true);
        setLoadError(null);
        try {
            // جلب قوالب البوالص فقط (documentType=policy)
            const response = await fetch('/api/saved-templates?documentType=policy');
            if (response.ok) {
                const data = await response.json();
                const templates = data.templates || [];
                setSavedTemplates(templates);

                if (templates.length > 0 && !selectedTemplate) {
                    setSelectedTemplate(templates[0]);
                }
            } else {
                setLoadError('فشل الاتصال بالـ API');
            }
        } catch (error) {
            console.error('Error loading templates:', error);
            setLoadError('خطأ في تحميل القوالب');
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    useEffect(() => {
        if (type === 'thermal' && ['a4', 'a5'].includes(size)) {
            setSize('100x150');
        } else if (type !== 'thermal' && !['a4', 'a5'].includes(size)) {
            setSize('a4');
        }
    }, [type, size]);

    const openPrintWindow = async () => {
        setIsGenerating(true);

        try {
            const dims = PAGE_SIZES[size];
            const isLandscape = orientation === 'landscape';
            const width = isLandscape ? dims.h : dims.w;
            const height = isLandscape ? dims.w : dims.h;

            // إذا كان هناك قالب محدد، استخدم HTML الخاص به
            if (selectedTemplate?.html) {
                // استخدام HTML القالب المحفوظ مع تعبئة بيانات الطلبات
                const templateHtml = selectedTemplate.html;
                const templateSettings = selectedTemplate.settings;

                // إنشاء HTML لكل طلب باستخدام قالب المصمم
                const allPoliciesHtml = orders.map((order) => {
                    let html = templateHtml;

                    const data: Record<string, string> = {
                        orderNumber: order.id || String(order.orderNumber) || '',
                        id: order.id || '',
                        sequence: String(order.orderNumber || ''),
                        recipient: order.recipient || '',
                        phone: order.phone || '',
                        address: order.address || '',
                        city: order.city || '',
                        region: order.region || '',
                        date: new Date(order.createdAt || Date.now()).toLocaleDateString('ar-SA'),
                        cod: String(order.cod || 0),
                        merchant: (typeof order.merchant === 'object' ? (order.merchant as any).name : order.merchant) || 'المتجر العام',
                        notes: order.notes || order.cod_notes || ''
                    };

                    // استبدال كافة المتغيرات {{key}} بقيمها الفعلية
                    Object.entries(data).forEach(([key, value]) => {
                        const regex = new RegExp(`{{${key}}}`, 'g');
                        html = html.replace(regex, value);
                    });

                    return html;
                });

                const combinedHtml = allPoliciesHtml.join('');
                await openPdfInNewTab(combinedHtml, `policies_${Date.now()}.pdf`, { width, height });
            } else if (savedTemplates.length > 0) {
                // إذا لم يكن هناك قالب محدد يدوياً ولكن يوجد قوالب، استخدم الأول
                const template = savedTemplates[0];
                const dims = PAGE_SIZES[size];
                const isLandscape = orientation === 'landscape';
                const width = isLandscape ? dims.h : dims.w;
                const height = isLandscape ? dims.w : dims.h;

                const allPoliciesHtml = orders.map((order) => {
                    let html = template.html || '';
                    const data: Record<string, string> = {
                        orderNumber: order.id || String(order.orderNumber) || '',
                        id: order.id || '',
                        sequence: String(order.orderNumber || ''),
                        recipient: order.recipient || '',
                        phone: order.phone || '',
                        address: order.address || '',
                        city: order.city || '',
                        region: order.region || '',
                        date: new Date(order.createdAt || Date.now()).toLocaleDateString('ar-SA'),
                        cod: String(order.cod || 0),
                        merchant: (typeof order.merchant === 'object' ? (order.merchant as any).name : order.merchant) || 'المتجر العام',
                        notes: order.notes || order.cod_notes || ''
                    };

                    Object.entries(data).forEach(([key, value]) => {
                        const regex = new RegExp(`{{${key}}}`, 'g');
                        html = html.replace(regex, value);
                    });
                    return html;
                });

                await openPdfInNewTab(allPoliciesHtml.join(''), `policies_${Date.now()}.pdf`, { width, height });
            } else {
                // Fallback to Standard/Default Generation using restored templates
                const dims = PAGE_SIZES[size];
                const isLandscape = orientation === 'landscape';
                const width = isLandscape ? dims.h : dims.w;
                const height = isLandscape ? dims.w : dims.h;

                const allPoliciesHtml = orders.map((order) => {
                    const policyData = {
                        companyName: companyName,
                        orderNumber: order.orderNumber || order.id,
                        recipient: order.recipient || '',
                        phone: order.phone || '',
                        address: order.address || '',
                        city: order.city || '',
                        region: order.region || '',
                        cod: parseFloat(order.cod || 0),
                        merchant: (typeof order.merchant === 'object' ? (order.merchant as any).name : order.merchant) || '',
                        date: new Date(order.createdAt || Date.now()).toLocaleDateString('ar-SA'),
                        notes: order.notes || order.cod_notes || '',
                        barcode: order.id
                    };

                    if (type === 'thermal') {
                        return createThermalLabelHtml(policyData, { width, height });
                    } else {
                        return createStandardPolicyHtml(policyData, { width, height });
                    }
                });

                await openPdfInNewTab(allPoliciesHtml.join(''), `policies_${Date.now()}.pdf`, { width, height });
            }


        } catch (error) {
            console.error('PDF Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في إنشاء PDF';
            alert(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };


    const downloadPdf = async () => {
        setIsGenerating(true);

        try {
            const dims = PAGE_SIZES[size];
            const isLandscape = orientation === 'landscape';
            const width = isLandscape ? dims.h : dims.w;
            const height = isLandscape ? dims.w : dims.h;

            let combinedHtml = '';

            // Re-evaluating: The function structure differs.
            // I will replace the guard clause with: "If no template, generate standard"

            let allPoliciesHtml: string[] = [];

            if (selectedTemplate?.html) {
                const templateHtml = selectedTemplate.html;
                allPoliciesHtml = orders.map((order) => {
                    let html = templateHtml;
                    const data: Record<string, string> = {
                        orderNumber: order.id || String(order.orderNumber) || '',
                        id: order.id || '',
                        sequence: String(order.orderNumber || ''),
                        recipient: order.recipient || '',
                        phone: order.phone || '',
                        address: order.address || '',
                        city: order.city || '',
                        region: order.region || '',
                        date: new Date(order.createdAt || Date.now()).toLocaleDateString('ar-SA'),
                        cod: String(order.cod || 0),
                        merchant: (typeof order.merchant === 'object' ? (order.merchant as any).name : order.merchant) || '',
                        notes: order.notes || order.cod_notes || ''
                    };
                    Object.entries(data).forEach(([key, value]) => {
                        const regex = new RegExp(`{{${key}}}`, 'g');
                        html = html.replace(regex, value);
                    });
                    return html;
                });
            } else {
                allPoliciesHtml = orders.map((order) => {
                    const policyData = {
                        companyName: companyName,
                        orderNumber: order.orderNumber || order.id,
                        recipient: order.recipient || '',
                        phone: order.phone || '',
                        address: order.address || '',
                        city: order.city || '',
                        region: order.region || '',
                        cod: parseFloat(order.cod || 0),
                        merchant: (typeof order.merchant === 'object' ? (order.merchant as any).name : order.merchant) || '',
                        date: new Date(order.createdAt || Date.now()).toLocaleDateString('ar-SA'),
                        notes: order.notes || order.cod_notes || '',
                        barcode: order.id
                    };

                    if (type === 'thermal') {
                        return createThermalLabelHtml(policyData, { width, height });
                    } else {
                        return createStandardPolicyHtml(policyData, { width, height });
                    }
                });
            }

            combinedHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>بوالص الشحن</title>
    <style>
        @page { size: ${width}mm ${height}mm; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Tahoma, sans-serif; }
        .page-break { page-break-after: always; }
        .page-break:last-child { page-break-after: auto; }
    </style>
</head>
<body>
    ${allPoliciesHtml.map((html) => `<div class="page-break">${html}</div>`).join('')}
</body>
</html>`;


            // استخدام API Playwright للتحميل (لأنها تحتاج Server-side)
            const response = await fetch('/api/pdf-playwright', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html: combinedHtml,
                    filename: `policies_${Date.now()}.pdf`,
                    width,
                    height
                })
            });

            if (!response.ok) {
                throw new Error('فشل في إنشاء PDF');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `policies_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 60000);

        } catch (error) {
            console.error('Download error:', error);
            const errorMessage = error instanceof Error ? error.message : 'فشل في تحميل الملف';
            alert(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };


    const handlePrint = async () => {
        try {
            // فتح popup window وانتظار انتهاء العملية
            await openPrintWindow();
            // إغلاق dialog فوراً بعد نجاح فتح popup
            onOpenChange(false);
        } catch (error) {
            console.error('Print error:', error);
            // في حالة الخطأ، لا نغلق dialog
        }
    };

    const sizes = type === 'thermal'
        ? ['100x150', '100x100', '75x50', '60x40', '50x30']
        : ['a4', 'a5'];

    return (
        <Dialog open={open} onOpenChange={isGenerating ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 gap-0 rounded-xl" style={{ direction: 'rtl' }}>
                <DialogTitle className="sr-only">طباعة البوالص</DialogTitle>
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
                    <div className="flex items-center gap-3 text-white">
                        <Printer className={cn("h-5 w-5", isGenerating && "animate-pulse")} />
                        <span className="font-bold">
                            {isGenerating ? "جاري تحضير الطباعة..." : "طباعة البوالص"}
                        </span>
                        <Badge className="bg-white/20 text-white">{selectedCount}</Badge>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={isGenerating}
                        className={cn(
                            "text-white/80 hover:text-white p-1 transition-all",
                            isGenerating && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* القوالب المحفوظة - هي المركز الآن */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                            اختر قالب الطباعة المحفوظ
                        </label>

                        {savedTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                                {savedTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            // محاولة استخراج الحجم والاتجاه من القالب تلقائياً إذا وجد
                                            if (template.settings?.paperSize) setSize(template.settings.paperSize as PaperSize);
                                            if (template.settings?.orientation) setOrientation(template.settings.orientation as Orientation);
                                        }}
                                        disabled={isGenerating}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border-2 transition-all text-right",
                                            selectedTemplate?.id === template.id
                                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                                : "border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-white",
                                            isGenerating && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "font-bold text-sm",
                                                selectedTemplate?.id === template.id ? "text-blue-700" : "text-gray-900"
                                            )}>
                                                {template.name}
                                            </span>
                                            <span className="text-[10px] text-gray-500 mt-0.5">
                                                {template.settings?.paperSize || 'حجم مخصص'} • {template.settings?.orientation === 'landscape' ? 'أفقي' : 'عمودي'}
                                            </span>
                                        </div>
                                        {selectedTemplate?.id === template.id && (
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 border-2 border-dashed rounded-xl text-center">
                                <p className="text-xs text-gray-500">لا توجد قوالب محفوظة حالياً</p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => window.open('/dashboard/reports/control-panel', '_blank')}
                                    className="text-blue-600 font-bold"
                                >
                                    اضغط لإنشاء قالبك الأول
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-4 border-t">
                    <Button
                        variant="outline"
                        onClick={downloadPdf}
                        disabled={isGenerating}
                        className="flex-1 gap-2"
                    >
                        <Download className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                        {isGenerating ? "جاري التحضير..." : "تحميل مباشر"}
                    </Button>
                    <Button
                        onClick={handlePrint}
                        disabled={isGenerating}
                        className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Eye className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                        {isGenerating ? "جاري التحضير..." : "طباعة ومعاينة"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};