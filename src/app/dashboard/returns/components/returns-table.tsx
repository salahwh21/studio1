'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Order, useOrdersStore } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, PackageX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReturnsTableProps {
  orders: Order[];
  availableStatuses: string[];
}

export function ReturnsTable({ orders, availableStatuses }: ReturnsTableProps) {
  const { toast } = useToast();
  const { formatCurrency } = useSettings();
  const { statuses } = useStatusesStore();
  const { updateOrderField } = useOrdersStore();
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(orders.map((o) => o.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  };

  const handleBulkChangeStatus = async (newStatus: string) => {
    if (selectedRows.length === 0) return;
    try {
      await Promise.all(
        selectedRows.map((id) => updateOrderField(id, 'status', newStatus))
      );
      toast({
        title: 'تمت العملية بنجاح',
        description: `تم تحديث حالة ${selectedRows.length} طلب إلى "${newStatus}".`,
      });
      setSelectedRows([]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث حالة الطلبات.',
      });
    }
  };

  const getStatusColor = (statusName: string) => {
    return statuses.find((s) => s.name === statusName)?.color || '#808080';
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-white dark:bg-zinc-950">
        <PackageX className="h-12 w-12 mb-4 opacity-50" />
        <p>لا توجد طلبات لعرضها في هذه القائمة.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* Toolbar */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            محدد: {selectedRows.length} من {orders.length}
          </span>
          {selectedRows.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  إجراء جماعي (تغيير الحالة) <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleBulkChangeStatus(status)}
                  >
                    تغيير إلى "{status}"
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={
                    orders.length > 0 && selectedRows.length === orders.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="تحديد الكل"
                />
              </TableHead>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>السائق</TableHead>
              <TableHead>المستلم</TableHead>
              <TableHead>الحالة الحالية</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>المتجر</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className={
                  selectedRows.includes(order.id)
                    ? 'bg-primary/5'
                    : ''
                }
              >
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedRows.includes(order.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRow(order.id, !!checked)
                    }
                    aria-label={`تحديد طلب ${order.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{order.driver || 'غير معين'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{order.recipient}</span>
                    <span className="text-xs text-muted-foreground">
                      {order.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                    }}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold">
                  {formatCurrency(order.cod)}
                </TableCell>
                <TableCell>{order.merchant}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
