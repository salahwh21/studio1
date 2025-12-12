
import * as React from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowUpDown, ChevronDown, Check, Link as LinkIcon
} from 'lucide-react';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import Icon from '@/components/icon';
import { getStatusInfo } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { CopyableCell } from './cells/copyable-cell';
import { Order } from '@/store/orders-store';
import { ModalState, OrderSource } from './types';
import { SOURCE_ICONS } from './constants';
import { ColumnConfig } from '@/components/export-data-dialog';


interface OrdersTableViewProps {
    orders: Order[];
    groupedOrders: Record<string, Order[]> | null;
    openGroups: Record<string, boolean>;
    setOpenGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

    visibleColumns: ColumnConfig[];
    selectedRows: string[];
    handleSelectRow: (id: string, checked: boolean) => void;
    handleSelectAll: (checked: boolean | 'indeterminate') => void;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    handleSort: (key: keyof Order) => void;

    isEditMode: boolean;
    handleUpdateField: (id: string, field: keyof Order, value: any) => Promise<void>;

    cities: any[];
    merchants: any[];
    drivers: any[];

    isLoading: boolean;
    page: number;
    rowsPerPage: number;

    setModalState: (state: ModalState) => void;
    formatCurrency: (value: number) => string;
    footerTotals?: {
        itemPrice: number;
        deliveryFee: number;
        additionalCost: number;
        driverFee: number;
        companyDue: number;
        cod: number;
    };
    selectedRowsCount?: number;
    ordersCount?: number;
}

