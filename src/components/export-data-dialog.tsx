'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
    Download,
    ArrowRight,
    ArrowLeft,
    ChevronsUp,
    ChevronUp,
    ChevronDown,
    ChevronsDown,
    FileSpreadsheet,
    Table2,
    Save,
    X,
    CheckCircle2,
    Plus,
    Minus,
    FileText,
    Eye
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { type Order } from '@/store/orders-store';
import { exportToExcel } from '@/lib/export-utils';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export type ColumnConfig = {
    key: keyof Order | 'id-link' | 'notes' | 'companyDue';
    label: string;
    type?: 'default' | 'financial' | 'admin_financial';
    sortable?: boolean
};

interface ExportDataDialogProps {
    open: boolean;
    onOpenChange: (isOpen: boolean) => void;
    allColumns: ColumnConfig[];
    initialVisibleColumns: ColumnConfig[];
    ordersToExport: Order[];
}

interface SavedTemplate {
    id: string;
    name: string;
    settings: any;
    html?: string;
}

export const ExportDataDialog = ({
    open,
    onOpenChange,
    allColumns,
    initialVisibleColumns,
    ordersToExport,
}: ExportDataDialogProps) => {
    const { toast } = useToast();
    const { formatDate, formatCurrency, settings } = useSettings();
    const companyName = settings?.login?.companyName || '';
    const companyLogo = (settings as any)?.login?.companyLogo || (settings as any)?.printing?.logoUrl || '';
    const [exportPurpose, setExportPurpose] = useState('all_data');
    const [fileFormat, setFileFormat] = useState('csv');
    const [isExporting, setIsExporting] = useState(false);

    const [availableFields, setAvailableFields] = useState<ColumnConfig[]>([]);
    const [exportedFields, setExportedFields] = useState<ColumnConfig[]>([]);
    const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
    const [selectedExported, setSelectedExported] = useState<string[]>([]);

    // القوالب المحفوظة من قسم التقارير والجداول
    const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);


    const EXPORT_FIELDS_KEY = 'ordersExportFieldsSettings';

    useEffect(() => {
        if (open) {
            const savedFieldsJson = localStorage.getItem(EXPORT_FIELDS_KEY);
            if (savedFieldsJson) {
                const savedFieldKeys: string[] = JSON.parse(savedFieldsJson);
                const savedExportedFields = savedFieldKeys.map((key: string) => allColumns.find(c => c.key === key)).filter((c): c is ColumnConfig => !!c);
                const savedAvailableFields = allColumns.filter(col => !savedFieldKeys.includes(col.key));
                setExportedFields(savedExportedFields);
                setAvailableFields(savedAvailableFields);
            } else {
                setExportedFields(initialVisibleColumns);
                setAvailableFields(allColumns.filter(c => !initialVisibleColumns.some(vc => vc.key === c.key)));
            }

            // تحميل قوالب التقارير المحفوظة
            loadReportTemplates();
        }
    }, [open, allColumns, initialVisibleColumns]);

    // تحميل قوالب التقارير والجداول المحفوظة
    const loadReportTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            // جلب قوالب التقارير فقط (documentType=report)
            const response = await fetch('/api/saved-templates?documentType=report');
            if (response.ok) {
                const data = await response.json();
                const templates = data.templates || [];
                setSavedTemplates(templates);
                if (templates.length > 0 && !selectedTemplate) {
                    setSelectedTemplate(templates[0]);
                }
            }
        } catch (error) {
            console.error('Error loading report templates:', error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSaveFields = () => {
        const fieldKeys = exportedFields.map(f => f.key);
        localStorage.setItem(EXPORT_FIELDS_KEY, JSON.stringify(fieldKeys));
        toast({ title: "تم الحفظ", description: "تم حفظ قائمة الحقول المصدرة." });
    };

    const handleFieldClick = (key: string, list: 'available' | 'exported') => {
        const selector = list === 'available' ? setSelectedAvailable : setSelectedExported;
        selector(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleMove = (direction: 'add' | 'remove' | 'add_all' | 'remove_all') => {
        if (direction === 'add') {
            const toMove = availableFields.filter(f => selectedAvailable.includes(f.key));
            setExportedFields(prev => [...prev, ...toMove]);
            setAvailableFields(prev => prev.filter(f => !selectedAvailable.includes(f.key)));
            setSelectedAvailable([]);
        } else if (direction === 'remove') {
            const toMove = exportedFields.filter(f => selectedExported.includes(f.key));
            setAvailableFields(prev => [...prev, ...toMove]);
            setExportedFields(prev => prev.filter(f => !selectedExported.includes(f.key)));
            setSelectedExported([]);
        } else if (direction === 'add_all') {
            setExportedFields(allColumns);
            setAvailableFields([]);
        } else if (direction === 'remove_all') {
            setAvailableFields(allColumns);
            setExportedFields([]);
        }
    };

    const handleReorder = (direction: 'up' | 'down' | 'top' | 'bottom') => {
        if (selectedExported.length !== 1) return;
        const id = selectedExported[0];
        const currentIndex = exportedFields.findIndex(f => f.key === id);
        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        if (direction === 'up' && currentIndex > 0) newIndex = currentIndex - 1;
        if (direction === 'down' && currentIndex < exportedFields.length - 1) newIndex = currentIndex + 1;
        if (direction === 'top') newIndex = 0;
        if (direction === 'bottom') newIndex = exportedFields.length - 1;

        if (newIndex !== currentIndex) {
            setExportedFields(prev => {
                const newArray = [...prev];
                const [item] = newArray.splice(currentIndex, 1);
                newArray.splice(newIndex, 0, item);
                return newArray;
            });
        }
    }

    const handlePdfPreview = async () => {
        const fieldsToExport = getFieldsToExport();

        // استخدام إعدادات القالب المختار إذا وجد
        const templateSettings = selectedTemplate?.settings || {};
        const orientation = templateSettings.size?.includes('landscape') ? 'landscape' : 'portrait';

        // إرسال للـ API مع دعم القوالب
        const response = await fetch('/api/pdf-playwright', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: selectedTemplate?.id,  // إرسال ID القالب المختار
                templateType: 'report',
                data: {
                    orders: ordersToExport,
                    fields: fieldsToExport,
                    purpose: exportPurpose,
                    companyName,
                    companyLogo
                },
                options: {
                    format: templateSettings.size?.includes('a5') ? 'A5' : 'A4',
                    orientation: orientation,
                    filename: `orders_export_${new Date().toISOString().split('T')[0]}.pdf`,
                    ...templateSettings  // دمج إعدادات القالب
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || 'فشل في إنشاء PDF');
        }

        // فتح PDF في popup window
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // إعدادات popup window
        const windowWidth = 900;
        const windowHeight = 700;
        const left = (window.screen.width - windowWidth) / 2;
        const top = (window.screen.height - windowHeight) / 2;

        // فتح popup مع toolbar كامل
        window.open(
            pdfUrl,
            `pdf_export_${Date.now()}`,
            `width=${windowWidth},height=${windowHeight},top=${top},left=${left},scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes,location=yes`
        );

        // تنظيف الذاكرة
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 120000);
        toast({ title: "تم التصدير", description: `تم تصدير ${ordersToExport.length} سجل بنجاح` });
    };

    const handlePdfDownload = async () => {
        const fieldsToExport = getFieldsToExport();

        // استخدام إعدادات القالب المختار إذا وجد
        const templateSettings = selectedTemplate?.settings || {};
        const orientation = templateSettings.size?.includes('landscape') ? 'landscape' : 'portrait';

        // إرسال للـ API مع دعم القوالب
        const response = await fetch('/api/pdf-playwright', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: selectedTemplate?.id,
                templateType: 'report',
                data: {
                    orders: ordersToExport,
                    fields: fieldsToExport,
                    purpose: exportPurpose,
                    companyName,
                    companyLogo
                },
                options: {
                    format: templateSettings.size?.includes('a5') ? 'A5' : 'A4',
                    orientation: orientation,
                    filename: `orders_export_${new Date().toISOString().split('T')[0]}.pdf`,
                    ...templateSettings
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || 'فشل في إنشاء PDF');
        }

        // تحميل مباشر
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);

        toast({ title: "تم التحميل", description: `تم تحميل ${ordersToExport.length} سجل بنجاح` });
    };

    const getFieldsToExport = () => {
        if (exportPurpose === 'update_data') {
            // للتحديث: حقول أساسية فقط (ID + حقول قابلة للتعديل)
            const updateFields = exportedFields.filter(field =>
                ['id', 'recipient', 'phone', 'address', 'city', 'region', 'cod', 'status', 'notes'].includes(field.key as string)
            );
            return updateFields.length > 0 ? updateFields : exportedFields.slice(0, 5); // fallback للحقول الأولى
        }
        // للتصدير الكامل: جميع الحقول المختارة
        return exportedFields;
    };

    const handleExport = async () => {
        setIsExporting(true);

        try {
            const fieldsToExport = getFieldsToExport();
            const headers = fieldsToExport.map(field => field.label);
            const dataRows = ordersToExport.map(order => {
                return fieldsToExport.map(field => {
                    return order[field.key as keyof Order] ?? '';
                });
            });

            if (fileFormat === 'csv') {
                const csvData = Papa.unparse([headers, ...dataRows]);
                const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', 'orders_export.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({ title: "تم التصدير", description: `تم تصدير ${ordersToExport.length} سجل بنجاح` });
            } else if (fileFormat === 'excel') {
                const dataObjects = dataRows.map(row => {
                    const obj: Record<string, any> = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                });
                await exportToExcel(dataObjects, 'orders_export.xlsx', 'Orders');
                toast({ title: "تم التصدير", description: `تم تصدير ${ordersToExport.length} سجل بنجاح` });
            } else if (fileFormat === 'pdf') {
                await handlePdfPreview();
            } else {
                toast({ variant: 'destructive', title: 'غير متوفر', description: 'صيغة الملف المحددة غير مدعومة حاليًا.' });
            }
        } catch (error) {
            console.error('Export error:', error);
            toast({ variant: 'destructive', title: 'فشل التصدير', description: 'حدث خطأ أثناء التصدير' });
        } finally {
            // إيقاف loading فوراً للـ CSV و Excel، تأخير قصير للـ PDF
            if (fileFormat === 'pdf') {
                setTimeout(() => setIsExporting(false), 500);
            } else {
                setIsExporting(false);
            }
        }
    }

    const handleDownload = async () => {
        setIsExporting(true);

        try {
            if (fileFormat === 'pdf') {
                await handlePdfDownload();
            } else {
                // للـ CSV و Excel نفس العملية
                await handleExport();
                return;
            }
        } catch (error) {
            console.error('Download error:', error);
            toast({ variant: 'destructive', title: 'فشل التحميل', description: 'حدث خطأ أثناء التحميل' });
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={isExporting ? undefined : onOpenChange}>
            <DialogContent dir="rtl" className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden border-0 shadow-2xl flex flex-col">
                {/* Header with gradient */}
                <div className="bg-gradient-to-l from-primary/90 to-primary px-6 py-4 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-white flex items-center gap-3">
                            <FileSpreadsheet className={cn("h-5 w-5", isExporting && "animate-pulse")} />
                            {isExporting ? "جاري تحضير التصدير..." : "تصدير البيانات"}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <ScrollArea className="flex-1 overflow-auto">
                    <div className="p-4 space-y-4">
                        {/* Top Section - Compact Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Export Purpose & Format in one row */}
                            <Card className="border hover:border-primary/30 transition-colors">
                                <CardContent className="p-3 space-y-3">
                                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                        <Table2 className="h-4 w-4" />
                                        <span>نوع التصدير</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <label
                                            className={cn(
                                                "flex-1 flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm",
                                                exportPurpose === 'all_data'
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-primary/30",
                                                isExporting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                                    exportPurpose === 'all_data'
                                                        ? "border-primary bg-primary"
                                                        : "border-muted-foreground bg-transparent"
                                                )}
                                                onClick={() => !isExporting && setExportPurpose('all_data')}
                                            >
                                                {exportPurpose === 'all_data' && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <input
                                                type="radio"
                                                name="exportPurpose"
                                                value="all_data"
                                                checked={exportPurpose === 'all_data'}
                                                onChange={() => { }}
                                                className="sr-only"
                                            />
                                            <span className="font-medium">تصدير كافة البيانات</span>
                                            <div className="text-xs text-muted-foreground mt-1">جميع الحقول المختارة</div>
                                        </label>
                                        <label
                                            className={cn(
                                                "flex-1 flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm",
                                                exportPurpose === 'update_data'
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-primary/30",
                                                isExporting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                                    exportPurpose === 'update_data'
                                                        ? "border-primary bg-primary"
                                                        : "border-muted-foreground bg-transparent"
                                                )}
                                                onClick={() => !isExporting && setExportPurpose('update_data')}
                                            >
                                                {exportPurpose === 'update_data' && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <input
                                                type="radio"
                                                name="exportPurpose"
                                                value="update_data"
                                                checked={exportPurpose === 'update_data'}
                                                onChange={() => { }}
                                                className="sr-only"
                                            />
                                            <span className="font-medium">تحديث البيانات</span>
                                            <div className="text-xs text-muted-foreground mt-1">الحقول الأساسية فقط</div>
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* File Format - Compact */}
                            <Card className="border hover:border-primary/30 transition-colors">
                                <CardContent className="p-3 space-y-3">
                                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                        <FileSpreadsheet className="h-4 w-4" />
                                        <span>صيغة الملف</span>
                                    </div>
                                    <RadioGroup
                                        value={fileFormat}
                                        onValueChange={isExporting ? undefined : setFileFormat}
                                        className="flex gap-2"
                                    >
                                        <label
                                            className={cn(
                                                "flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border cursor-pointer transition-all",
                                                fileFormat === 'excel'
                                                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                                                    : "border-muted hover:border-green-300",
                                                isExporting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <RadioGroupItem value="excel" id="f_excel" className="sr-only" disabled={isExporting} />
                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-xs">XLS</span>
                                            </div>
                                            <span className="font-medium text-xs">Excel</span>
                                        </label>
                                        <label
                                            className={cn(
                                                "flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border cursor-pointer transition-all",
                                                fileFormat === 'csv'
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                                    : "border-muted hover:border-blue-300",
                                                isExporting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <RadioGroupItem value="csv" id="f_csv" className="sr-only" disabled={isExporting} />
                                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-xs">CSV</span>
                                            </div>
                                            <span className="font-medium text-xs">CSV</span>
                                        </label>
                                        <label
                                            className={cn(
                                                "flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border cursor-pointer transition-all",
                                                fileFormat === 'pdf'
                                                    ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                                                    : "border-muted hover:border-red-300",
                                                isExporting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <RadioGroupItem value="pdf" id="f_pdf" className="sr-only" disabled={isExporting} />
                                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="font-medium text-xs">PDF</span>
                                        </label>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        </div>

                        {/* قسم اختيار القالب المحفوظ - يظهر فقط عند اختيار PDF */}
                        {fileFormat === 'pdf' && (
                            <Card className="border border-red-200 bg-red-50/50">
                                <CardContent className="p-3 space-y-3">
                                    <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                                        <FileText className="h-4 w-4" />
                                        <span>اختر قالب التقرير المحفوظ</span>
                                    </div>

                                    {isLoadingTemplates ? (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            جاري تحميل القوالب...
                                        </div>
                                    ) : savedTemplates.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                            {savedTemplates.map((template) => (
                                                <button
                                                    key={template.id}
                                                    onClick={() => setSelectedTemplate(template)}
                                                    disabled={isExporting}
                                                    className={cn(
                                                        "flex items-center justify-between p-2 rounded-lg border-2 transition-all text-right text-sm",
                                                        selectedTemplate?.id === template.id
                                                            ? "border-red-500 bg-white shadow-sm"
                                                            : "border-gray-200 bg-white hover:border-red-300",
                                                        isExporting && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className={cn(
                                                            "font-bold",
                                                            selectedTemplate?.id === template.id ? "text-red-600" : "text-gray-900"
                                                        )}>
                                                            {template.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500">
                                                            {template.settings?.size || 'A4'} • {template.settings?.orientation === 'landscape' ? 'أفقي' : 'عمودي'}
                                                        </span>
                                                    </div>
                                                    {selectedTemplate?.id === template.id && (
                                                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-3 border-2 border-dashed rounded-lg text-center">
                                            <p className="text-xs text-gray-500 mb-2">لا توجد قوالب تقارير محفوظة</p>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => window.open('/dashboard/reports/control-panel', '_blank')}
                                                className="text-red-600 font-bold text-xs"
                                            >
                                                اضغط لإنشاء قالب جديد
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Field Selector Section */}
                        <Card className="border">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        اختيار الحقول
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSaveFields}
                                        disabled={isExporting}
                                        className={cn(
                                            "gap-1 h-7 text-xs",
                                            isExporting && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Save className="h-3 w-3" />
                                        حفظ
                                    </Button>
                                </div>

                                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
                                    {/* Available Fields */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-medium flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                                الحقول المتاحة
                                            </Label>
                                            <Badge variant="secondary" className="text-[10px] h-5">
                                                {availableFields.length}
                                            </Badge>
                                        </div>
                                        <ScrollArea className="h-44 border rounded-lg bg-muted/30">
                                            <div className="p-1.5 space-y-0.5">
                                                {availableFields.map(field => (
                                                    <div
                                                        key={field.key}
                                                        onClick={() => handleFieldClick(field.key, 'available')}
                                                        className={cn(
                                                            "p-2 text-xs rounded cursor-pointer transition-all",
                                                            "hover:bg-background hover:shadow-sm",
                                                            selectedAvailable.includes(field.key) &&
                                                            "bg-primary/10 text-primary ring-1 ring-primary"
                                                        )}
                                                    >
                                                        {field.label}
                                                    </div>
                                                ))}
                                                {availableFields.length === 0 && (
                                                    <div className="text-center text-muted-foreground py-6 text-xs">
                                                        لا توجد حقول متاحة
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Control Buttons - Compact */}
                                    <div className="flex flex-col gap-1 justify-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMove('add')}
                                            disabled={selectedAvailable.length === 0 || isExporting}
                                            className={cn(
                                                "gap-1 h-7 text-xs px-2",
                                                isExporting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <Plus className="h-3 w-3" />
                                            <ArrowLeft className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleMove('remove')}
                                            disabled={selectedExported.length === 0 || isExporting}
                                            className={cn(
                                                "gap-1 h-7 text-xs px-2",
                                                isExporting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <ArrowRight className="h-3 w-3" />
                                            <Minus className="h-3 w-3" />
                                        </Button>

                                        <div className="border-t my-1" />

                                        <div className="grid grid-cols-2 gap-0.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleReorder('top')}
                                                disabled={selectedExported.length !== 1 || isExporting}
                                                className={cn(
                                                    "h-6 w-6",
                                                    isExporting && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <ChevronsUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleReorder('bottom')}
                                                disabled={selectedExported.length !== 1 || isExporting}
                                                className={cn(
                                                    "h-6 w-6",
                                                    isExporting && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <ChevronsDown className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleReorder('up')}
                                                disabled={selectedExported.length !== 1 || isExporting}
                                                className={cn(
                                                    "h-6 w-6",
                                                    isExporting && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleReorder('down')}
                                                disabled={selectedExported.length !== 1 || isExporting}
                                                className={cn(
                                                    "h-6 w-6",
                                                    isExporting && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="border-t my-1" />

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleMove('remove_all')}
                                            className={cn(
                                                "h-7 text-xs px-2",
                                                isExporting && "opacity-50 cursor-not-allowed"
                                            )}
                                            disabled={exportedFields.length === 0 || isExporting}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    {/* Exported Fields */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-medium flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                الحقول المراد تصديرها
                                            </Label>
                                            <Badge className="text-[10px] h-5 bg-primary">
                                                {exportedFields.length}
                                            </Badge>
                                        </div>
                                        <ScrollArea className="h-44 border border-primary/30 rounded-lg bg-primary/5">
                                            <div className="p-1.5 space-y-0.5">
                                                {exportedFields.map((field, index) => (
                                                    <div
                                                        key={field.key}
                                                        onClick={() => handleFieldClick(field.key, 'exported')}
                                                        className={cn(
                                                            "p-2 text-xs rounded cursor-pointer transition-all flex items-center gap-1.5",
                                                            "hover:bg-background hover:shadow-sm",
                                                            selectedExported.includes(field.key) &&
                                                            "bg-primary/20 text-primary ring-1 ring-primary"
                                                        )}
                                                    >
                                                        <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-medium">
                                                            {index + 1}
                                                        </span>
                                                        {field.label}
                                                    </div>
                                                ))}
                                                {exportedFields.length === 0 && (
                                                    <div className="text-center text-muted-foreground py-6 text-xs">
                                                        لم يتم اختيار حقول
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>

                {/* Footer - Fixed at bottom */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-t shrink-0">
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "gap-1 h-8",
                                isExporting && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={isExporting}
                        >
                            <X className="h-3 w-3" />
                            إغلاق
                        </Button>
                    </DialogClose>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                                {ordersToExport.length} سجل
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {exportedFields.length} حقل
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleDownload}
                                disabled={exportedFields.length === 0 || isExporting}
                                variant="outline"
                                className="gap-2 h-8"
                                size="sm"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                        جاري التحضير...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        تحميل مباشر
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleExport}
                                disabled={exportedFields.length === 0 || isExporting}
                                className="bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2 h-8"
                                size="sm"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                        جاري التحضير...
                                    </>
                                ) : (
                                    <>
                                        {fileFormat === 'pdf' ? <Eye className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                                        {fileFormat === 'pdf' ? 'طباعة ومعاينة' : 'تصدير'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};