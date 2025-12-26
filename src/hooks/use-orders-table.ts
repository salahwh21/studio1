
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Order, useOrdersStore } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';
import { useUsersStore } from '@/store/user-store';
import { useAreas } from '@/hooks/use-areas';
import { FilterDefinition, OrderSortConfig } from '@/app/actions/get-orders';
import { GroupByOption } from '@/components/orders/types';
import { SEARCHABLE_FIELDS } from '@/components/orders/constants';

export const useOrdersTable = () => {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const { orders: storeOrders, isLoading: storeLoading, updateOrderField, deleteOrders } = useOrdersStore();
    const { statuses } = useStatusesStore();
    const { users } = useUsersStore();
    const { cities } = useAreas();

    const [orders, setOrders] = useState<Order[]>(storeOrders);
    const [totalCount, setTotalCount] = useState(storeOrders.length);
    const [isLoading, setIsLoading] = useState(storeLoading);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [sortConfig, setSortConfig] = useState<OrderSortConfig | null>(null);
    const [filters, setFilters] = useState<FilterDefinition[]>([]);
    const [globalSearch, setGlobalSearch] = useState('');
    const [groupByLevels, setGroupByLevels] = useState<GroupByOption[]>([]);
    const [dateGroupBy, setDateGroupBy] = useState<'day' | 'week' | 'month' | 'year' | null>(null);

    // Helper functions for backward compatibility
    const groupBy = groupByLevels[0] || null;
    const setGroupBy = (option: GroupByOption) => {
        if (option === null) {
            setGroupByLevels([]);
        } else {
            setGroupByLevels([option]);
        }
    };
    
    // إضافة مستوى تجميع جديد
    const addGroupByLevel = (option: GroupByOption) => {
        if (option && !groupByLevels.includes(option)) {
            setGroupByLevels(prev => [...prev, option]);
        }
    };
    
    // إزالة مستوى تجميع
    const removeGroupByLevel = (index: number) => {
        setGroupByLevels(prev => prev.filter((_, i) => i !== index));
    };

    // Selection State
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Grouping State
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Derived Data
    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
    const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);

    const searchableFields = useMemo(() => {
        // جلب أسماء المدن والمناطق (بدون تكرار)
        const cityNames = [...new Set(cities.map(c => c.name))];
        const regionNames = [...new Set(cities.flatMap(c => (c.regions || c.areas || []).map(r => r.name)))];
        
        return SEARCHABLE_FIELDS.map(field => {
            if (field.key === 'merchant') {
                return { ...field, options: merchants.map(m => m.storeName || m.name) };
            }
            if (field.key === 'status') {
                return { ...field, options: statuses.map(s => s.name) };
            }
            if (field.key === 'driver') {
                return { ...field, options: drivers.map(d => d.name) };
            }
            if (field.key === 'city') {
                return { ...field, options: cityNames };
            }
            if (field.key === 'region') {
                return { ...field, options: regionNames };
            }
            return field;
        });
    }, [merchants, statuses, drivers, cities]);

    // Sync with store - only update loading state
    useEffect(() => {
        setIsLoading(storeLoading);
    }, [storeLoading]);

    // Use useMemo for filtered orders instead of useState to prevent unnecessary re-renders
    const filteredOrders = useMemo(() => {
        if (storeLoading) return [];
        
        const statusFilter = searchParams.get('status');
        const driverFilter = searchParams.get('driver');

        let filtered = [...storeOrders];

        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter(o => o.status === statusFilter);
        }

        // Apply driver filter
        if (driverFilter) {
            filtered = filtered.filter(o => o.driver === driverFilter);
        }

        // Apply custom filters
        // تجميع الفلاتر حسب الحقل - الفلاتر من نفس الحقل تعمل بـ OR
        const filtersByField = filters.reduce((acc, filter) => {
            const field = filter.field;
            if (!acc[field]) acc[field] = [];
            acc[field].push(filter);
            return acc;
        }, {} as Record<string, typeof filters>);

        // تطبيق الفلاتر: بين الحقول المختلفة AND، داخل نفس الحقل OR
        Object.values(filtersByField).forEach(fieldFilters => {
            filtered = filtered.filter(order => {
                // إذا أي فلتر من نفس الحقل يطابق، نُبقي السجل (OR)
                return fieldFilters.some(filter => {
                    // فلتر البحث الشامل - يبحث في كل الحقول
                    if (filter.field === '_global') {
                        return Object.values(order).some(val =>
                            String(val).toLowerCase().includes(String(filter.value).toLowerCase())
                        );
                    }
                    const value = order[filter.field as keyof Order];
                    if (filter.operator === 'equals') return value === filter.value;
                    if (filter.operator === 'contains') return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                    return true;
                });
            });
        });

        // Apply global search
        if (globalSearch) {
            filtered = filtered.filter(order =>
                Object.values(order).some(val =>
                    String(val).toLowerCase().includes(globalSearch.toLowerCase())
                )
            );
        }

        // Apply sorting
        if (sortConfig) {
            filtered = [...filtered].sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle null/undefined values
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return 1;
                if (bValue == null) return -1;

                // Handle numbers
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending'
                        ? aValue - bValue
                        : bValue - aValue;
                }

                // Handle id field - extract numbers for proper numeric sorting
                if (sortConfig.key === 'id') {
                    const aNum = parseInt(String(aValue).replace(/\D/g, ''), 10) || 0;
                    const bNum = parseInt(String(bValue).replace(/\D/g, ''), 10) || 0;
                    return sortConfig.direction === 'ascending'
                        ? aNum - bNum
                        : bNum - aNum;
                }

                // Handle strings (including dates)
                const aStr = String(aValue).toLowerCase();
                const bStr = String(bValue).toLowerCase();

                if (sortConfig.direction === 'ascending') {
                    return aStr.localeCompare(bStr, 'ar');
                } else {
                    return bStr.localeCompare(aStr, 'ar');
                }
            });
        }

        return filtered;
    }, [storeOrders, storeLoading, filters, sortConfig, searchParams, globalSearch]);

    // Update orders and totalCount when filteredOrders change
    // Remove hash check - update immediately for any change
    useEffect(() => {
        setOrders([...filteredOrders]); // Create new array to trigger re-render
        setTotalCount(filteredOrders.length);
    }, [filteredOrders, sortConfig]);

    const fetchData = useCallback(() => {
        // Manual refresh - force re-sync with store
        setOrders([...filteredOrders]);
        setTotalCount(filteredOrders.length);
        
        // Show toast to confirm refresh
        toast({ 
            title: 'تم التحديث', 
            description: `تم تحديث ${filteredOrders.length} طلب`,
            duration: 2000
        });
    }, [filteredOrders, toast]);

    // Debounced effect for search and filters - removed to avoid double calls
    // Filters are now handled in the main useEffect above

    const handleSort = (key: keyof Order) => {
        if (sortConfig && sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                setSortConfig({ key, direction: 'descending' });
            } else {
                setSortConfig(null);
            }
        } else {
            setSortConfig({ key, direction: 'ascending' });
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        setSelectedRows(prev =>
            checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
        );
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            // Select all visible orders (or all orders? usually current page or all filtered)
            // Let's select all filtered orders as per likely original behavior
            setSelectedRows(orders.map(o => o.id));
        } else {
            setSelectedRows([]);
        }
    };

    const isAllSelected = orders.length > 0 && selectedRows.length === orders.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < orders.length;

    // Grouping Logic - دعم مستويات لا نهائية
    const groupedOrders = useMemo(() => {
        if (groupByLevels.length === 0) return null;
        
        // Helper function to get date group key
        const getDateGroupKey = (dateStr: string) => {
            if (!dateStr || !dateGroupBy) return dateStr || 'غير محدد';
            
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return dateStr;
                
                switch (dateGroupBy) {
                    case 'day':
                        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    case 'week': {
                        const startOfWeek = new Date(date);
                        startOfWeek.setDate(date.getDate() - date.getDay());
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6);
                        return `Week ${startOfWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                    }
                    case 'month':
                        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    case 'year':
                        return date.toLocaleDateString('en-US', { year: 'numeric' });
                    default:
                        return dateStr;
                }
            } catch {
                return dateStr || 'غير محدد';
            }
        };

        // Helper to get group key for any field
        const getGroupKey = (order: Order, field: GroupByOption): string => {
            if (!field) return 'غير محدد';
            if (field === 'date' && dateGroupBy) {
                return getDateGroupKey(String(order.date || ''));
            }
            return String(order[field] || 'غير محدد');
        };
        
        // Recursive function to create nested groups
        type NestedGroup = {
            orders: Order[];
            subGroups?: Record<string, NestedGroup>;
        };
        
        const createNestedGroups = (ordersList: Order[], levelIndex: number): Record<string, NestedGroup> | Record<string, Order[]> => {
            const currentField = groupByLevels[levelIndex];
            if (!currentField) return {};
            
            // Group by current level
            const grouped = ordersList.reduce((acc, order) => {
                const key = getGroupKey(order, currentField);
                if (!acc[key]) acc[key] = [];
                acc[key].push(order);
                return acc;
            }, {} as Record<string, Order[]>);
            
            // If this is the last level, return simple structure
            if (levelIndex === groupByLevels.length - 1) {
                return grouped;
            }
            
            // Otherwise, create nested structure
            const nestedResult: Record<string, NestedGroup> = {};
            Object.entries(grouped).forEach(([key, groupOrders]) => {
                nestedResult[key] = {
                    orders: groupOrders,
                    subGroups: createNestedGroups(groupOrders, levelIndex + 1) as Record<string, NestedGroup>
                };
            });
            
            return nestedResult;
        };
        
        return createNestedGroups(orders, 0);
    }, [orders, groupByLevels, dateGroupBy]);

    const areAllGroupsOpen = useMemo(() => {
        return groupedOrders && Object.keys(groupedOrders).length > 0 && Object.keys(groupedOrders).every(k => openGroups[k]);
    }, [groupedOrders, openGroups]);

    const toggleAllGroups = () => {
        if (areAllGroupsOpen) {
            setOpenGroups({});
        } else {
            const allOpen = Object.keys(groupedOrders || {}).reduce((acc, key) => ({ ...acc, [key]: true }), {});
            setOpenGroups(allOpen);
        }
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) return;
        try {
            await deleteOrders(selectedRows);
            setSelectedRows([]);
            toast({ title: 'تم الحذف', description: `تم حذف ${selectedRows.length} طلب بنجاح.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'فشل حذف الطلبات المحدد.' });
        }
    };

    // Note: Calling updateOrderField for many items might be slow if it handles one by one in store.
    // Ideally store should support bulk update. Assuming it does default loop if not available.
    // Since useOrdersStore is imported, I assume `updateOrderField` is for single item.
    // For now, loop is fine for "Urgent Improvements".
    const handleBulkUpdate = async (field: keyof Order, value: any) => {
        if (selectedRows.length === 0) return;
        try {
            // Optimistic update in local state for speed perception? 
            // Better to just call store updates and let them propagate.
            await Promise.all(selectedRows.map(id => updateOrderField(id, field, value)));
            toast({ title: 'تم التحديث', description: `تم تحديث ${selectedRows.length} طلب بنجاح.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث الطلبات المحدد.' });
        }
    };

    // Check if selected orders can have driver assigned (only "بالانتظار" or "تم استلام المال في الفرع")
    const canAssignDriverToSelected = useMemo(() => {
        if (selectedRows.length === 0) return false;
        const allowedStatuses = ['بالانتظار', 'تم استلام المال في الفرع'];
        return selectedRows.every(id => {
            const order = orders.find(o => o.id === id);
            return order && allowedStatuses.includes(order.status);
        });
    }, [selectedRows, orders]);

    const handleBulkAssignDriver = async (driverName: string) => {
        if (selectedRows.length === 0) return;
        
        // Filter only orders that can have driver assigned
        const allowedStatuses = ['بالانتظار', 'تم استلام المال في الفرع'];
        const assignableOrders = selectedRows.filter(id => {
            const order = orders.find(o => o.id === id);
            return order && allowedStatuses.includes(order.status);
        });

        if (assignableOrders.length === 0) {
            toast({ 
                variant: 'destructive', 
                title: 'خطأ', 
                description: 'لا يمكن تعيين سائق إلا للطلبات بحالة "بالانتظار" أو "تم استلام المال في الفرع"' 
            });
            return;
        }

        try {
            await Promise.all(assignableOrders.map(async (id) => {
                await updateOrderField(id, 'driver', driverName);
                await updateOrderField(id, 'status', 'بانتظار السائق');
            }));
            toast({ 
                title: 'تم التعيين', 
                description: `تم تعيين السائق لـ ${assignableOrders.length} طلب وتم تحديث الحالة إلى "بانتظار السائق".` 
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تعيين السائق.' });
        }
    };
    const handleBulkAssignMerchant = (merchantName: string) => handleBulkUpdate('merchant', merchantName);

    const handleBulkChangeStatus = async (newStatus: string) => {
        if (selectedRows.length === 0 || !newStatus) return;
        
        try {
            // TODO: Add validation rules based on requirements
            // For now, we'll update all selected orders to the new status
            await Promise.all(selectedRows.map(async (id) => {
                await updateOrderField(id, 'status', newStatus);
            }));
            toast({ 
                title: 'تم التغيير', 
                description: `تم تغيير حالة ${selectedRows.length} طلب إلى "${newStatus}".` 
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تغيير الحالة.' });
        }
    };

    const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

    return {
        orders,
        isLoading,
        totalCount,
        totalPages,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        sortConfig,
        setSortConfig,
        filters,
        setFilters,
        globalSearch,
        setGlobalSearch,
        groupBy,
        setGroupBy,
        groupByLevels,
        setGroupByLevels,
        addGroupByLevel,
        removeGroupByLevel,
        dateGroupBy,
        setDateGroupBy,
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
        handleRefresh: fetchData, // alias for manually triggering fetch
        handleUpdateField: async (id: string, field: keyof Order, value: any) => {
            updateOrderField(id, field, value);
        },
        handleBulkDelete,
        handleBulkAssignDriver,
        handleBulkAssignMerchant,
        handleBulkChangeStatus,
        canAssignDriverToSelected,
        searchableFields,
        merchants,
        drivers,
        cities
    };
};