export const OrdersTableView = ({
    orders,
    groupedOrders,
    openGroups,
    setOpenGroups,
    visibleColumns,
    selectedRows,
    handleSelectRow,
    handleSelectAll,
    isAllSelected,
    isIndeterminate,
    handleSort,
    isEditMode,
    handleUpdateField,
    cities,
    merchants,
    drivers,
    isLoading,
    page,
    rowsPerPage,
    setModalState,
    formatCurrency,
    footerTotals,
    selectedRowsCount,
    ordersCount
}: OrdersTableViewProps) => {

    const renderOrderRow = (order: Order, index: number) => {
        return (
            <TableRow 
                key={order.id} 
                data-state={selectedRows.includes(order.id) ? 'selected' : ''} 
                className={`hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-all duration-200 border-b border-gray-200 dark:border-slate-700 group ${
                    selectedRows.includes(order.id) 
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-l-blue-500' 
                        : index % 2 === 0 
                            ? 'bg-white dark:bg-slate-900' 
                            : 'bg-gray-50/50 dark:bg-slate-800/30'
                }`}
            >
                <TableCell className={`sticky right-0 z-10 p-2 text-center border-l ${
                    selectedRows.includes(order.id)
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-l-orange-400'
                        : 'bg-white dark:bg-slate-900 border-l-gray-300 dark:border-l-slate-700'
                }`}>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-mono">{page * rowsPerPage + index + 1}</span>
                        <Checkbox
                            checked={selectedRows.includes(order.id)}
                            onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                        />
                    </div>
                </TableCell>
                {visibleColumns.map(col => {
                    const value = order[col.key as keyof Order];
                    let content: React.ReactNode;
                    switch (col.key) {
                        case 'id':
                            content = (
                                <CopyableCell value={value as string}>
                                    <Link href={`/dashboard/orders/${order.id}`} className="text-primary hover:underline font-medium">{value as string}</Link>
                                </CopyableCell>
                            );
                            break;
                        case 'source':
                            const IconC = SOURCE_ICONS[value as OrderSource] || LinkIcon;
                            const sourceColors: Record<string, { bg: string, text: string }> = {
                                'Shopify': { bg: '#dcfce7', text: '#166534' },
                                'Manual': { bg: '#e0e7ff', text: '#3730a3' },
                                'API': { bg: '#fce7f3', text: '#9f1239' },
                                'WooCommerce': { bg: '#f3e8ff', text: '#6b21a8' },
                            };
                            const colors = sourceColors[value as string] || { bg: '#f3f4f6', text: '#374151' };
                            content = (
                                <div
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                                    style={{ backgroundColor: colors.bg, color: colors.text }}
                                >
                                    <IconC className="h-3 w-3" />
                                    <span>{value as string}</span>
                                </div>
                            );
                            break;
                        case 'status':
                            const sInfo = getStatusInfo(value as string);
                            content = (
                                <button
                                    onClick={() => setModalState({
                                        type: 'changeStatus',
                                        orderId: order.id,
                                        currentStatus: order.status,
                                        currentDriver: order.driver
                                    })}
                                    disabled={!isEditMode}
                                    className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-4 py-2 rounded-lg w-[160px] mx-auto my-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-85 hover:-translate-y-0.5 hover:shadow-md"
                                    style={{
                                        backgroundColor: sInfo.color + '20',
                                        color: sInfo.color,
                                        border: `2px solid ${sInfo.color}`
                                    }}
                                >
                                    <Icon name={sInfo.icon as any} className="h-4 w-4" />
                                    <span>{sInfo.name}</span>
                                </button>
                            );
                            break;
                        case 'merchant':
                        case 'driver':
                            const options = col.key === 'merchant' ? merchants : drivers;
                            content = (
                                <div className="flex items-center justify-center w-full h-12 px-1 group">
                                    {isEditMode ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-10 text-right px-3 hover:bg-accent"
                                                >
                                                    <span className="truncate">{value as string}</span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[250px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="بحث..." className="text-right" />
                                                    <CommandList className="max-h-[300px]">
                                                        <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
                                                        <CommandGroup>
                                                            {options.map((item: any) => {
                                                                const displayName = item.storeName || item.name;
                                                                return (
                                                                    <CommandItem
                                                                        key={item.id}
                                                                        value={displayName}
                                                                        onSelect={() => {
                                                                            const selectedValue = col.key === 'merchant' ? displayName : item.name;
                                                                            handleUpdateField(order.id, col.key as unknown as keyof Order, selectedValue);
                                                                            setTimeout(() => document.body.click(), 100);
                                                                        }}
                                                                        className="text-right cursor-pointer"
                                                                    >
                                                                        <Check className={cn("ml-2 h-4 w-4", value === displayName ? "opacity-100" : "opacity-0")} />
                                                                        <span className="flex-1 text-right">{displayName}</span>
                                                                    </CommandItem>
                                                                );
                                                            })}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <CopyableCell value={value as string}>
                                            <span className='px-2 font-medium'>{value as string}</span>
                                        </CopyableCell>
                                    )}
                                </div>
                            );
                            break;
                        case 'previousStatus':
                            content = value ? <Badge variant="secondary">{value as string}</Badge> : '-';
                            break;
                        case 'companyDue':
                            content = formatCurrency((order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0)));
                            break;
                        case 'itemPrice':
                        case 'deliveryFee':
                        case 'driverFee':
                        case 'cod':
                        case 'additionalCost':
                        case 'driverAdditionalFare':
                            const numValue = value as number;
                            const isNegative = numValue < 0;
                            // تحويل الأرقام للإنجليزية
                            const formatNumber = (num: number) => {
                                return num.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                            };
                            content = (
                                <CopyableCell value={numValue}>
                                    <div className="flex items-center justify-center gap-2 px-2">
                                        {isEditMode ? (
                                            <>
                                                <Input
                                                    type="text"
                                                    defaultValue={formatNumber(numValue)}
                                                    onBlur={(e) => {
                                                        const cleanValue = e.target.value.replace(/[^\d.-]/g, '');
                                                        handleUpdateField(order.id, col.key as unknown as keyof Order, parseFloat(cleanValue) || 0);
                                                    }}
                                                    className={cn(
                                                        "h-10 text-center border-2 border-slate-300 rounded-lg focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500 bg-white hover:border-blue-400 font-semibold tabular-nums text-base mx-2",
                                                        isNegative ? "text-red-600" : "text-green-600"
                                                    )}
                                                    style={{ direction: 'ltr', width: 'auto', minWidth: '120px' }}
                                                />
                                                <span className="text-sm font-medium text-slate-600">د.أ</span>
                                            </>
                                        ) : (
                                            <div className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-md font-bold text-base tabular-nums",
                                                isNegative ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
                                            )}>
                                                <span>{formatNumber(numValue)}</span>
                                                <span className="text-sm font-medium">د.أ</span>
                                            </div>
                                        )}
                                    </div>
                                </CopyableCell>
                            );
                            break;
                        case 'city':
                            const allCities = cities.map(c => c.name);
                            content = (
                                <div className="flex items-center justify-center w-full h-12 px-1">
                                    {isEditMode ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-10 text-right px-3 hover:bg-accent"
                                                >
                                                    <span className="truncate">{value as string || 'اختر مدينة...'}</span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[250px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="بحث عن مدينة..." className="text-right" />
                                                    <CommandList className="max-h-[300px]">
                                                        <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
                                                        <CommandGroup>
                                                            {allCities.map((cityName: any, idx: number) => (
                                                                <CommandItem
                                                                    key={`${cityName}-${idx}`}
                                                                    value={cityName}
                                                                    onSelect={async () => {
                                                                        await handleUpdateField(order.id, 'city', cityName);
                                                                        if (order.region && order.city !== cityName) {
                                                                            await handleUpdateField(order.id, 'region', '');
                                                                        }
                                                                        setTimeout(() => document.body.click(), 100);
                                                                    }}
                                                                    className="text-right cursor-pointer"
                                                                >
                                                                    <Check className={cn("ml-2 h-4 w-4", value === cityName ? "opacity-100" : "opacity-0")} />
                                                                    <span className="flex-1 text-right">{cityName}</span>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <CopyableCell value={value as string}>
                                            <span className='px-2 font-medium'>{value as string}</span>
                                        </CopyableCell>
                                    )}
                                </div>
                            );
                            break;
                        case 'region':
                            // Get regions for the selected city
                            const selectedCity = cities.find(c => c.name === order.city);
                            const cityRegions = selectedCity?.areas || [];
                            content = (
                                <div className="flex items-center justify-center w-full h-12 px-1">
                                    {isEditMode ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-10 text-right px-3 hover:bg-accent"
                                                    disabled={!order.city}
                                                >
                                                    <span className="truncate">{value as string || (order.city ? 'اختر منطقة...' : 'اختر مدينة أولاً')}</span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[250px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="بحث عن منطقة..." className="text-right" />
                                                    <CommandList className="max-h-[300px]">
                                                        <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
                                                        <CommandGroup>
                                                            {cityRegions.map((area: any, idx: number) => (
                                                                <CommandItem
                                                                    key={`${area.id}-${idx}`}
                                                                    value={area.name}
                                                                    onSelect={() => {
                                                                        handleUpdateField(order.id, 'region', area.name);
                                                                        setTimeout(() => document.body.click(), 100);
                                                                    }}
                                                                    className="text-right cursor-pointer"
                                                                >
                                                                    <Check className={cn("ml-2 h-4 w-4", value === area.name ? "opacity-100" : "opacity-0")} />
                                                                    <span className="flex-1 text-right">{area.name}</span>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <CopyableCell value={value as string}>
                                            <span className='px-2 font-medium'>{value as string}</span>
                                        </CopyableCell>
                                    )}
                                </div>
                            );
                            break;
                        case 'date':
                            content = (
                                <CopyableCell value={value as string}>
                                    {isEditMode ? (
                                        <Input
                                            type="date"
                                            defaultValue={value as string}
                                            onChange={(e) => handleUpdateField(order.id, 'date', e.target.value)}
                                            className="h-10 text-center border-2 border-slate-300 rounded-lg focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500 bg-white hover:border-blue-400 mx-4 my-2 font-mono"
                                            dir="ltr"
                                            style={{ direction: 'ltr', width: 'calc(100% - 2rem)' }}
                                        />
                                    ) : (
                                        <div className="px-3 py-1.5 text-sm font-mono" dir="ltr" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
                                            {value as string}
                                        </div>
                                    )}
                                </CopyableCell>
                            );
                            break;
                        default:
                            // تحويل الأرقام للإنجليزية في كل الحقول
                            const convertToEnglishNumbers = (str: string) => {
                                const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
                                const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                                let result = str;
                                arabicNumbers.forEach((arabic, index) => {
                                    result = result.replace(new RegExp(arabic, 'g'), englishNumbers[index]);
                                });
                                return result;
                            };

                            const displayValue = convertToEnglishNumbers(value as string);
                            const isPhoneField = col.key === 'phone' || col.key === 'whatsapp';

                            content = (
                                <CopyableCell value={displayValue}>
                                    {isEditMode ? (
                                        <Input
                                            defaultValue={displayValue}
                                            onBlur={(e) => handleUpdateField(order.id, col.key as unknown as keyof Order, convertToEnglishNumbers(e.target.value))}
                                            className={cn(
                                                "h-10 text-center border-2 border-slate-300 rounded-lg focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500 bg-white hover:border-blue-400 mx-4 my-2",
                                                isPhoneField && "font-mono text-base"
                                            )}
                                            dir={isPhoneField ? "ltr" : "auto"}
                                            style={isPhoneField ? { direction: 'ltr', width: 'calc(100% - 2rem)' } : { width: 'calc(100% - 2rem)' }}
                                            placeholder={isPhoneField ? "0799-123-456" : ""}
                                        />
                                    ) : (
                                        <div
                                            className={cn(
                                                "px-3 py-1.5 text-sm",
                                                isPhoneField && "font-mono text-base"
                                            )}
                                            dir={isPhoneField ? "ltr" : "auto"}
                                            style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}
                                        >
                                            {displayValue}
                                        </div>
                                    )}
                                </CopyableCell>
                            );
                            break;
                    }
                    return (
                        <TableCell 
                            key={col.key} 
                            className="h-auto p-2 text-center border-l border-gray-200 dark:border-slate-700 text-sm bg-transparent group-hover:bg-blue-50/50 dark:group-hover:bg-slate-800/50 transition-colors"
                        >
                            {content}
                        </TableCell>
                    );
                })}
            </TableRow>
        )
    }

    // Valid sortable keys from Order type (exclude computed/virtual fields)
    const isValidSortKey = (key: string | keyof Order): key is keyof Order => {
        // Exclude non-Order fields that may appear in ColumnConfig
        if (key === 'id-link' || key === 'companyDue') return false;
        // All other keys should be valid Order keys
        return true;
    };

    return (
        <div className="flex-1 overflow-auto flex flex-col bg-white dark:bg-slate-900" style={{ pointerEvents: 'auto' }}>
            <Table style={{ pointerEvents: 'auto' }}>
                {/* رأس الجدول - ثابت في الأعلى: position: sticky; top: 0; */}
                <TableHeader className="sticky top-0 z-20 bg-[#1a1a2e] dark:bg-[#0a0e27] shadow-lg" style={{ pointerEvents: 'auto' }}>
                    <TableRow className="hover:bg-transparent border-none" style={{ pointerEvents: 'auto' }}>
                        <TableHead className="sticky right-0 z-30 p-2 text-center border-l border-white/30 w-24 bg-[#0a0e27] dark:bg-[#050710]">
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-sm font-bold text-white">#</span>
                                <Checkbox 
                                    onCheckedChange={handleSelectAll} 
                                    checked={isAllSelected} 
                                    indeterminate={isIndeterminate} 
                                    aria-label="Select all rows" 
                                    className='border-white data-[state=checked]:bg-white data-[state=checked]:text-orange-500' 
                                />
                            </div>
                        </TableHead>
                        {visibleColumns.map((col) => {
                            const handleSortClick = (e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // Skip invalid sort keys
                                if (!isValidSortKey(col.key)) {
                                    return;
                                }
                                
                                if (!col.sortable) {
                                    return;
                                }
                                
                                if (typeof handleSort === 'function') {
                                    handleSort(col.key as keyof Order);
                                }
                            };

                            return (
                                <TableHead 
                                    key={col.key} 
                                    className="p-2 text-center border-l border-white/30 bg-[#1a1a2e] dark:bg-[#0a0e27] text-white hover:bg-[#0f0f1e] dark:hover:bg-[#050710] transition-colors font-semibold text-sm"
                                    style={{ 
                                        minWidth: '200px', 
                                        cursor: col.sortable ? 'pointer' : 'default',
                                        pointerEvents: 'auto',
                                        position: 'relative',
                                        zIndex: 25
                                    }}
                                    onClick={col.sortable ? handleSortClick : undefined}
                                    onMouseDown={col.sortable ? (e) => {
                                        e.stopPropagation();
                                    } : undefined}
                                >
                                    {col.sortable ? (
                                        <div
                                            onClick={handleSortClick}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            className="text-white hover:bg-white/20 hover:text-white w-full p-0 h-auto font-bold cursor-pointer flex items-center justify-center gap-2"
                                            style={{ 
                                                pointerEvents: 'auto', 
                                                userSelect: 'none',
                                                position: 'relative',
                                                zIndex: 10,
                                                minHeight: '20px'
                                            }}
                                        >
                                            <span>{col.label}</span>
                                            <ArrowUpDown className="h-3 w-3 text-white/90" />
                                        </div>
                                    ) : (
                                        <span className='text-white font-bold'>{col.label}</span>
                                    )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                </TableHeader>
                {/* جسم الجدول - يتحرك رأسيًا فقط بين thead و tfoot */}
                <TableBody className="pb-10">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="sticky right-0 z-10 p-2 text-center border-l bg-card"><Skeleton className="h-5 w-16" /></TableCell>
                                {visibleColumns.map(col => <TableCell key={col.key} className="p-2 text-center border-l"><Skeleton className="h-5 w-full" /></TableCell>)}
                            </TableRow>
                        ))
                    ) : groupedOrders ? (
                        Object.entries(groupedOrders || {}).map(([groupKey, groupOrders], groupIndex) => {
                            const isGroupOpen = openGroups[groupKey] ?? false;
                            const groupTotals = groupOrders.reduce((acc, order) => {
                                acc.itemPrice += order.itemPrice || 0;
                                acc.deliveryFee += (order.deliveryFee || 0) + (order.additionalCost || 0);
                                acc.cod += order.cod || 0;
                                acc.companyDue += (order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
                                return acc;
                            }, { itemPrice: 0, deliveryFee: 0, cod: 0, companyDue: 0 });

                            const firstFinancialIndex = visibleColumns.findIndex(c => c.type && c.type.includes('financial'));
                            const colSpan = firstFinancialIndex !== -1 ? firstFinancialIndex : visibleColumns.length;

                            return (
                                <React.Fragment key={groupKey}>
                                    <TableRow 
                                        onClick={() => setOpenGroups(prev => ({ ...prev, [groupKey]: !isGroupOpen }))} 
                                        className={cn(
                                            "cursor-pointer font-semibold transition-colors border-b-2 border-gray-300 dark:border-slate-700",
                                            groupIndex % 2 === 0 
                                                ? "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-gray-900 dark:text-gray-100" 
                                                : "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100"
                                        )}
                                    >
                                        <TableCell className="p-0 border-l" colSpan={colSpan + 1}>
                                            <div className="flex items-center px-4 py-3">
                                                <ChevronDown className={cn("h-5 w-5 transition-transform ml-2", !isGroupOpen && "-rotate-90")} />
                                                <span>{groupKey || 'غير محدد'}</span><span className="text-sm opacity-90 mr-1">({groupOrders.length})</span>
                                            </div>
                                        </TableCell>
                                        {visibleColumns.slice(colSpan).map(col => {
                                            let totalValue = '';
                                            switch (col.key) {
                                                case 'itemPrice': totalValue = formatCurrency(groupTotals.itemPrice); break;
                                                case 'deliveryFee': totalValue = formatCurrency(groupOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0)); break;
                                                case 'additionalCost': totalValue = formatCurrency(groupOrders.reduce((s, o) => s + (o.additionalCost || 0), 0)); break;
                                                case 'driverFee': totalValue = formatCurrency(groupOrders.reduce((s, o) => s + (o.driverFee || 0), 0)); break;
                                                case 'driverAdditionalFare': totalValue = formatCurrency(groupOrders.reduce((s, o) => s + (o.driverAdditionalFare || 0), 0)); break;
                                                case 'companyDue': totalValue = formatCurrency(groupTotals.companyDue); break;
                                                case 'cod': totalValue = formatCurrency(groupTotals.cod); break;
                                                default: totalValue = '';
                                            }
                                            return <TableCell key={col.key} className="p-2 text-center border-l text-sm font-semibold">{totalValue}</TableCell>
                                        })}
                                    </TableRow>
                                    {isGroupOpen && groupOrders.map((order, index) => renderOrderRow(order, index))}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        orders.map((order, index) => renderOrderRow(order, index))
                    )}
                    
                    {/* سطر المجاميع - ثابت في الأسفل: position: sticky; bottom: 0; */}
                    {footerTotals && !groupedOrders && (
                        <TableRow className="sticky bottom-0 z-[99] bg-gray-100 dark:bg-slate-800 border-t-2 border-gray-400 dark:border-slate-600">
                            <TableCell 
                                className="sticky right-0 z-[100] p-2 text-center border-l-[rgb(243,244,246)] dark:border-l-[rgb(30,41,59)] bg-gray-100 dark:bg-slate-800 border-t-2 border-gray-400 dark:border-slate-600"
                            >
                                {/* عمود التحديد - فارغ */}
                            </TableCell>
                            {visibleColumns.map((col) => {
                                if (!footerTotals) return null;
                                let totalValue = '';
                                switch (col.key) {
                                    case 'itemPrice':
                                        totalValue = formatCurrency(footerTotals.itemPrice);
                                        break;
                                    case 'deliveryFee':
                                        totalValue = formatCurrency(footerTotals.deliveryFee);
                                        break;
                                    case 'additionalCost':
                                        totalValue = formatCurrency(footerTotals.additionalCost);
                                        break;
                                    case 'driverFee':
                                        totalValue = formatCurrency(footerTotals.driverFee);
                                        break;
                                    case 'driverAdditionalFare':
                                        totalValue = formatCurrency(0);
                                        break;
                                    case 'companyDue':
                                        totalValue = formatCurrency(footerTotals.companyDue);
                                        break;
                                    case 'cod':
                                        totalValue = formatCurrency(footerTotals.cod);
                                        break;
                                    default:
                                        totalValue = '';
                                }
                                return (
                                    <TableCell 
                                        key={col.key} 
                                        className="p-2 text-center border-l-[rgb(243,244,246)] dark:border-l-[rgb(30,41,59)] border-t-2 border-gray-400 dark:border-slate-600 text-sm font-bold bg-gray-100 dark:bg-slate-800"
                                    >
                                        {totalValue}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
