'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  isRowHighlighted?: (row: T) => boolean;
  emptyMessage?: string;
  className?: string;
  stickyHeader?: boolean;
  /** تحديد صفوف — Set من المفاتيح المحددة */
  selectedRows?: Set<string>;
  /** callback عند النقر على checkbox صف */
  onRowSelect?: (key: string) => void;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  sortKey,
  sortDir,
  onSort,
  onRowClick,
  isRowHighlighted,
  emptyMessage = 'لا توجد بيانات',
  className,
  stickyHeader = true,
  selectedRows,
  onRowSelect,
}: DataTableProps<T>) {
  const hasSelection = !!selectedRows && !!onRowSelect;

  return (
    <div className={cn('rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden', className)}>
      <Table>
        <TableHeader
          className={cn(
            'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-lg',
            stickyHeader && 'sticky top-0 z-10',
          )}
        >
          <TableRow className="hover:bg-transparent border-none">
            {/* عمود الرقم */}
            <TableHead className="w-12 text-center border-l border-white/20 bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600 text-white font-bold text-xs px-3">
              {hasSelection ? (
                <span className="text-white/80 text-xs font-bold">#</span>
              ) : '#'}
            </TableHead>
            {/* عمود checkbox التحديد */}
            {hasSelection && (
              <TableHead className="w-10 text-center border-l border-white/15 px-2">
              </TableHead>
            )}
            {columns.map(col => (
              <TableHead
                key={col.key}
                className={cn(
                  'text-white text-xs font-semibold px-4 py-3 border-l border-white/15',
                  col.sortable && onSort && 'cursor-pointer select-none',
                  col.headerClassName,
                )}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <span>{col.label}</span>
                  {col.sortable && onSort && (
                    sortKey === col.key
                      ? sortDir === 'asc'
                        ? <ArrowUp className="h-3 w-3 text-orange-300" />
                        : <ArrowDown className="h-3 w-3 text-orange-300" />
                      : <ArrowUpDown className="h-3 w-3 text-white/40" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1 + (hasSelection ? 1 : 0)}
                className="text-center text-muted-foreground py-16 text-sm"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => {
              const key = rowKey(row);
              const highlighted = isRowHighlighted?.(row);
              const isSelected = selectedRows?.has(key) ?? false;
              return (
                <TableRow
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-gray-200/80 dark:border-slate-700/80 transition-all duration-150',
                    'hover:bg-orange-50/60 dark:hover:bg-slate-800/60',
                    onRowClick && 'cursor-pointer',
                    isSelected && [
                      'bg-orange-50/80 dark:bg-orange-900/20',
                      'border-r-4 border-r-orange-400',
                    ],
                    highlighted && !isSelected && [
                      'bg-gradient-to-l from-orange-100 via-orange-50 to-white',
                      'dark:from-orange-900/40 dark:via-orange-900/20 dark:to-slate-900',
                      'border-r-4 border-r-orange-500 shadow-sm',
                    ],
                    !highlighted && !isSelected && index % 2 !== 0 && 'bg-slate-50/60 dark:bg-slate-800/20',
                  )}
                >
                  {/* رقم الصف */}
                  <TableCell className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums px-3 py-2.5 border-l border-gray-200/80 dark:border-slate-700/80 w-12">
                    {index + 1}
                  </TableCell>
                  {/* checkbox التحديد */}
                  {hasSelection && (
                    <TableCell className="w-10 px-2 py-2.5 text-center border-l border-gray-200/80 dark:border-slate-700/80">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onRowSelect!(key)}
                        onClick={e => e.stopPropagation()}
                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                    </TableCell>
                  )}
                  {columns.map(col => (
                    <TableCell
                      key={col.key}
                      className={cn('px-4 py-2.5 text-sm', col.className)}
                    >
                      {col.render ? col.render(row, index) : (row as any)[col.key] ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
