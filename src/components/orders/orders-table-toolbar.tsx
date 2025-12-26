
import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    ListTree, ListOrdered, Filter, RefreshCw, FileDown,
    Trash2, Truck, Store, PlusCircle, Printer, Calculator, FileSpreadsheet, X, ArrowRightLeft
} from 'lucide-react';
import {
    DndContext, closestCenter, type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AdvancedSearch, DateGroupOption } from './advanced-search';
import { SortableColumn } from './cells/sortable-column';
import { FilterDefinition } from '@/app/actions/get-orders';
import { GroupByOption, ModalState } from './types';
import { GROUP_BY_OPTIONS, ALL_COLUMNS } from './constants';
import { ColumnConfig } from '@/components/export-data-dialog';
import { PrintDialogUnified } from '@/components/print-dialog-unified';
import { useToast } from '@/hooks/use-toast';

interface OrdersTableToolbarProps {
    filters: FilterDefinition[];
    setFilters: React.Dispatch<React.SetStateAction<FilterDefinition[]>>;
    globalSearch: string;
    setGlobalSearch: (term: string) => void;
    searchableFields: any[];

    isEditMode: boolean;
    setIsEditMode: (mode: boolean) => void;

    groupBy: GroupByOption;
    setGroupBy: (option: GroupByOption) => void;
    groupByLevels: GroupByOption[];
    addGroupByLevel: (option: GroupByOption) => void;
    removeGroupByLevel: (index: number) => void;
    dateGroupBy: DateGroupOption | null;
    setDateGroupBy: (option: DateGroupOption | null) => void;

    columns: ColumnConfig[];
    visibleColumnKeys: string[];
    setVisibleColumnKeys: React.Dispatch<React.SetStateAction<string[]>>;
    handleColumnDragEnd: (event: DragEndEvent) => void;
    handleColumnVisibilityChange: (key: string, checked: boolean) => void;
    sensors: any;

    selectedRows: string[];
    handleSelectAll: (checked: boolean | 'indeterminate') => void;
    handleRefresh: () => void;
    isIndeterminate: boolean;
    isAllSelected: boolean;

    setModalState: (state: ModalState) => void;
    setShowDeleteConfirmDialog: (open: boolean) => void;
    setShowAssignDriverDialog: (open: boolean) => void;
    setShowAssignMerchantDialog: (open: boolean) => void;
    setShowChangeStatusDialog: (open: boolean) => void;
    setShowModernPolicyV2Dialog: (open: boolean) => void;
    setShowThermalLabelOptDialog: (open: boolean) => void;
    handleExportExcel: () => void;
    toggleAllGroups: () => void;
    areAllGroupsOpen: boolean;
    groupedOrders: any;
    canAssignDriverToSelected: boolean;
    orders: any[]; // Add orders prop for bulk printing
}

