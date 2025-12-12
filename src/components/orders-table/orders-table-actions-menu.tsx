'use client';

import { Settings2, Truck, Store, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/icon';

interface OrdersTableActionsMenuProps {
  selectedRows: string[];
  onAssignDriver?: () => void;
  onAssignMerchant?: () => void;
  onDelete?: () => void;
}

export function OrdersTableActionsMenu({
  selectedRows,
  onAssignDriver,
  onAssignMerchant,
  onDelete,
}: OrdersTableActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1" disabled={selectedRows.length === 0}>
          <Icon name="Settings2" className="h-4 w-4" />
          <span>الإجراءات</span>
          {selectedRows.length > 0 && (
            <Badge variant="secondary" className="mr-1">{selectedRows.length}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>إجراءات على {selectedRows.length} طلب</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onAssignDriver}>
          <Truck className="ml-2 h-4 w-4" />
          تعيين لسائق
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAssignMerchant}>
          <Store className="ml-2 h-4 w-4" />
          تعيين لتاجر
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="ml-2 h-4 w-4" />
          حذف المحدد
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

