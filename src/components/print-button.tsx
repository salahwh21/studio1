'use client';

import { useState, useRef, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PrintOptionsDialog } from '@/components/print-options-dialog';
import { PrintablePolicy } from '@/components/printable-policy';
import { ModernPolicyV2 } from '@/components/modern-policy-v2';
import { ThermalLabelOptimized } from '@/components/thermal-label-optimized';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/icon';
import type { Order } from '@/store/orders-store';
import type { SavedTemplate } from '@/contexts/SettingsContext';
import { readyTemplates } from '@/contexts/SettingsContext';

type PrintType = 'pdf' | 'colored' | 'thermal' | 'bulk-separate' | 'bulk-single';

interface PrintButtonProps {
    orders: Order[];
    disabled?: boolean;
    variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showLabel?: boolean;
    label?: string;
}

export const PrintButton = ({
    orders,
    disabled = false,
    variant = 'ghost',
    size = 'sm',
    className = '',
    showLabel = true,
    label = 'طباعة',
}: PrintButtonProps) => {
    const { toast } = useToast();

    // States for dialogs
    const [showPrintOptionsDialog, setShowPrintOptionsDialog] = useState(false);
    const [showPrintablePolicyDialog, setShowPrintablePolicyDialog] = useState(false);
    const [showModernPolicyV2Dialog, setShowModernPolicyV2Dialog] = useState(false);
    const [showThermalLabelDialog, setShowThermalLabelDialog] = useState(false);

    // Template state for PrintablePolicy
    const [availableTemplates, setAvailableTemplates] = useState<SavedTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);

    // Refs for policy components
    const printablePolicyRef = useRef<{ handleExport: () => Promise<void>; handleDirectPrint: (order: any, type: 'zpl' | 'escpos') => Promise<void> }>(null);
    const modernPolicyV2Ref = useRef<{ handlePrint: () => void; handleExportPDF: () => Promise<void> }>(null);
    const thermalLabelRef = useRef<{ handlePrint: () => void; handleExportPDF: () => Promise<void> }>(null);

    // Load templates from localStorage
    useEffect(() => {
        try {
            const savedTemplatesJson = localStorage.getItem('policyTemplates');
            const userTemplates = savedTemplatesJson ? JSON.parse(savedTemplatesJson) : [];
            const uniqueTemplates = [...readyTemplates];
            const readyIds = new Set(readyTemplates.map(t => t.id));
            userTemplates.forEach((t: SavedTemplate) => {
                if (!readyIds.has(t.id)) {
                    uniqueTemplates.push(t);
                }
            });
            setAvailableTemplates(uniqueTemplates);
            if (uniqueTemplates.length > 0) {
                setSelectedTemplate(uniqueTemplates[0]);
            }
        } catch (e) {
            setAvailableTemplates(readyTemplates);
            if (readyTemplates.length > 0) {
                setSelectedTemplate(readyTemplates[0]);
            }
        }
    }, []);

    const handlePrintClick = () => {
        if (orders.length === 0) {
            toast({
                variant: 'destructive',
                title: 'لم يتم تحديد طلبات',
                description: 'الرجاء تحديد طلب واحد على الأقل للطباعة.',
            });
            return;
        }
        setShowPrintOptionsDialog(true);
    };

    const handlePrint = (type: PrintType, size: string, orientation: string) => {
        // Close the options dialog first
        setShowPrintOptionsDialog(false);

        // Open the appropriate dialog based on type
        if (type === 'pdf') {
            setShowPrintablePolicyDialog(true);
        } else if (type === 'colored') {
            setShowModernPolicyV2Dialog(true);
        } else if (type === 'thermal') {
            setShowThermalLabelDialog(true);
        }
    };

    const isDisabled = disabled || orders.length === 0;

    return (
        <>
            {/* Print Button */}
            <Button
                variant={variant}
                size={size}
                disabled={isDisabled}
                className={`${className} ${isDisabled ? 'disabled:opacity-40' : ''} transition-all hover:scale-105`}
                onClick={handlePrintClick}
            >
                <Printer className={`h-4 w-4 ${showLabel ? 'ml-2' : ''}`} />
                {showLabel && <span className="font-bold text-red-600">{label} TEST</span>}
            </Button>

            {/* Print Options Dialog */}
            <PrintOptionsDialog
                open={showPrintOptionsDialog}
                onOpenChange={setShowPrintOptionsDialog}
                selectedCount={orders.length}
                onPrint={handlePrint}
            />

            {/* Standard Policy Dialog - PDF القياسي */}
            <Dialog open={showPrintablePolicyDialog} onOpenChange={setShowPrintablePolicyDialog}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 bg-gray-100">
                    <DialogTitle className="sr-only">طباعة قياسية</DialogTitle>
                    <div className="p-4 flex items-center justify-center h-full">
                        <PrintablePolicy ref={printablePolicyRef} orders={orders} template={null} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modern Policy V2 Dialog - البوليصة الملونة */}
            <Dialog open={showModernPolicyV2Dialog} onOpenChange={setShowModernPolicyV2Dialog}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 bg-gray-100">
                    <DialogTitle className="sr-only">طباعة ملونة</DialogTitle>

                    {/* أزرار الطباعة */}
                    <div className="flex gap-2 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b no-print">
                        <Button
                            onClick={() => modernPolicyV2Ref.current?.handleExportPDF()}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition-all hover:scale-105"
                        >
                            <Icon name="Printer" className="h-4 w-4" />
                            <span>طباعة PDF</span>
                        </Button>
                        <Button
                            onClick={() => modernPolicyV2Ref.current?.handlePrint()}
                            variant="outline"
                            className="flex items-center gap-2 border-purple-300 hover:bg-purple-50 transition-all"
                        >
                            <Icon name="Eye" className="h-4 w-4" />
                            <span>معاينة</span>
                        </Button>
                        <Button
                            onClick={() => setShowModernPolicyV2Dialog(false)}
                            variant="ghost"
                            className="ml-auto hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <span>إغلاق</span>
                        </Button>
                    </div>

                    <ModernPolicyV2 ref={modernPolicyV2Ref} orders={orders} />
                </DialogContent>
            </Dialog>

            {/* Thermal Label Dialog - الملصقات الحرارية */}
            <Dialog open={showThermalLabelDialog} onOpenChange={setShowThermalLabelDialog}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 bg-gray-100">
                    <DialogTitle className="sr-only">طباعة حرارية</DialogTitle>

                    {/* أزرار الطباعة */}
                    <div className="flex gap-2 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-b no-print">
                        <Button
                            onClick={() => thermalLabelRef.current?.handleExportPDF()}
                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 transition-all hover:scale-105"
                        >
                            <Icon name="Printer" className="h-4 w-4" />
                            <span>طباعة PDF</span>
                        </Button>
                        <Button
                            onClick={() => thermalLabelRef.current?.handlePrint()}
                            variant="outline"
                            className="flex items-center gap-2 border-orange-300 hover:bg-orange-50 transition-all"
                        >
                            <Icon name="Eye" className="h-4 w-4" />
                            <span>معاينة</span>
                        </Button>
                        <Button
                            onClick={() => setShowThermalLabelDialog(false)}
                            variant="ghost"
                            className="ml-auto hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <span>إغلاق</span>
                        </Button>
                    </div>

                    <ThermalLabelOptimized ref={thermalLabelRef} orders={orders} />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PrintButton;
