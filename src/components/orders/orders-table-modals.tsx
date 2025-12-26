
import * as React from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Loader2, Trash2, Truck, Store, Printer, FileDown, ArrowRightLeft } from 'lucide-react';

import Icon from '@/components/icon';
import { ChangeStatusDialog } from '@/components/change-status-dialog';
import { PrintablePolicy } from '@/components/printable-policy';
import { ModernPolicyV2 } from '@/components/modern-policy-v2';
import { ThermalLabelOptimized } from '@/components/thermal-label-optimized';
import { ExportDataDialog, ColumnConfig } from '@/components/export-data-dialog';

import { Order } from '@/store/orders-store';
import { ModalState } from './types';
import { ALL_COLUMNS } from './constants';
import { SavedTemplate } from '@/contexts/SettingsContext';

interface OrdersTableModalsProps {
    modalState: ModalState;
    setModalState: (state: ModalState) => void;
    selectedRows: string[];
    visibleColumns: string[];
    selectedRowsCount: number;
    orders: Order[];
    drivers: any[];
    merchants: any[];
    availableTemplates: SavedTemplate[];
    selectedTemplate: SavedTemplate | null;
    setSelectedTemplate: (t: SavedTemplate | null) => void;
    printablePolicyRef: React.RefObject<any>;
    modernPolicyV2Ref: React.RefObject<any>;
    thermalLabelOptRef: React.RefObject<any>;

    // Bulk actions
    showDeleteConfirmDialog: boolean;
    setShowDeleteConfirmDialog: (open: boolean) => void;
    handleBulkDelete: () => void;

    showAssignDriverDialog: boolean;
    setShowAssignDriverDialog: (open: boolean) => void;
    selectedDriverForBulk: string;
    setSelectedDriverForBulk: (driver: string) => void;
    handleBulkAssignDriver: () => void;

    showAssignMerchantDialog: boolean;
    setShowAssignMerchantDialog: (open: boolean) => void;
    selectedMerchantForBulk: string;
    setSelectedMerchantForBulk: (merchant: string) => void;
    handleBulkAssignMerchant: () => void;

    showChangeStatusDialog: boolean;
    setShowChangeStatusDialog: (open: boolean) => void;
    selectedStatusForBulk: string;
    setSelectedStatusForBulk: (status: string) => void;
    handleBulkChangeStatus: () => void;
    statuses: any[];

    showModernPolicyV2Dialog: boolean;
    setShowModernPolicyV2Dialog: (open: boolean) => void;

    showThermalLabelOptDialog: boolean;
    setShowThermalLabelOptDialog: (open: boolean) => void;

    isLoading: boolean;
    isClient: boolean;
}