export const OrdersTableToolbar = ({
    filters,
    setFilters,
    globalSearch,
    setGlobalSearch,
    searchableFields,
    isEditMode,
    setIsEditMode,
    groupBy,
    setGroupBy,
    groupByLevels,
    addGroupByLevel,
    removeGroupByLevel,
    dateGroupBy,
    setDateGroupBy,
    columns,
    visibleColumnKeys,
    setVisibleColumnKeys,
    handleColumnDragEnd,
    handleColumnVisibilityChange,
    sensors,
    selectedRows,
    handleSelectAll,
    handleRefresh,
    isIndeterminate,
    isAllSelected,
    setModalState,
    setShowDeleteConfirmDialog,
    setShowAssignDriverDialog,
    setShowAssignMerchantDialog,
    setShowChangeStatusDialog,
    setShowModernPolicyV2Dialog,
    setShowThermalLabelOptDialog,
    handleExportExcel,
    toggleAllGroups,
    areAllGroupsOpen,
    groupedOrders,
    canAssignDriverToSelected,
    orders
}: OrdersTableToolbarProps) => {
    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const { toast } = useToast();

    // الحصول على الطلبات المحددة للطباعة
    const selectedOrders = orders.filter(order => selectedRows.includes(order.id));

    return (
        <div className="flex-none flex-col space-y-3 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 px-4 py-4 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            {/* صندوق البحث الشامل - عرض كامل */}
            <div className="w-full">
                <AdvancedSearch
                    filters={filters}
                    onAddFilter={(filter) => setFilters(prev => [...prev, filter])}
                    onRemoveFilter={(index) => setFilters(prev => prev.filter((_, i) => i !== index))}
                    onGlobalSearchChange={setGlobalSearch}
                    globalSearchTerm={globalSearch}
                    searchableFields={searchableFields}
                    groupBy={groupBy}
                    onGroupByChange={setGroupBy}
                    groupByLevels={groupByLevels}
                    onAddGroupByLevel={addGroupByLevel}
                    onRemoveGroupByLevel={removeGroupByLevel}
                    dateGroupBy={dateGroupBy || undefined}
                    onDateGroupByChange={setDateGroupBy}
                />
            </div>

            {/* شريط الأدوات - كل العناصر في سطر واحد */}
            <div className="flex flex-row items-center gap-2 flex-wrap py-2 px-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                {/* وضع التحرير */}
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                    <Switch
                        id="edit-mode"
                        checked={isEditMode}
                        onCheckedChange={setIsEditMode}
                        className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-slate-400"
                    />
                    <label htmlFor="edit-mode" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                        تحرير
                    </label>
                </div>

                {/* الأعمدة */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1 h-7 text-xs border-slate-300 hover:bg-slate-100 dark:border-slate-600">
                            <ListOrdered className="h-3.5 w-3.5" />
                            الأعمدة
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 max-h-[400px] flex flex-col">
                        <DropdownMenuLabel className="text-xs">إظهار/إخفاء الأعمدة</DropdownMenuLabel>
                        <div className='flex items-center gap-2 p-1'>
                            <Button variant="link" size="sm" className='h-auto p-1 text-xs text-orange-600' onClick={() => setVisibleColumnKeys(ALL_COLUMNS.map(c => c.key))}>إظهار الكل</Button>
                            <Separator orientation="vertical" className="h-4" />
                            <Button variant="link" size="sm" className='h-auto p-1 text-xs text-slate-500' onClick={() => setVisibleColumnKeys(['id', 'recipient', 'status'])}>إخفاء الكل</Button>
                        </div>
                        <DropdownMenuSeparator />
                        <div className="flex-1 min-h-0 overflow-auto">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd}>
                                <SortableContext items={columns.map(c => c.key)} strategy={verticalListSortingStrategy}>
                                    {ALL_COLUMNS.map((column) => (
                                        <SortableColumn
                                            key={column.key}
                                            id={column.key}
                                            label={column.label}
                                            isVisible={visibleColumnKeys.includes(column.key)}
                                            onToggle={handleColumnVisibilityChange}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="icon" onClick={handleRefresh} className="h-7 w-7 border-slate-300 hover:bg-slate-100">
                    <RefreshCw className="h-3.5 w-3.5" />
                </Button>

                <Button
                    onClick={() => window.open('/dashboard/add-order', '_blank')}
                    className="h-7 text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm"
                    size="sm"
                >
                    <PlusCircle className="ml-1 h-3.5 w-3.5" /> إضافة
                </Button>

                <Separator orientation="vertical" className="h-5" />

                {/* عدد المحدد */}
                {selectedRows.length > 0 && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 text-xs font-semibold">
                        {selectedRows.length} محدد
                    </Badge>
                )}

                {/* أزرار الإجراءات */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirmDialog(true)}
                    disabled={selectedRows.length === 0}
                    className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-40"
                >
                    <Trash2 className="h-3.5 w-3.5 ml-1" /> حذف
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAssignDriverDialog(true)}
                    disabled={selectedRows.length === 0 || !canAssignDriverToSelected}
                    title={!canAssignDriverToSelected ? 'يمكن تعيين السائق فقط للطلبات بحالة "بالانتظار" أو "تم استلام المال في الفرع"' : ''}
                    className="h-7 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 disabled:opacity-40"
                >
                    <Truck className="h-3.5 w-3.5 ml-1" /> سائق
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAssignMerchantDialog(true)}
                    disabled={selectedRows.length === 0}
                    className="h-7 text-xs text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 disabled:opacity-40"
                >
                    <Store className="h-3.5 w-3.5 ml-1" /> تاجر
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChangeStatusDialog(true)}
                    disabled={selectedRows.length === 0}
                    className="h-7 text-xs text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 disabled:opacity-40"
                >
                    <ArrowRightLeft className="h-3.5 w-3.5 ml-1" /> حالة
                </Button>

                <Separator orientation="vertical" className="h-5" />

                <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedRows.length === 0}
                    className="h-7 text-xs disabled:opacity-40 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 transition-all hover:scale-105"
                    onClick={() => setShowPrintDialog(true)}
                >
                    <Printer className="h-4 w-4 ml-1" /> طباعة
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedRows.length === 0}
                    className="h-7 text-xs disabled:opacity-40 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 transition-all hover:scale-105"
                    onClick={() => setModalState({ type: 'export' })}
                >
                    <FileSpreadsheet className="h-4 w-4 ml-1" /> تصدير
                </Button>

                {/* زر توسيع/طي المجموعات */}
                {groupedOrders && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAllGroups}
                        className="mr-auto h-7 text-xs border-slate-300"
                    >
                        {areAllGroupsOpen ? 'طي الكل' : 'توسيع الكل'}
                    </Button>
                )}
            </div>

            {/* Print Dialog - Unified */}
            <PrintDialogUnified
                open={showPrintDialog}
                onOpenChange={setShowPrintDialog}
                orders={selectedOrders}
            />
        </div>
    );
};
