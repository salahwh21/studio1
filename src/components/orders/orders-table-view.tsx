
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
    groupedOrders: Record<string, Order[]> | Record<string, { orders: Order[], subGroups: Record<string, Order[]> }> | null;
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
    currencySymbol?: string;
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
    currencySymbol = 'د.أ',
    footerTotals,
    selectedRowsCount,
    ordersCount
}: OrdersTableViewProps) => {

    const renderOrderRow = (order: Order, index: number) => {
        const isSelected = selectedRows.includes(order.id);
        return (
            <TableRow 
                key={order.id} 
                data-state={isSelected ? 'selected' : ''} 
                className={`hover:bg-orange-50/60 dark:hover:bg-slate-800/60 transition-all duration-150 border-b border-gray-200/80 dark:border-slate-700/80 group ${
                    isSelected 
                        ? 'bg-gradient-to-l from-orange-100 via-orange-50 to-white dark:from-orange-900/40 dark:via-orange-900/20 dark:to-slate-900 border-r-4 border-r-orange-500 shadow-sm' 
                        : index % 2 === 0 
                            ? 'bg-white dark:bg-slate-900' 
                            : 'bg-slate-50/70 dark:bg-slate-800/40'
                }`}
            >
                <TableCell className={`sticky right-0 z-10 p-2 text-center border-l ${
                    isSelected
                        ? 'bg-orange-100 dark:bg-orange-900/60 border-l-orange-300'
                        : index % 2 === 0 
                            ? 'bg-white dark:bg-slate-900 border-l-gray-200 dark:border-l-slate-700'
                            : 'bg-slate-50 dark:bg-slate-800 border-l-gray-200 dark:border-l-slate-700'
                }`}>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 tabular-nums">{page * rowsPerPage + index + 1}</span>
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                            className="border-slate-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
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
                                    <Link 
                                        href={`/dashboard/orders/${order.id}`} 
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-semibold text-sm px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        {value as string}
                                    </Link>
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
                                    className="inline-flex items-center justify-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-full w-[150px] mx-auto transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg shadow-sm"
                                    style={{
                                        background: `linear-gradient(135deg, ${sInfo.color}30 0%, ${sInfo.color}15 100%)`,
                                        color: sInfo.color,
                                        border: `1.5px solid ${sInfo.color}60`,
                                        boxShadow: `0 2px 8px ${sInfo.color}25`
                                    }}
                                >
                                    <Icon name={sInfo.icon as any} className="h-3.5 w-3.5" />
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
                            const companyDueVal = (order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
                            const isCompanyDueNegative = companyDueVal < 0;
                            content = (
                                <div className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-sm tabular-nums",
                                    isCompanyDueNegative 
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                )}>
                                    <span>{formatCurrency(companyDueVal)}</span>
                                </div>
                            );
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
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const cleanValue = (e.target as HTMLInputElement).value.replace(/[^\d.-]/g, '');
                                                            handleUpdateField(order.id, col.key as unknown as keyof Order, parseFloat(cleanValue) || 0);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "h-10 text-center border-2 border-slate-300 rounded-lg focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500 bg-white hover:border-blue-400 font-semibold tabular-nums text-base mx-2",
                                                        isNegative ? "text-red-600" : "text-green-600"
                                                    )}
                                                    style={{ direction: 'ltr', width: 'auto', minWidth: '120px' }}
                                                />
                                                <span className="text-sm font-medium text-slate-600">{currencySymbol}</span>
                                            </>
                                        ) : (
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-sm tabular-nums",
                                                isNegative 
                                                    ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400" 
                                                    : "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                                            )}>
                                                <span>{formatNumber(numValue)}</span>
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{currencySymbol}</span>
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
                            // تنسيق التاريخ بالعربية
                            const formatArabicDate = (dateStr: string) => {
                                if (!dateStr) return '';
                                try {
                                    const date = new Date(dateStr);
                                    if (isNaN(date.getTime())) return dateStr;
                                    
                                    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                                    const monthsEn = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
                                    
                                    const day = date.getDate();
                                    const month = date.getMonth();
                                    const year = date.getFullYear();
                                    const hours = date.getHours().toString().padStart(2, '0');
                                    const minutes = date.getMinutes().toString().padStart(2, '0');
                                    const seconds = date.getSeconds().toString().padStart(2, '0');
                                    
                                    return `${day} ${monthsAr[month]}/ ${monthsEn[month]}، ${year} ${hours}:${minutes}:${seconds}`;
                                } catch {
                                    return dateStr;
                                }
                            };
                            
                            content = (
                                <CopyableCell value={value as string}>
                                    <div className="px-3 py-1.5 text-sm" dir="rtl">
                                        <span className="text-slate-700 dark:text-slate-300">
                                            {formatArabicDate(value as string)}
                                        </span>
                                    </div>
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
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleUpdateField(order.id, col.key as unknown as keyof Order, convertToEnglishNumbers((e.target as HTMLInputElement).value));
                                                }
                                            }}
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
                            className="h-auto p-1.5 text-center border-l border-gray-200/80 dark:border-slate-700/80 text-sm bg-transparent group-hover:bg-orange-50/40 dark:group-hover:bg-slate-800/40 transition-colors"
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
                <TableHeader className="sticky top-0 z-20 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-xl" style={{ pointerEvents: 'auto' }}>
                    <TableRow className="hover:bg-transparent border-none" style={{ pointerEvents: 'auto' }}>
                        <TableHead className="sticky right-0 z-30 p-2 text-center border-l border-white/20 w-24 bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600">
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-xs font-bold text-white">#</span>
                                <Checkbox 
                                    onCheckedChange={handleSelectAll} 
                                    checked={isAllSelected} 
                                    indeterminate={isIndeterminate} 
                                    aria-label="Select all rows" 
                                    className='border-white/80 data-[state=checked]:bg-white data-[state=checked]:text-orange-600 data-[state=checked]:border-white' 
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
                                    className="p-2 text-center border-l border-white/15 bg-transparent text-white hover:bg-white/10 transition-colors font-semibold text-xs"
                                    style={{ 
                                        minWidth: '180px', 
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
                                            className="text-white/95 hover:text-white w-full p-1 h-auto font-bold cursor-pointer flex items-center justify-center gap-1.5 rounded hover:bg-white/10 transition-all"
                                            style={{ 
                                                pointerEvents: 'auto', 
                                                userSelect: 'none',
                                                position: 'relative',
                                                zIndex: 10,
                                                minHeight: '24px'
                                            }}
                                        >
                                            <span>{col.label}</span>
                                            <ArrowUpDown className="h-3 w-3 text-orange-400" />
                                        </div>
                                    ) : (
                                        <span className='text-white/95 font-bold'>{col.label}</span>
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
                        // دالة تكرارية لعرض المجموعات المتداخلة بلا حدود
                        (() => {
                            type NestedGroup = {
                                orders: Order[];
                                subGroups?: Record<string, NestedGroup>;
                            };
                            
                            // ألوان مختلفة لكل مستوى
                            const levelColors = [
                                { bg: 'bg-blue-100 dark:bg-blue-900/30', hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/50' },
                                { bg: 'bg-orange-50 dark:bg-orange-900/20', hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30' },
                                { bg: 'bg-green-50 dark:bg-green-900/20', hover: 'hover:bg-green-100 dark:hover:bg-green-900/30' },
                                { bg: 'bg-purple-50 dark:bg-purple-900/20', hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30' },
                                { bg: 'bg-pink-50 dark:bg-pink-900/20', hover: 'hover:bg-pink-100 dark:hover:bg-pink-900/30' },
                            ];
                            
                            const renderNestedGroups = (
                                groups: Record<string, NestedGroup | Order[]>, 
                                level: number = 0, 
                                parentKey: string = ''
                            ): React.ReactNode[] => {
                                const firstFinancialIndex = visibleColumns.findIndex(c => c.type && c.type.includes('financial'));
                                const colSpan = firstFinancialIndex !== -1 ? firstFinancialIndex : visibleColumns.length;
                                const colorIndex = level % levelColors.length;
                                const paddingLeft = 16 + (level * 24); // زيادة المسافة مع كل مستوى
                                
                                return Object.entries(groups).map(([groupKey, groupData], groupIndex) => {
                                    const isNestedGroup = groupData && typeof groupData === 'object' && 'subGroups' in groupData;
                                    const groupOrders = isNestedGroup 
                                        ? (groupData as NestedGroup).orders 
                                        : (groupData as Order[]);
                                    const subGroups = isNestedGroup 
                                        ? (groupData as NestedGroup).subGroups 
                                        : null;
                                    
                                    const fullKey = parentKey ? `${parentKey}_${groupKey}` : groupKey;
                                    const isGroupOpen = openGroups[fullKey] ?? false;
                                    
                                    const groupTotals = groupOrders.reduce((acc, order) => {
                                        acc.itemPrice += order.itemPrice || 0;
                                        acc.deliveryFee += (order.deliveryFee || 0) + (order.additionalCost || 0);
                                        acc.cod += order.cod || 0;
                                        acc.companyDue += (order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
                                        return acc;
                                    }, { itemPrice: 0, deliveryFee: 0, cod: 0, companyDue: 0 });
                                    
                                    return (
                                        <React.Fragment key={fullKey}>
                                            <TableRow 
                                                onClick={() => setOpenGroups(prev => ({ ...prev, [fullKey]: !isGroupOpen }))} 
                                                className={cn(
                                                    "cursor-pointer font-semibold transition-colors border-b border-gray-200 dark:border-slate-600",
                                                    levelColors[colorIndex].bg,
                                                    levelColors[colorIndex].hover,
                                                    "text-gray-900 dark:text-gray-100"
                                                )}
                                            >
                                                <TableCell className="p-0 border-l" colSpan={colSpan + 1}>
                                                    <div 
                                                        className="flex items-center py-2"
                                                        style={{ paddingRight: `${paddingLeft}px` }}
                                                    >
                                                        <ChevronDown className={cn(
                                                            "transition-transform ml-2",
                                                            level === 0 ? "h-5 w-5" : "h-4 w-4",
                                                            !isGroupOpen && "-rotate-90"
                                                        )} />
                                                        <span className={level === 0 ? "text-base" : "text-sm"}>
                                                            {groupKey || 'غير محدد'}
                                                        </span>
                                                        <span className={cn(
                                                            "opacity-75 mr-1",
                                                            level === 0 ? "text-sm" : "text-xs"
                                                        )}>
                                                            ({groupOrders.length})
                                                        </span>
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
                                                    return (
                                                        <TableCell 
                                                            key={col.key} 
                                                            className={cn(
                                                                "p-2 text-center border-l font-semibold",
                                                                level === 0 ? "text-sm" : "text-xs"
                                                            )}
                                                        >
                                                            {totalValue}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                            
                                            {isGroupOpen && (
                                                subGroups && Object.keys(subGroups).length > 0
                                                    ? renderNestedGroups(subGroups as Record<string, NestedGroup>, level + 1, fullKey)
                                                    : groupOrders.map((order, index) => renderOrderRow(order, index))
                                            )}
                                        </React.Fragment>
                                    );
                                });
                            };
                            
                            // حساب المجاميع الكلية للمجموعات - إذا كان هناك تحديد نحسب منه فقط
                            const allGroupOrders = Object.values(groupedOrders as Record<string, NestedGroup | Order[]>).flatMap(group => {
                                if ('orders' in group) return (group as NestedGroup).orders;
                                return group as Order[];
                            });
                            
                            // إذا كان هناك صفوف محددة نحسب منها، وإلا نحسب من كل الطلبات
                            const ordersForTotal = selectedRows.length > 0 
                                ? allGroupOrders.filter(order => selectedRows.includes(order.id))
                                : allGroupOrders;
                            
                            const totalGroupTotals = ordersForTotal.reduce((acc, order) => {
                                acc.itemPrice += order.itemPrice || 0;
                                acc.deliveryFee += order.deliveryFee || 0;
                                acc.additionalCost += order.additionalCost || 0;
                                acc.driverFee += order.driverFee || 0;
                                acc.driverAdditionalFare += order.driverAdditionalFare || 0;
                                acc.cod += order.cod || 0;
                                acc.companyDue += (order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
                                return acc;
                            }, { itemPrice: 0, deliveryFee: 0, additionalCost: 0, driverFee: 0, driverAdditionalFare: 0, cod: 0, companyDue: 0 });
                            
                            return (
                                <>
                                    {renderNestedGroups(groupedOrders as Record<string, NestedGroup | Order[]>)}
                                    {/* سطر المجاميع الكلية للمجموعات */}
                                    <TableRow className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-t-2 border-slate-500 dark:border-slate-600">
                                        <TableCell 
                                            className="sticky right-0 z-10 p-3 text-center bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600 border-l border-white/20"
                                        >
                                            <span className="text-sm font-bold text-white">
                                                {selectedRows.length > 0 ? `المحدد (${selectedRows.length})` : 'المجموع الكلي'}
                                            </span>
                                        </TableCell>
                                        {visibleColumns.map((col, colIndex) => {
                                            let totalValue = '';
                                            switch (col.key) {
                                                case 'itemPrice': totalValue = formatCurrency(totalGroupTotals.itemPrice); break;
                                                case 'deliveryFee': totalValue = formatCurrency(totalGroupTotals.deliveryFee); break;
                                                case 'additionalCost': totalValue = formatCurrency(totalGroupTotals.additionalCost); break;
                                                case 'driverFee': totalValue = formatCurrency(totalGroupTotals.driverFee); break;
                                                case 'driverAdditionalFare': totalValue = formatCurrency(totalGroupTotals.driverAdditionalFare); break;
                                                case 'companyDue': totalValue = formatCurrency(totalGroupTotals.companyDue); break;
                                                case 'cod': totalValue = formatCurrency(totalGroupTotals.cod); break;
                                                default: totalValue = '';
                                            }
                                            const isFinancialCol = ['itemPrice', 'deliveryFee', 'additionalCost', 'driverFee', 'driverAdditionalFare', 'companyDue', 'cod'].includes(col.key);
                                            return (
                                                <TableCell 
                                                    key={col.key} 
                                                    className={cn(
                                                        "p-3 text-center border-l border-white/10 text-sm font-bold",
                                                        colIndex % 2 === 0 
                                                            ? "bg-slate-700/50 dark:bg-slate-800/50" 
                                                            : "bg-slate-600/50 dark:bg-slate-700/50"
                                                    )}
                                                >
                                                    {totalValue && isFinancialCol ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-orange-500 text-white text-sm font-bold shadow-md">
                                                            {totalValue}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">{totalValue}</span>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                </>
                            );
                        })()
                    ) : (
                        orders.map((order, index) => renderOrderRow(order, index))
                    )}
                    
                    {/* سطر المجاميع - ثابت في الأسفل: position: sticky; bottom: 0; */}
                    {footerTotals && !groupedOrders && (
                        <TableRow className="sticky bottom-0 z-10 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-t-2 border-slate-500 dark:border-slate-600 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
                            <TableCell 
                                className="sticky right-0 z-10 py-2 px-3 text-center bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600"
                            >
                                <span className="text-sm font-bold text-white">
                                    {selectedRowsCount && selectedRowsCount > 0 ? `المحدد (${selectedRowsCount})` : 'المجموع الكلي'}
                                </span>
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
                                const isFinancialCol = ['itemPrice', 'deliveryFee', 'additionalCost', 'driverFee', 'driverAdditionalFare', 'companyDue', 'cod'].includes(col.key);
                                return (
                                    <TableCell 
                                        key={col.key} 
                                        className="py-2 px-3 text-center text-sm font-bold bg-slate-700/50 dark:bg-slate-800/50"
                                    >
                                        {totalValue && isFinancialCol ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500 text-white text-sm font-bold shadow-md">
                                                {totalValue}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">{totalValue}</span>
                                        )}
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
