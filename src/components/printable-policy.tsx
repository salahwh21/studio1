
'use client';

import React, { useState, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import type { Order } from '@/store/orders-store';
import type { PolicySettings, PolicyElement, SavedTemplate } from '@/contexts/SettingsContext';
import { Button } from './ui/button';
import Icon from './icon';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { PrintablePolicyContent } from './Policy'; // We will create this component

type ExportType = 'pdf' | 'direct' | 'zpl' | 'escpos';

type PrintablePolicyProps = {
    orders: Order[];
    template: SavedTemplate;
    onExport: () => void;
};

const mmToPt = (mm: number) => mm * 2.83465;

export const PrintablePolicy = forwardRef(({ orders, template, onExport }: PrintablePolicyProps, ref) => {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState<ExportType>('pdf');
    const [isDialogOpen, setIsDialogOpen] = useState(true);

    const displayOrders = useMemo(() => orders.length > 0 ? orders : [{
        id: '12345',
        orderNumber: 12345,
        recipient: 'اسم المستلم التجريبي',
        phone: '0790000000',
        address: 'العنوان التجريبي, الشارع, المبنى',
        city: 'المدينة',
        region: 'المنطقة',
        cod: 100,
        merchant: 'اسم التاجر التجريبي',
        date: new Date().toISOString().split('T')[0],
        notes: 'هذه ملاحظات تجريبية للطباعة.',
        source: 'Manual',
        referenceNumber: 'REF-001',
        whatsapp: '',
        status: 'بالانتظار',
        driver: 'اسم السائق',
        itemPrice: 98,
        deliveryFee: 2,
    }], [orders]);

    useImperativeHandle(ref, () => ({
        handleExportPDF,
    }));
    
    const handleDirectPrint = async () => {
        // This is a placeholder for WebUSB/WebBluetooth logic
        // In a real scenario, this would involve device discovery and sending commands
        toast({
            variant: "destructive",
            title: "غير مدعوم بعد",
            description: "الطباعة المباشرة عبر USB/Bluetooth قيد التطوير."
        });
    };

    const handleExportPDF = async () => {
        // PDF Export using html2canvas
        // This logic is now handled within the button click
    };
    
    const handleFinalExport = () => {
        setIsExporting(true);
        if (exportType === 'pdf') {
            window.print();
        } else {
            handleDirectPrint();
        }
        setIsExporting(false);
        onExport();
    }
    
    const paperDimensions = {
        width: template.paperSize === 'custom' ? template.customDimensions.width : (paperSizeClasses as any)[template.paperSize].width,
        height: template.paperSize === 'custom' ? template.customDimensions.height : (paperSizeClasses as any)[template.paperSize].height,
    };

    return (
        <>
            <div id="printable-area" className="printable-area">
                {displayOrders.map((order, index) => (
                    <div key={order.id} className="page-break" style={{ width: `${mmToPt(paperDimensions.width)}pt`, height: `${mmToPt(paperDimensions.height)}pt` }}>
                        <PrintablePolicyContent order={order} template={template} />
                    </div>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="text-center mt-4 no-print flex gap-2 justify-center">
                    <Button onClick={handleFinalExport}>
                        <Icon name="Printer" className="ml-2 h-4 w-4 inline" />
                        طباعة PDF
                    </Button>
                </div>
            )}
        </>
    );
});

PrintablePolicy.displayName = 'PrintablePolicy';

// We need to define paperSizeClasses here or import it if moved.
const paperSizeClasses = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  a6: { width: 105, height: 148 },
  '4x6': { width: 101.6, height: 152.4 },
};
