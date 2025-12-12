
'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
// Card removed - no cards needed for better space utilization
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppHeader } from '@/components/header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';

import { useSettings, SavedTemplate, readyTemplates } from '@/contexts/SettingsContext';

import { useOrdersTable } from '@/hooks/use-orders-table';
import { useStatusesStore } from '@/store/statuses-store';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';

import { OrdersTableToolbar } from '@/components/orders/orders-table-toolbar';
import { OrdersTableModals } from '@/components/orders/orders-table-modals';
import { OrdersTableView } from '@/components/orders/orders-table-view';
import { ModalState } from '@/components/orders/types';
import { ALL_COLUMNS } from '@/components/orders/constants';

import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

const OrdersTableComponent = () => {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const { statuses } = useStatusesStore();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [isClient, setIsClient] = useState(false);
    const context = useSettings();
    // Use readyTemplates directly and creating local ref
    const { formatCurrency, settings } = context;
    const availableTemplates = readyTemplates;
    const printablePolicyRef = useRef<any>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Real-time updates for orders table
    useRealTimeOrders();

    const {
        orders,
        isLoading,
        totalCount,
        totalPages,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        globalSearch,
        setGlobalSearch,
        filters,
        setFilters,
        groupBy,
        setGroupBy,
        groupedOrders,
        openGroups,
        setOpenGroups,
        toggleAllGroups,
        areAllGroupsOpen,
        selectedRows,
        handleSelectRow,
        handleSelectAll,
        isAllSelected,
        isIndeterminate,
        handleSort,
        handleRefresh,
        handleUpdateField,
        handleBulkDelete,
        handleBulkAssignDriver,
        handleBulkAssignMerchant,
        handleBulkChangeStatus,
        canAssignDriverToSelected,
        searchableFields,
        merchants,
        drivers,
        cities
    } = useOrdersTable();


    // UI State
    const [isEditMode, setIsEditMode] = useState(false);
    const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

    // Dialog States
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const [showAssignDriverDialog, setShowAssignDriverDialog] = useState(false);
    const [selectedDriverForBulk, setSelectedDriverForBulk] = useState('');
    const [showAssignMerchantDialog, setShowAssignMerchantDialog] = useState(false);
    const [selectedMerchantForBulk, setSelectedMerchantForBulk] = useState('');
    const [showChangeStatusDialog, setShowChangeStatusDialog] = useState(false);
    const [selectedStatusForBulk, setSelectedStatusForBulk] = useState('');
    const [showModernPolicyV2Dialog, setShowModernPolicyV2Dialog] = useState(false);
    const [showThermalLabelOptDialog, setShowThermalLabelOptDialog] = useState(false);

    // Printing Refs
    const modernPolicyV2Ref = useRef<any>(null);
    const thermalLabelOptRef = useRef<any>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);

    // Columns - Load from localStorage on mount
    const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ordersTableColumnSettings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.savedVisibleKeys && Array.isArray(parsed.savedVisibleKeys)) {
                        return parsed.savedVisibleKeys;
                    }
                }
            } catch (e) {
                console.error('Error loading column settings:', e);
            }
        }
        return ['id', 'source', 'status', 'recipient', 'phone', 'address', 'cod'];
    });
    
    // Save column settings to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ordersTableColumnSettings');
                const currentSettings = saved ? JSON.parse(saved) : {};
                localStorage.setItem('ordersTableColumnSettings', JSON.stringify({
                    ...currentSettings,
                    savedVisibleKeys: visibleColumnKeys,
                    savedAt: new Date().toISOString()
                }));
            } catch (e) {
                console.error('Error saving column settings:', e);
            }
        }
    }, [visibleColumnKeys]);

    // Footer Totals
    const footerTotals = React.useMemo(() => {
        return orders.reduce((acc, order) => {
            acc.itemPrice += order.itemPrice || 0;
            acc.deliveryFee += order.deliveryFee || 0;
            acc.additionalCost += order.additionalCost || 0;
            acc.driverFee += order.driverFee || 0;
            acc.cod += order.cod || 0;
            acc.companyDue += (order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
            return acc;
        }, { itemPrice: 0, deliveryFee: 0, additionalCost: 0, driverFee: 0, cod: 0, companyDue: 0 });
    }, [orders]);

    const isMobile = useMediaQuery("(max-width: 640px)");

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const visibleColumns = React.useMemo(() => {
        return ALL_COLUMNS.filter((col: any) => visibleColumnKeys.includes(col.key))
            .sort((a: any, b: any) => visibleColumnKeys.indexOf(a.key) - visibleColumnKeys.indexOf(b.key));
    }, [visibleColumnKeys]);

    const handleColumnDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setVisibleColumnKeys((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newItems = [...items];
                newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, active.id);
                // Save immediately after drag
                if (typeof window !== 'undefined') {
                    try {
                        const saved = localStorage.getItem('ordersTableColumnSettings');
                        const currentSettings = saved ? JSON.parse(saved) : {};
                        localStorage.setItem('ordersTableColumnSettings', JSON.stringify({
                            ...currentSettings,
                            savedVisibleKeys: newItems,
                            savedAt: new Date().toISOString()
                        }));
                    } catch (e) {
                        console.error('Error saving column order:', e);
                    }
                }
                return newItems;
            });
        }
    };

    const handleColumnVisibilityChange = (key: string, checked: boolean) => {
        setVisibleColumnKeys(prev =>
            checked ? [...prev, key] : prev.filter(k => k !== key)
        );
    };

    if (!isClient) return <Skeleton className="w-full h-screen" />;

    return (
        <TooltipProvider>
            {/* حاوية رئيسية - بدون padding أو margins - استغلال كامل للمساحة */}
            <div className="flex flex-col h-screen bg-white dark:bg-slate-950 overflow-hidden">
                {/* القائمة العلوية الرئيسية */}
                <AppHeader />
                
                <OrdersTableToolbar
                    filters={filters}
                    setFilters={setFilters}
                    globalSearch={globalSearch}
                    setGlobalSearch={setGlobalSearch}
                    searchableFields={searchableFields}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                    groupBy={groupBy}
                    setGroupBy={setGroupBy}
                    columns={visibleColumns}
                    visibleColumnKeys={visibleColumnKeys}
                    setVisibleColumnKeys={setVisibleColumnKeys}
                    handleColumnDragEnd={handleColumnDragEnd}
                    handleColumnVisibilityChange={handleColumnVisibilityChange}
                    sensors={sensors}
                    selectedRows={selectedRows}
                    handleSelectAll={handleSelectAll}
                    handleRefresh={handleRefresh}
                    isIndeterminate={isIndeterminate}
                    isAllSelected={isAllSelected}
                    canAssignDriverToSelected={canAssignDriverToSelected}
                    setModalState={setModalState}
                    setShowDeleteConfirmDialog={setShowDeleteConfirmDialog}
                    setShowAssignDriverDialog={setShowAssignDriverDialog}
                    setShowAssignMerchantDialog={setShowAssignMerchantDialog}
                    setShowChangeStatusDialog={setShowChangeStatusDialog}
                    setShowModernPolicyV2Dialog={setShowModernPolicyV2Dialog}
                    setShowThermalLabelOptDialog={setShowThermalLabelOptDialog}
                    handleExportExcel={() => setModalState({ type: 'export' })}
                    toggleAllGroups={toggleAllGroups}
                    areAllGroupsOpen={!!areAllGroupsOpen}
                    groupedOrders={groupedOrders}
                />

                <OrdersTableView
                            orders={orders}
                            groupedOrders={groupedOrders}
                            openGroups={openGroups}
                            setOpenGroups={setOpenGroups}
                            visibleColumns={visibleColumns}
                            selectedRows={selectedRows}
                            handleSelectRow={handleSelectRow}
                            handleSelectAll={handleSelectAll}
                            isAllSelected={isAllSelected}
                            isIndeterminate={isIndeterminate}
                            handleSort={handleSort}
                            isEditMode={isEditMode}
                            handleUpdateField={handleUpdateField}
                            cities={cities}
                            merchants={merchants}
                            drivers={drivers}
                            isLoading={isLoading}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            setModalState={setModalState}
                            formatCurrency={formatCurrency}
                            footerTotals={footerTotals}
                            selectedRowsCount={selectedRows.length}
                            ordersCount={orders.length}
                />

                {/* Pagination - بدون بطاقة - استغلال كامل للمساحة */}
                {!groupBy && (
                    <div className="flex-none flex items-center justify-between p-2 border-t border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">صفوف الصفحة:</p>
                                <Select
                                    value={`${rowsPerPage}`}
                                    onValueChange={(value) => {
                                        setRowsPerPage(Number(value));
                                        setPage(0);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={rowsPerPage} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[100, 250, 500].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value={`${totalCount}`}>
                                            الكل
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="text-sm font-medium">
                                صفحة {page + 1} من {totalPages}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                    onClick={() => setPage(0)}
                                    disabled={page === 0}
                                >
                                    <span className="sr-only">Go to first page</span>
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                >
                                    <span className="sr-only">Go to previous page</span>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                >
                                    <span className="sr-only">Go to next page</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                    onClick={() => setPage(totalPages - 1)}
                                    disabled={page >= totalPages - 1}
                                >
                                    <span className="sr-only">Go to last page</span>
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <OrdersTableModals
                modalState={modalState}
                setModalState={setModalState}
                selectedRows={selectedRows}
                visibleColumns={visibleColumnKeys}
                selectedRowsCount={selectedRows.length}
                orders={orders}
                drivers={drivers}
                merchants={merchants}
                availableTemplates={availableTemplates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                printablePolicyRef={printablePolicyRef}
                modernPolicyV2Ref={modernPolicyV2Ref}
                thermalLabelOptRef={thermalLabelOptRef}
                showDeleteConfirmDialog={showDeleteConfirmDialog}
                setShowDeleteConfirmDialog={setShowDeleteConfirmDialog}
                handleBulkDelete={handleBulkDelete}
                showAssignDriverDialog={showAssignDriverDialog}
                setShowAssignDriverDialog={setShowAssignDriverDialog}
                selectedDriverForBulk={selectedDriverForBulk}
                setSelectedDriverForBulk={setSelectedDriverForBulk}
                handleBulkAssignDriver={() => {
                    handleBulkAssignDriver(selectedDriverForBulk);
                    setShowAssignDriverDialog(false);
                }}
                showAssignMerchantDialog={showAssignMerchantDialog}
                setShowAssignMerchantDialog={setShowAssignMerchantDialog}
                selectedMerchantForBulk={selectedMerchantForBulk}
                setSelectedMerchantForBulk={setSelectedMerchantForBulk}
                handleBulkAssignMerchant={() => handleBulkAssignMerchant(selectedMerchantForBulk)}
                showChangeStatusDialog={showChangeStatusDialog}
                setShowChangeStatusDialog={setShowChangeStatusDialog}
                selectedStatusForBulk={selectedStatusForBulk}
                setSelectedStatusForBulk={setSelectedStatusForBulk}
                handleBulkChangeStatus={() => {
                    handleBulkChangeStatus(selectedStatusForBulk);
                    setShowChangeStatusDialog(false);
                }}
                statuses={statuses}
                showModernPolicyV2Dialog={showModernPolicyV2Dialog}
                setShowModernPolicyV2Dialog={setShowModernPolicyV2Dialog}
                showThermalLabelOptDialog={showThermalLabelOptDialog}
                setShowThermalLabelOptDialog={setShowThermalLabelOptDialog}
                isLoading={isLoading}
                isClient={isClient}
            />

        </TooltipProvider>
    );
}

export function OrdersTable() {
    return (
        <React.Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <OrdersTableComponent />
        </React.Suspense>
    );
}
