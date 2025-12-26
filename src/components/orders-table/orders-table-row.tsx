'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Phone, MapPin } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { CopyableCell } from './orders-table-copyable-cell';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import type { Order, ColumnConfig } from './types';

interface OrdersTableRowProps {
  order: Order;
  index: number;
  page: number;
  rowsPerPage: number;
  visibleColumns: ColumnConfig[];
  isEditMode: boolean;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onUpdateField: (orderId: string, field: keyof Order, value: any) => void;
  onChangeStatus: (orderId: string, currentStatus: string, currentDriver?: string) => void;
  getStatusInfo: (status: string) => { name: string; icon: string; color: string };
  drivers: Array<{ id: string; name: string }>;
  merchants: Array<{ id: string; name: string; storeName?: string }>;
  cities: Array<{ name: string; areas: Array<{ id: string; name: string }> }>;
  formatCurrency: (amount: number) => string;
  currencySymbol?: string;
}

export function OrdersTableRow({
  order,
  index,
  page,
  rowsPerPage,
  visibleColumns,
  isEditMode,
  isSelected,
  onSelect,
  onUpdateField,
  onChangeStatus,
  getStatusInfo,
  drivers,
  merchants,
  cities,
  formatCurrency,
  currencySymbol = 'د.أ',
}: OrdersTableRowProps) {
  const renderCellContent = (col: ColumnConfig) => {
    const value = order[col.key as keyof Order];
    let content: React.ReactNode;

    switch (col.key) {
      case 'id':
        content = (
          <CopyableCell value={value as string}>
            <Link href={`/dashboard/orders/${order.id}`} className="text-primary hover:underline font-medium">
              {value as string}
            </Link>
          </CopyableCell>
        );
        break;

      case 'source':
        const { sourceIcons } = require('./orders-table-constants');
        const IconC = sourceIcons[value as string] || require('lucide-react').Link;
        const sourceColors: Record<string, { bg: string; text: string }> = {
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
            onClick={() => onChangeStatus(order.id, order.status, order.driver)}
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
                  <Button variant="outline" className="w-full h-10 text-right px-3 hover:bg-accent">
                    <span className="truncate">{value as string}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="بحث..." className="text-right" />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
                      <CommandGroup>
                        {options.map(item => {
                          const displayName = (item as any).storeName || item.name;
                          return (
                            <CommandItem
                              key={item.id}
                              value={displayName}
                              onSelect={() => {
                                const selectedValue = col.key === 'merchant' ? displayName : item.name;
                                onUpdateField(order.id, col.key, selectedValue);
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
                      onUpdateField(order.id, col.key, parseFloat(cleanValue) || 0);
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
                  "flex items-center gap-2 px-3 py-1.5 rounded-md font-bold text-base tabular-nums",
                  isNegative ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
                )}>
                  <span>{formatNumber(numValue)}</span>
                  <span className="text-sm font-medium">{currencySymbol}</span>
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
                  <Button variant="outline" className="w-full h-10 text-right px-3 hover:bg-accent">
                    <span className="truncate">{value as string || 'اختر مدينة...'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="بحث عن مدينة..." className="text-right" />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
                      <CommandGroup>
                        {allCities.map((cityName, idx) => (
                          <CommandItem
                            key={`${cityName}-${idx}`}
                            value={cityName}
                            onSelect={async () => {
                              await onUpdateField(order.id, 'city', cityName);
                              if (order.region && order.city !== cityName) {
                                await onUpdateField(order.id, 'region', '');
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
                        {cityRegions.map((area, idx) => (
                          <CommandItem
                            key={`${area.id}-${idx}`}
                            value={area.name}
                            onSelect={() => {
                              onUpdateField(order.id, 'region', area.name);
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
                onChange={(e) => onUpdateField(order.id, 'date', e.target.value)}
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
                onBlur={(e) => onUpdateField(order.id, col.key, convertToEnglishNumbers(e.target.value))}
                className={cn(
                  "h-10 text-center border-2 border-slate-300 rounded-lg focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500 bg-white hover:border-blue-400 mx-4 my-2"
                )}
                dir={isPhoneField ? "ltr" : "auto"}
                style={isPhoneField ? { direction: 'ltr', width: 'calc(100% - 2rem)' } : { width: 'calc(100% - 2rem)' }}
                placeholder={isPhoneField ? "0799-123-456" : ""}
              />
            ) : (
              <div
                className="px-3 py-1.5 text-sm"
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

    return <TableCell key={col.key} className="h-12 p-0 text-center border-l text-sm">{content}</TableCell>;
  };

  return (
    <TableRow key={order.id} data-state={isSelected ? 'selected' : ''} className="hover:bg-muted/50">
      <TableCell className="sticky right-0 z-10 p-2 text-center border-l bg-card dark:bg-slate-900 data-[state=selected]:bg-primary/20">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-mono">{page * rowsPerPage + index + 1}</span>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(order.id, !!checked)}
          />
        </div>
      </TableCell>
      {visibleColumns.map(col => renderCellContent(col))}
    </TableRow>
  );
}

