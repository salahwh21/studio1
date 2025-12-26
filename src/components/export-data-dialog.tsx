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
    Printer
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { type Order } from '@/store/orders-store';
import { exportToExcel } from '@/lib/export-utils';
import { generatePdfViaBrowserPrint, downloadPdf, createThermalLabelPlaywright, createStandardPolicyPlaywright } from '@/services/pdf-service';

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
    isClient: boolean;
}

export const ExportDataDialog = ({
    open,
    onOpenChange,
    allColumns,
    initialVisibleColumns,
    ordersToExport,
    isClient,
}: ExportDataDialogProps) => {
    const { toast } = useToast();
    const { formatDate, formatCurrency } = useSettings();
    const [exportPurpose, setExportPurpose] = useState('all_data');
    const [fileFormat, setFileFormat] = useState('csv');

    const [availableFields, setAvailableFields] = useState<ColumnConfig[]>([]);
    const [exportedFields, setExportedFields] = useState<ColumnConfig[]>([]);
    const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
    const [selectedExported, setSelectedExported] = useState<string[]>([]);

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
        }
    }, [open, allColumns, initialVisibleColumns]);

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

    const handleExport = async () => {
        const headers = exportedFields.map(field => field.label);
        const dataRows = ordersToExport.map(order => {
            return exportedFields.map(field => {
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
            try {
                // إنشاء جدول باستخدام pdfmake مع دعم RTL
                const tableBody = [
                    // رأس الجدول
                    headers.map(header => ({
                        text: header,
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: '#1e3a5f',
                        color: '#ffffff',
                        bold: true
                    })),
                    // صفوف البيانات
                    ...dataRows.map(row => 
                        row.map(cell => ({
                            text: cell || '',
                            style: 'tableCell',
                            alignment: 'center'
                        }))
                    )
                ];

                // إنشاء HTML للجدول
                const tableHtml = `
                    <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                        <thead>
                            <tr style="background: #1e3a5f; color: white;">
                                ${headers.map(header => `<th style="padding: 8px; border: 1px solid #ddd; text-align: center;">${header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${ordersToExport.map((order, index) => `
                                <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${order.id}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${order.recipient}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${order.phone}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${order.address}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${order.city}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${order.status}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${formatCurrency(order.cod)}</td>
                                    <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${formatDate(order.date)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;

                const fullHtml = `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2>تصدير بيانات الطلبات</h2>
                        <p>التاريخ: ${formatDate(new Date(), { longFormat: true })}</p>
                    </div>
                    ${tableHtml}
                    <div style="text-align: center; margin-top: 20px; font-size: 8px;">
                        <p>عدد السجلات: ${ordersToExport.length}</p>
                        <p>تم إنشاء هذا التقرير بتاريخ ${new Date().toLocaleString('ar-SA')}</p>
                    </div>
                `;

                await generatePdfViaBrowserPrint(fullHtml, { filename: `orders_export_${new Date().toISOString().split('T')[0]}.pdf` });
                toast({ title: "تم التصدير", description: `تم تصدير ${ordersToExport.length} سجل بنجاح` });
            } catch (error) {
                console.error('PDF generation error:', error);
                toast({ variant: 'destructive', title: 'فشل التصدير', description: 'حدث خطأ أثناء إنشاء ملف PDF' });
            }
        } else {
            toast({ variant: 'destructive', title: 'غير متوفر', description: 'صيغة الملف المحددة غير مدعومة حاليًا.' });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent dir="rtl" className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden border-0 shadow-2xl flex flex-col">
                {/* Header with gradient */}
                <div className="bg-gradient-to-l from-primary/90 to-primary px-6 py-4 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-white flex items-center gap-3">
                            <FileSpreadsheet className="h-5 w-5" />
                            تصدير البيانات
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
                                    <RadioGroup 
                                        value={exportPurpose} 
                                        onValueChange={setExportPurpose} 
                                        className="flex gap-2"
                                    >
                                        <label 
                                            className={cn(
                                                "flex-1 flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm",
                                                exportPurpose === 'all_data' 
                                                    ? "border-primary bg-primary/5" 
                                                    : "border-muted hover:border-primary/30"
                                            )}
                                        >
                                            <RadioGroupItem value="all_data" id="r1_exp" />
                                            <span className="font-medium">تصدير كافة البيانات</span>
                                        </label>
                                        <label 
                                            className={cn(
                                                "flex-1 flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm",
                                                exportPurpose === 'update_data' 
                                                    ? "border-primary bg-primary/5" 
                                                    : "border-muted hover:border-primary/30"
                                            )}
                                        >
                                            <RadioGroupItem value="update_data" id="r2_exp" />
                                            <span className="font-medium">تحديث البيانات</span>
                                        </label>
                                    </RadioGroup>
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
                                        onValueChange={setFileFormat} 
                                        className="flex gap-2"
                                    >
                                        <label 
                                            className={cn(
                                                "flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-lg border cursor-pointer transition-all",
                                                fileFormat === 'excel' 
                                                    ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                                                    : "border-muted hover:border-green-300"
                                            )}
                                        >
                                            <RadioGroupItem value="excel" id="f_excel" className="sr-only" />
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
                                                    : "border-muted hover:border-blue-300"
                                            )}
                                        >
                                            <RadioGroupItem value="csv" id="f_csv" className="sr-only" />
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
                                                    : "border-muted hover:border-red-300"
                                            )}
                                        >
                                            <RadioGroupItem value="pdf" id="f_pdf" className="sr-only" />
                                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="font-medium text-xs">PDF</span>
                                        </label>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        </div>

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
                                        className="gap-1 h-7 text-xs"
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
                                            disabled={selectedAvailable.length === 0}
                                            className="gap-1 h-7 text-xs px-2"
                                        >
                                            <Plus className="h-3 w-3" />
                                            <ArrowLeft className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleMove('remove')} 
                                            disabled={selectedExported.length === 0}
                                            className="gap-1 h-7 text-xs px-2"
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
                                                disabled={selectedExported.length !== 1}
                                                className="h-6 w-6"
                                            >
                                                <ChevronsUp className="h-3 w-3" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleReorder('bottom')} 
                                                disabled={selectedExported.length !== 1}
                                                className="h-6 w-6"
                                            >
                                                <ChevronsDown className="h-3 w-3" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleReorder('up')} 
                                                disabled={selectedExported.length !== 1}
                                                className="h-6 w-6"
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleReorder('down')} 
                                                disabled={selectedExported.length !== 1}
                                                className="h-6 w-6"
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        
                                        <div className="border-t my-1" />
                                        
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={() => handleMove('remove_all')}
                                            className="h-7 text-xs px-2"
                                            disabled={exportedFields.length === 0}
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
                        <Button variant="ghost" size="sm" className="gap-1 h-8">
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
                        <Button 
                            onClick={handleExport} 
                            className="bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2 h-8"
                            size="sm"
                            disabled={exportedFields.length === 0}
                        >
                            {fileFormat === 'pdf' ? <Printer className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                            {fileFormat === 'pdf' ? 'طباعة' : 'تصدير'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
