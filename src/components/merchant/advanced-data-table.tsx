'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Filter,
  MoreHorizontal,
  Search,
  X,
} from 'lucide-react';
import { exportToExcel } from '@/lib/export-utils';
import Papa from 'papaparse';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface DataTableColumn<TData> {
  accessorKey: string;
  header: string;
  cell?: (row: TData) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
}

interface AdvancedDataTableProps<TData> {
  data: TData[];
  columns: DataTableColumn<TData>[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  actions?: (row: TData) => React.ReactNode;
  bulkActions?: (selectedRows: TData[]) => React.ReactNode;
  exportFilename?: string;
}

export function AdvancedDataTable<TData extends Record<string, any>>({
  data,
  columns: columnDefs,
  searchKey,
  searchPlaceholder = 'بحث...',
  onRowClick,
  enableRowSelection = false,
  onSelectionChange,
  actions,
  bulkActions,
  exportFilename = 'data',
}: AdvancedDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Build columns for react-table
  const columns = useMemo<ColumnDef<TData>[]>(() => {
    const cols: ColumnDef<TData>[] = [];

    // Row number column
    cols.push({
      id: 'rowNumber',
      header: () => <div className="text-center font-bold text-sm">#</div>,
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return (
          <div className="text-center font-semibold text-sm tabular-nums bg-muted/30 rounded px-2 py-1 mx-auto w-fit min-w-[2rem]">
            {pageIndex * pageSize + row.index + 1}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 60,
    });

    // Selection column
    if (enableRowSelection) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="تحديد الكل"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="تحديد الصف"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      });
    }

    // Data columns
    columnDefs.forEach((col) => {
      cols.push({
        accessorKey: col.accessorKey,
        header: ({ column }) => {
          if (col.enableSorting === false) {
            return <div className="text-right font-bold text-sm">{col.header}</div>;
          }
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="hover:bg-accent w-full justify-end h-auto py-1 px-2 -mx-2"
            >
              <span className="font-bold text-sm">{col.header}</span>
              <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
            </Button>
          );
        },
        cell: ({ row }) => {
          if (col.cell) {
            return col.cell(row.original);
          }
          return <div className="text-right">{row.getValue(col.accessorKey)}</div>;
        },
        enableSorting: col.enableSorting !== false,
        enableHiding: col.enableHiding !== false,
      });
    });

    // Actions column
    if (actions) {
      cols.push({
        id: 'actions',
        header: () => <div className="text-center font-bold">الإجراءات</div>,
        cell: ({ row }) => actions(row.original),
        enableSorting: false,
        enableHiding: false,
      });
    }

    return cols;
  }, [columnDefs, enableRowSelection, actions]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Handle selection change
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  // Export functions
  const handleExportExcel = async () => {
    const exportData = table.getFilteredRowModel().rows.map((row) => {
      const rowData: Record<string, any> = {};
      columnDefs.forEach((col) => {
        rowData[col.header] = row.original[col.accessorKey];
      });
      return rowData;
    });

    await exportToExcel(exportData, `${exportFilename}.xlsx`, 'Data');
  };

  const handleExportCSV = () => {
    const exportData = table.getFilteredRowModel().rows.map((row) => {
      const rowData: Record<string, any> = {};
      columnDefs.forEach((col) => {
        rowData[col.header] = row.original[col.accessorKey];
      });
      return rowData;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${exportFilename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pr-10"
            />
          </div>
          {globalFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGlobalFilter('')}
              className="h-10 w-10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {enableRowSelection && selectedRows.length > 0 && bulkActions && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedRows.length} محدد</Badge>
              {bulkActions(selectedRows)}
            </div>
          )}

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="ml-2 h-4 w-4" />
                الأعمدة
                <ChevronDown className="mr-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>إظهار/إخفاء الأعمدة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const columnDef = columnDefs.find((c) => c.accessorKey === column.id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {columnDef?.header || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel} className="text-green-600 hover:text-green-700">
                <FileSpreadsheet className="ml-2 h-4 w-4" />
                تصدير Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="text-blue-600 hover:text-blue-700">
                <Download className="ml-2 h-4 w-4" />
                تصدير CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header, headerIndex) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "text-right border-l last:border-l-0 font-bold py-3",
                      headerIndex === 0 || headerIndex === 1 ? "px-3" : "px-4"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    'border-b hover:bg-muted/30 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "border-l last:border-l-0 py-3",
                        cellIndex === 0 || cellIndex === 1 ? "px-3" : "px-4"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  لا توجد نتائج.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} من{' '}
          {table.getFilteredRowModel().rows.length} صف محدد
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">عدد الصفوف:</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              السابق
            </Button>
            <div className="text-sm">
              صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              التالي
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
