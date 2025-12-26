'use client';

import { Printer, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrdersTableExportMenuProps {
  selectedRows: string[];
  onThermalPrint?: () => void;
  onColorPrint?: () => void;
  onExportData?: () => void;
  onExportExcel?: () => void;
}

export function OrdersTableExportMenu({
  selectedRows,
  onThermalPrint,
  onColorPrint,
  onExportData,
  onExportExcel,
}: OrdersTableExportMenuProps) {
  const hasSelection = selectedRows.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-50 transition-all">
          <Printer className="h-4 w-4" />
          <span>طباعة / تصدير</span>
          {hasSelection && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {selectedRows.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onSelect={onThermalPrint}
          disabled={!hasSelection}
          className="gap-2 cursor-pointer"
        >
          <Printer className="ml-2 h-4 w-4 text-orange-600" />
          <span>طباعة حرارية</span>
          {hasSelection && <span className="mr-auto text-xs text-muted-foreground">{selectedRows.length}</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={onColorPrint}
          disabled={!hasSelection}
          className="gap-2 cursor-pointer"
        >
          <Printer className="ml-2 h-4 w-4 text-purple-600" />
          <span>طباعة ملونة</span>
          {hasSelection && <span className="mr-auto text-xs text-muted-foreground">{selectedRows.length}</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onExportData} className="gap-2 cursor-pointer">
          <FileDown className="ml-2 h-4 w-4 text-blue-600" />
          <span>تصدير البيانات</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onExportExcel} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="ml-2 h-4 w-4 text-green-600" />
          <span>تصدير Excel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

