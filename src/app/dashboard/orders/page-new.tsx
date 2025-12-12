'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Search, 
    Filter, 
    Grid3x3, 
    Settings, 
    Bell, 
    Languages,
    Zap,
    RefreshCw,
    FileText,
    Printer,
    BarChart3,
    Menu,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TooltipProvider } from '@/components/ui/tooltip';

import { useSettings } from '@/contexts/SettingsContext';
import { useOrdersTable } from '@/hooks/use-orders-table';
import { useStatusesStore } from '@/store/statuses-store';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';
import { useOrdersStore } from '@/store/orders-store';

import { OrdersTableToolbar } from '@/components/orders/orders-table-toolbar';
import { OrdersTableModals } from '@/components/orders/orders-table-modals';
import { OrdersTableView } from '@/components/orders/orders-table-view';
import { ModalState } from '@/components/orders/types';

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

const OrdersPageNew = () => {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const { statuses } = useStatusesStore();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [isClient, setIsClient] = useState(false);
    const context = useSettings();
    const { formatCurrency, settings } = context;

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Real-time updates for orders table
    useRealTimeOrders();

    // Get all orders from store for totals calculation
    const { orders: allOrders } = useOrdersStore();

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
        cities,
        visibleColumns,
        visibleColumnKeys,
        setVisibleColumnKeys,
        handleColumnDragEnd,
        handleColumnVisibilityChange
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
    const [showModernPolicyV2Dialog, setShowModernPolicyV2Dialog] = useState(false);
    const [showThermalLabelOptDialog, setShowThermalLabelOptDialog] = useState(false);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Calculate footer totals - تحسب من الصفوف المحددة فقط
    const footerTotals = React.useMemo(() => {
        // إذا كان هناك صفوف محددة، احسب المجاميع منها فقط
        // استخدم allOrders من الـ store لضمان إيجاد جميع الطلبات المحددة
        const ordersToCalculate = selectedRows.length > 0 
            ? allOrders.filter(order => selectedRows.includes(order.id))
            : orders; // إذا لم يكن هناك تحديد، استخدم الطلبات المرئية فقط
        
        if (!ordersToCalculate.length) return undefined;
        
        return ordersToCalculate.reduce((acc, order) => {
            acc.itemPrice += order.itemPrice || 0;
            acc.deliveryFee += order.deliveryFee || 0;
            acc.additionalCost += order.additionalCost || 0;
            acc.driverFee += order.driverFee || 0;
            acc.companyDue += (order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
            acc.cod += order.cod || 0;
            return acc;
        }, { itemPrice: 0, deliveryFee: 0, additionalCost: 0, driverFee: 0, companyDue: 0, cod: 0 });
    }, [orders, selectedRows, allOrders]);

    if (!isClient) {
        return null;
    }

    return (
        <TooltipProvider>
            {/* ============================================
               Layout الأساسي - كامل الارتفاع
               ============================================
               استخدام min-h-screen و flex-col لملء الشاشة بالكامل
            */}
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950" dir="rtl">
                
                {/* ============================================
                   الهيدر الثابت - في الأعلى
                   ============================================
                   يمكن تعديل الألوان هنا:
                   - bg-slate-800 (الخلفية الداكنة)
                   - text-white (النص الأبيض)
                */}
                <header className="sticky top-0 z-50 bg-slate-800 dark:bg-slate-900 text-white shadow-lg">
                    <div className="container mx-auto px-2 py-2">
                        <div className="flex items-center justify-between">
                            {/* الجانب الأيمن - الروابط */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Grid3x3 className="h-5 w-5" />
                                    <span className="text-sm font-medium">E Box 7.7.318</span>
                                </div>
                                <nav className="hidden md:flex items-center gap-4">
                                    <Button variant="ghost" className="text-white hover:bg-slate-700 h-auto py-1 px-2">
                                        الطلبيات
                                    </Button>
                                    <Button variant="ghost" className="text-white hover:bg-slate-700 h-auto py-1 px-2">
                                        لوحة المعلومات
                                    </Button>
                                    <Button variant="ghost" className="text-white hover:bg-slate-700 h-auto py-1 px-2">
                                        الكشوفات
                                    </Button>
                                    <Button variant="ghost" className="text-white hover:bg-slate-700 h-auto py-1 px-2">
                                        المستخدمون
                                    </Button>
                                    <Button variant="ghost" className="text-white hover:bg-slate-700 h-auto py-1 px-2">
                                        باركود
                                    </Button>
                                    <Button variant="ghost" className="text-white hover:bg-slate-700 h-auto py-1 px-2">
                                        لوحة الموزع
                                    </Button>
                                    <Button variant="ghost" className="text-white hover:bg-slate-700 h-auto py-1 px-2">
                                        التقارير
                                    </Button>
                                </nav>
                            </div>

                            {/* الجانب الأيسر - البحث والإعدادات */}
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-1.5">
                                    <Search className="h-4 w-4 text-gray-300" />
                                    <Input 
                                        placeholder="salahwh" 
                                        className="border-0 bg-transparent text-white placeholder:text-gray-300 h-auto p-0 w-32"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                                    <Languages className="h-5 w-5" />
                                </Button>
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
                                    A
                                </div>
                            </div>
                        </div>

                        {/* عنوان الصفحة */}
                        <div className="mt-4 flex items-center gap-3">
                            <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                            <h1 className="text-2xl font-bold text-white">جميع الطلبيات</h1>
                        </div>
                    </div>
                </header>

                {/* ============================================
                   شريط الفلاتر والأدوات
                   ============================================
                   يمكن تعديل الألوان هنا:
                   - bg-gray-100 (الخلفية الرمادية الفاتحة)
                   - dark:bg-slate-800 (الخلفية في الوضع الداكن)
                */}
                <div className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <div className="container mx-auto px-2 py-2">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            {/* الجانب الأيمن - البحث والفلاتر */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        placeholder="بحث..." 
                                        value={globalSearch}
                                        onChange={(e) => setGlobalSearch(e.target.value)}
                                        className="pr-10 bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <Button variant="outline" className="bg-white dark:bg-slate-900">
                                    <Filter className="h-4 w-4 ml-2" />
                                    الفلاتر
                                </Button>
                                <Button variant="outline" className="bg-white dark:bg-slate-900">
                                    <Menu className="h-4 w-4 ml-2" />
                                    تجميع حسب
                                </Button>
                                <Button variant="outline" className="bg-white dark:bg-slate-900">
                                    <FileText className="h-4 w-4 ml-2" />
                                    المفضلات
                                </Button>
                            </div>

                            {/* الجانب الأيسر - الأزرار والإجراءات */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Switch 
                                            id="editable" 
                                            checked={isEditMode}
                                            onCheckedChange={setIsEditMode}
                                        />
                                        <Label htmlFor="editable" className="text-sm cursor-pointer">قابل للتعديل</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch id="live" defaultChecked />
                                        <Label htmlFor="live" className="text-sm cursor-pointer">مباشر</Label>
                                    </div>
                                </div>
                                <Button 
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={() => setModalState({ type: 'add' })}
                                >
                                    <Zap className="h-4 w-4 ml-2" />
                                    إنشاء طلب سريع
                                </Button>
                                <Button 
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={() => setShowChangeStatusDialog(true)}
                                    disabled={selectedRows.length === 0}
                                >
                                    <RefreshCw className="h-4 w-4 ml-2" />
                                    تغيير الحالة
                                </Button>
                                <Button variant="outline" className="bg-yellow-100 hover:bg-yellow-200 border-yellow-300">
                                    <FileText className="h-4 w-4 ml-2" />
                                    إجراء
                                </Button>
                                <Button variant="outline" className="bg-yellow-100 hover:bg-yellow-200 border-yellow-300">
                                    <Printer className="h-4 w-4 ml-2" />
                                    طباعة
                                </Button>
                                <div className="hidden lg:flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="bg-white dark:bg-slate-900">
                                        <BarChart3 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="bg-white dark:bg-slate-900">
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                    <div className="relative">
                                        <Input 
                                            placeholder="الافتراضي" 
                                            className="w-32 bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" className="bg-white dark:bg-slate-900">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================
                   منطقة المحتوى الرئيسية - الجدول
                   ============================================
                   بدون بطاقات أو padding - استغلال كامل للمساحة
                   يمكن تعديل ارتفاع منطقة الجدول هنا:
                   - h-[calc(100vh-200px)] (مثال)
                   - أو استخدام flex-1 كما هو الحال
                */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                    {/* حاوية الجدول مع السكرول الداخلي - بدون padding أو borders */}
                    <div className="flex-1 overflow-auto">
                        <DndContext
                            sensors={sensors}
                            onDragEnd={handleColumnDragEnd}
                        >
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
                        </DndContext>
                    </div>

                    {/* ============================================
                       شريط التقليب (Pagination)
                       ============================================
                       ثابت في أسفل منطقة المحتوى - بدون padding زائد
                       يمكن تعديل الألوان هنا:
                       - bg-gray-50 (الخلفية الفاتحة)
                       - border-gray-200 (الحدود)
                    */}
                    <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-2 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {totalCount} / {((page - 1) * rowsPerPage) + 1}-{Math.min(page * rowsPerPage, totalCount)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(1)}
                                    disabled={page === 1 || isLoading}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1 || isLoading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                                    صفحة {page} من {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages || isLoading}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
                                    <SelectTrigger className="w-20 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="80">80</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <OrdersTableModals
                    modalState={modalState}
                    setModalState={setModalState}
                    showDeleteConfirmDialog={showDeleteConfirmDialog}
                    setShowDeleteConfirmDialog={setShowDeleteConfirmDialog}
                    showAssignDriverDialog={showAssignDriverDialog}
                    setShowAssignDriverDialog={setShowAssignDriverDialog}
                    selectedDriverForBulk={selectedDriverForBulk}
                    setSelectedDriverForBulk={setSelectedDriverForBulk}
                    drivers={drivers}
                    handleBulkAssignDriver={handleBulkAssignDriver}
                    showAssignMerchantDialog={showAssignMerchantDialog}
                    setShowAssignMerchantDialog={setShowAssignMerchantDialog}
                    selectedMerchantForBulk={selectedMerchantForBulk}
                    setSelectedMerchantForBulk={setSelectedMerchantForBulk}
                    merchants={merchants}
                    handleBulkAssignMerchant={handleBulkAssignMerchant}
                    showChangeStatusDialog={showChangeStatusDialog}
                    setShowChangeStatusDialog={setShowChangeStatusDialog}
                    selectedRows={selectedRows}
                    handleBulkChangeStatus={handleBulkChangeStatus}
                    statuses={statuses}
                />
            </div>
        </TooltipProvider>
    );
};

export default OrdersPageNew;
