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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Printer className="h-4 w-4" />
          <span>طباعة / تصدير</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onThermalPrint} disabled={selectedRows.length === 0}>
          <Printer className="ml-2 h-4 w-4" /> طباعة حرارية
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onColorPrint} disabled={selectedRows.length === 0}>
          <Printer className="ml-2 h-4 w-4" /> طباعة ملونة
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onExportData}>
          <FileDown className="ml-2 h-4 w-4" />
          تصدير البيانات
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onExportExcel}>
          <FileSpreadsheet className="ml-2 h-4 w-4" /> تصدير Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