export const OrdersTableModals = ({
    modalState,
    setModalState,
    selectedRows,
    visibleColumns,
    selectedRowsCount,
    orders,
    drivers,
    merchants,
    availableTemplates,
    selectedTemplate,
    setSelectedTemplate,
    printablePolicyRef,
    modernPolicyV2Ref,
    thermalLabelOptRef,
    showDeleteConfirmDialog,
    setShowDeleteConfirmDialog,
    handleBulkDelete,
    showAssignDriverDialog,
    setShowAssignDriverDialog,
    selectedDriverForBulk,
    setSelectedDriverForBulk,
    handleBulkAssignDriver,
    showAssignMerchantDialog,
    setShowAssignMerchantDialog,
    selectedMerchantForBulk,
    setSelectedMerchantForBulk,
    handleBulkAssignMerchant,
    showChangeStatusDialog,
    setShowChangeStatusDialog,
    selectedStatusForBulk,
    setSelectedStatusForBulk,
    handleBulkChangeStatus,
    statuses,
    showModernPolicyV2Dialog,
    setShowModernPolicyV2Dialog,
    showThermalLabelOptDialog,
    setShowThermalLabelOptDialog,
    isLoading,
    isClient,
}: OrdersTableModalsProps) => {

    const selectedOrders = React.useMemo(() => {
        return selectedRows.length > 0 ? orders.filter(o => selectedRows.includes(o.id)) : orders;
    }, [orders, selectedRows]);

    const firstSelectedOrder = React.useMemo(() => {
        return orders.find(o => o.id === selectedRows[0]);
    }, [orders, selectedRows]);

    const initialVisibleColumnConfigs = React.useMemo(() => {
        return visibleColumns
            .map(colKey => ALL_COLUMNS.find(c => c.key === colKey))
            .filter((c): c is ColumnConfig => !!c);
    }, [visibleColumns]);

    return (
        <>
            <AlertDialog open={modalState.type === 'delete'} onOpenChange={(open) => !open && setModalState({ type: 'none' })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>هل أنت متأكد من حذف {selectedRowsCount} طلبات؟</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction>حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Standard Policy Dialog - PDF القياسي (A4/A5) */}
            <Dialog open={modalState.type === 'print'} onOpenChange={(open) => !open && setModalState({ type: 'none' })}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 bg-gray-100">
                    <DialogTitle className="sr-only">طباعة قياسية</DialogTitle>
                    <div className="p-4 flex items-center justify-center h-full">
                        <PrintablePolicy ref={printablePolicyRef} orders={selectedOrders} template={null} />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={modalState.type === 'assignDriver'} onOpenChange={(open) => !open && setModalState({ type: 'none' })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تعيين سائق</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Select>
                            <SelectTrigger><SelectValue placeholder="اختر سائق..." /></SelectTrigger>
                            <SelectContent>{drivers.map(d => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                </DialogContent>
            </Dialog>

            {modalState.type === 'changeStatus' && (
                <ChangeStatusDialog
                    open={true}
                    onOpenChange={(open) => !open && setModalState({ type: 'none' })}
                    orderId={modalState.orderId}
                    currentStatus={modalState.currentStatus}
                    currentDriver={modalState.currentDriver}
                />
            )}

            <ExportDataDialog
                open={modalState.type === 'export'}
                onOpenChange={(open) => !open && setModalState({ type: 'none' })}
                allColumns={ALL_COLUMNS}
                initialVisibleColumns={initialVisibleColumnConfigs}
                ordersToExport={selectedOrders}
                isClient={isClient}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من حذف {selectedRowsCount} طلب؟ هذا الإجراء لا يمكن التراجع عنه.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
                            إلغاء
                        </Button>
                        <Button variant="destructive" onClick={handleBulkDelete} disabled={isLoading}>
                            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Trash2 className="ml-2 h-4 w-4" />}
                            حذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Driver Dialog */}
            <Dialog open={showAssignDriverDialog} onOpenChange={setShowAssignDriverDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تعيين سائق</DialogTitle>
                        <DialogDescription>
                            اختر السائق لتعيين {selectedRowsCount} طلب له
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={selectedDriverForBulk} onValueChange={setSelectedDriverForBulk}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر السائق" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                                {drivers.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.name}>
                                        {driver.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowAssignDriverDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={handleBulkAssignDriver} disabled={isLoading || !selectedDriverForBulk}>
                            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Truck className="ml-2 h-4 w-4" />}
                            تعيين
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Status Dialog */}
            <Dialog open={showChangeStatusDialog} onOpenChange={setShowChangeStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تغيير الحالة</DialogTitle>
                        <DialogDescription>
                            اختر الحالة الجديدة لـ {selectedRowsCount} طلب
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={selectedStatusForBulk} onValueChange={setSelectedStatusForBulk}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                                {statuses.map((status) => (
                                    <SelectItem key={status.id} value={status.name}>
                                        {status.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowChangeStatusDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={handleBulkChangeStatus} disabled={isLoading || !selectedStatusForBulk}>
                            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="ml-2 h-4 w-4" />}
                            تغيير
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Merchant Dialog */}
            <Dialog open={showAssignMerchantDialog} onOpenChange={setShowAssignMerchantDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تعيين تاجر</DialogTitle>
                        <DialogDescription>
                            اختر التاجر لتعيين {selectedRowsCount} طلب له
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={selectedMerchantForBulk} onValueChange={setSelectedMerchantForBulk}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر التاجر" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                                {merchants.map((merchant) => (
                                    <SelectItem key={merchant.id} value={merchant.name}>
                                        {merchant.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowAssignMerchantDialog(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={handleBulkAssignMerchant} disabled={isLoading || !selectedMerchantForBulk}>
                            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Store className="ml-2 h-4 w-4" />}
                            تعيين
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Thermal Label Optimized Dialog */}
            <Dialog open={showThermalLabelOptDialog} onOpenChange={setShowThermalLabelOptDialog}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 bg-gray-100">
                    <DialogTitle className="sr-only">طباعة حرارية</DialogTitle>
                    
                    {/* أزرار الطباعة */}
                    <div className="flex gap-2 p-4 bg-white border-b no-print">
                        <Button 
                            onClick={() => thermalLabelOptRef.current?.handleExportPDF()}
                            className="flex items-center gap-2"
                        >
                            <Icon name="Printer" className="h-4 w-4" />
                            طباعة PDF
                        </Button>
                        <Button 
                            onClick={() => thermalLabelOptRef.current?.handlePrint()}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Icon name="Eye" className="h-4 w-4" />
                            معاينة
                        </Button>
                        <Button 
                            onClick={() => setShowThermalLabelOptDialog(false)}
                            variant="ghost"
                            className="ml-auto"
                        >
                            إغلاق
                        </Button>
                    </div>
                    
                    <ThermalLabelOptimized ref={thermalLabelOptRef} orders={selectedOrders} />
                </DialogContent>
            </Dialog>

            {/* Modern Policy V2 Dialog */}
            <Dialog open={showModernPolicyV2Dialog} onOpenChange={setShowModernPolicyV2Dialog}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 bg-gray-100">
                    <DialogTitle className="sr-only">طباعة ملونة</DialogTitle>
                    
                    {/* أزرار الطباعة */}
                    <div className="flex gap-2 p-4 bg-white border-b no-print">
                        <Button 
                            onClick={() => modernPolicyV2Ref.current?.handleExportPDF()}
                            className="flex items-center gap-2"
                        >
                            <Icon name="Printer" className="h-4 w-4" />
                            طباعة PDF
                        </Button>
                        <Button 
                            onClick={() => modernPolicyV2Ref.current?.handlePrint()}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Icon name="Eye" className="h-4 w-4" />
                            معاينة
                        </Button>
                        <Button 
                            onClick={() => setShowModernPolicyV2Dialog(false)}
                            variant="ghost"
                            className="ml-auto"
                        >
                            إغلاق
                        </Button>
                    </div>
                    
                    <ModernPolicyV2 ref={modernPolicyV2Ref} orders={selectedOrders} />
                </DialogContent>
            </Dialog>
        </>
    );
};
