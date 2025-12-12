
import * as React from 'react';
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
import { AdvancedSearch } from './advanced-search';
import { SortableColumn } from './cells/sortable-column';
import { FilterDefinition } from '@/app/actions/get-orders';
import { GroupByOption, ModalState } from './types';
import { GROUP_BY_OPTIONS, ALL_COLUMNS } from './constants';
import { ColumnConfig } from '@/components/export-data-dialog';

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
    canAssignDriverToSelected
}: OrdersTableToolbarProps) => {

    return (
        <div className="flex-none flex-col space-y-4 bg-gray-50 dark:bg-slate-900 p-5 rounded-lg border border-gray-300 dark:border-slate-700 shadow-sm">
            {/* Header Actions */}
            <div className="flex-none flex-row items-center justify-between flex flex-wrap gap-4" style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}>
                <AdvancedSearch
                    filters={filters}
                    onAddFilter={(filter) => setFilters(prev => [...prev, filter])}
                    onRemoveFilter={(index) => setFilters(prev => prev.filter((_, i) => i !== index))}
                    onGlobalSearchChange={setGlobalSearch}
                    globalSearchTerm={globalSearch}
                    searchableFields={searchableFields}
                />
                <div className="flex items-center gap-2">
                    <Switch
                        id="edit-mode"
                        checked={isEditMode}
                        onCheckedChange={setIsEditMode}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-300"
                    />
                    <Separator orientation="vertical" className="h-6" />

                    {/* Group By Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <ListTree className="h-4 w-4" />
                                <span>التجميع حسب</span>
                                {groupBy && <Badge variant="secondary" className='mr-1'>{GROUP_BY_OPTIONS.find(o => o.value === groupBy)?.label}</Badge>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>اختر حقل للتجميع</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {GROUP_BY_OPTIONS.map(option => (
                                <DropdownMenuCheckboxItem key={option.label} checked={groupBy === option.value} onSelect={() => setGroupBy(option.value)}>
                                    {option.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Columns Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <ListOrdered className="h-4 w-4" />
                                <span>الأعمدة</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-2 max-h-[400px] flex flex-col">
                            <DropdownMenuLabel>إظهار/إخفاء الأعمدة</DropdownMenuLabel>
                            <div className='flex items-center gap-2 p-1'>
                                <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(ALL_COLUMNS.map(c => c.key))}>إظهار الكل</Button>
                                <Separator orientation="vertical" className="h-4" />
                                <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(['id', 'recipient', 'status'])}>إخفاء الكل</Button>
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

                    <Separator orientation="vertical" className="h-6" />

                    <Button variant="outline" size="icon" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    <Button onClick={() => window.open('/dashboard/add-order', '_blank')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> إضافة طلب
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar - سطر ثاني مكمل للشريط */}
            <div className="flex items-center gap-3 p-4 dark:bg-orange-900/20 shadow-sm overflow-x-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 1)', borderRadius: '0px', borderTopLeftRadius: '0px', borderTopRightRadius: '0px', borderBottomRightRadius: '0px', borderBottomLeftRadius: '0px' }}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                            {isIndeterminate ? <div className="h-2 w-2 rounded-sm bg-primary" /> : <div className={`h-4 w-4 border rounded-sm ${isAllSelected ? 'bg-primary border-primary' : 'border-slate-400'}`} />}
                            <span>تحديد</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleSelectAll(true)}>تحديد الكل</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleSelectAll(false)}>إلغاء التحديد</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6" />
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{selectedRows.length} محدد</span>
                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowDeleteConfirmDialog(true)} 
                        disabled={selectedRows.length === 0}
                        className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="h-4 w-4 mr-1" /> حذف
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAssignDriverDialog(true)}
                        disabled={selectedRows.length === 0 || !canAssignDriverToSelected}
                        title={!canAssignDriverToSelected ? 'يمكن تعيين السائق فقط للطلبات بحالة "بالانتظار" أو "تم استلام المال في الفرع"' : ''}
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Truck className="h-4 w-4 mr-1" /> تعيين سائق
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAssignMerchantDialog(true)}
                        disabled={selectedRows.length === 0}
                        className="hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Store className="h-4 w-4 mr-1" /> تعيين تاجر
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowChangeStatusDialog(true)}
                        disabled={selectedRows.length === 0}
                        className="hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowRightLeft className="h-4 w-4 mr-1" /> تغيير الحالة
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={selectedRows.length === 0} className="disabled:opacity-50 disabled:cursor-not-allowed">
                                <Printer className="h-4 w-4 mr-1" /> طباعة
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setModalState({ type: 'print' })} disabled={selectedRows.length === 0}>
                                <FileDown className="ml-2 h-4 w-4" /> طباعة بوالص (PDF)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowModernPolicyV2Dialog(true)} disabled={selectedRows.length === 0}>
                                <Printer className="ml-2 h-4 w-4" /> طباعة بوالص (ملونة)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowThermalLabelOptDialog(true)} disabled={selectedRows.length === 0}>
                                <Printer className="ml-2 h-4 w-4" /> طباعة حرارية (XP-301)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setModalState({ type: 'export' })}
                        disabled={selectedRows.length === 0}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-1" /> تصدير
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleExportExcel}
                        disabled={selectedRows.length === 0}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileDown className="h-4 w-4 mr-1" /> Excel
                    </Button>
                </div>

                {groupedOrders && (
                    <Button variant="ghost" size="sm" onClick={toggleAllGroups} className="mr-auto">
                        {areAllGroupsOpen ? 'طي المجموعات' : 'توسيع المجموعات'}
                    </Button>
                )}
            </div>
        </div>
    );
};
