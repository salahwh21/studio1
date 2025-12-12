'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Download, ArrowRight, ChevronsUp, ChevronUp, ChevronDown, ChevronsDown, ArrowLeft as ArrowLeftIcon } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { type Order } from '@/store/orders-store';
import { exportToExcel } from '@/lib/export-utils';
import Icon from '@/components/icon';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
        } else if (fileFormat === 'excel') {
            // Convert array of arrays to array of objects for exportToExcel
            const dataObjects = dataRows.map(row => {
                const obj: Record<string, any> = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });
            await exportToExcel(dataObjects, 'orders_export.xlsx', 'Orders');
        } else {
            toast({ variant: 'destructive', title: 'غير متوفر', description: 'صيغة الملف المحددة غير مدعومة حاليًا.' });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader><DialogTitle>تصدير البيانات</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">ما الذي تريد فعله؟</Label>
                            <RadioGroup value={exportPurpose} onValueChange={setExportPurpose} className="space-y-1">
                                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="all_data" id="r1_exp" /><Label htmlFor="r1_exp">استخدام البيانات في الجدول (تصدير كافة البيانات)</Label></div>
                                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="update_data" id="r2_exp" /><Label htmlFor="r2_exp">تحديث البيانات (تصدير صالح للاستيراد)</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">صيغة الملف المصدر:</Label>
                            <RadioGroup value={fileFormat} onValueChange={setFileFormat} className="flex gap-4">
                                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="excel" id="f_excel" /><Label htmlFor="f_excel">Excel</Label></div>
                                <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="csv" id="f_csv" /><Label htmlFor="f_csv">CSV</Label></div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-muted rounded-md p-4 space-y-4">
                        <Icon name="FileSpreadsheet" className="w-24 h-24 text-muted-foreground" />
                        <p className="text-center text-muted-foreground">سيتم تصدير {ordersToExport.length} سجلات مع {exportedFields.length} حقول.</p>
                        <div className="w-full space-y-2">
                            <Button onClick={handleExport} className="w-full"><Download className="ml-2 h-4 w-4" /> تصدير لملف</Button>
                            <DialogClose asChild><Button variant="outline" className="w-full">إقفال</Button></DialogClose>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center pt-4 border-t">
                    <div className="flex flex-col gap-2">
                        <Label>الحقول المتاحة</Label>
                        <ScrollArea className="h-64 border rounded-md p-2">
                            {availableFields.map(field => (
                                <div key={field.key} onClick={() => handleFieldClick(field.key, 'available')} className={cn("p-2 text-sm rounded-md cursor-pointer hover:bg-muted", selectedAvailable.includes(field.key) && "bg-primary/10 text-primary ring-1 ring-primary")}>{field.label}</div>
                            ))}
                        </ScrollArea>
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={() => handleMove('add')} disabled={selectedAvailable.length === 0}>إضافة <ArrowLeftIcon className="mr-2 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleMove('remove')} disabled={selectedExported.length === 0}>إزالة <ArrowRight className="mr-2 h-4" /></Button>
                        <Separator className="my-2" />
                        <Button variant="outline" size="icon" onClick={() => handleReorder('top')} disabled={selectedExported.length !== 1}> <ChevronsUp className="h-4" /> </Button>
                        <Button variant="outline" size="icon" onClick={() => handleReorder('up')} disabled={selectedExported.length !== 1}> <ChevronUp className="h-4" /> </Button>
                        <Button variant="outline" size="icon" onClick={() => handleReorder('down')} disabled={selectedExported.length !== 1}> <ChevronDown className="h-4" /> </Button>
                        <Button variant="outline" size="icon" onClick={() => handleReorder('bottom')} disabled={selectedExported.length !== 1}> <ChevronsDown className="h-4" /> </Button>
                        <Separator className="my-2" />
                        <Button variant="outline" size="sm" onClick={() => handleMove('remove_all')}>إزالة الكل</Button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label>الحقول المراد تصديرها</Label>
                            <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSaveFields}>حفظ قائمة الحقول</Button>
                        </div>
                        <ScrollArea className="h-64 border rounded-md p-2">
                            {exportedFields.map(field => (
                                <div key={field.key} onClick={() => handleFieldClick(field.key, 'exported')} className={cn("p-2 text-sm rounded-md cursor-pointer hover:bg-muted", selectedExported.includes(field.key) && "bg-primary/10 text-primary ring-1 ring-primary")}>{field.label}</div>
                            ))}
                        </ScrollArea>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};
