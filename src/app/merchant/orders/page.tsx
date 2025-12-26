'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdvancedDataTable, DataTableColumn } from '@/components/merchant/advanced-data-table';
import { Eye, MoreHorizontal, Printer, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrdersStore } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';

interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  city: string;
  status: string;
  amount: number;
  date: string;
  items: string;
  notes?: string;
}

export default function MerchantOrdersPage() {
  const { toast } = useToast();
  const { settings, formatCurrency } = useSettings();
  const currencySymbol = settings.regional.currencySymbol;
  
  // استخدام البيانات الحقيقية من الـ store
  const { orders: storeOrders } = useOrdersStore();
  
  // تحويل البيانات الحقيقية لصيغة Order
  const orders: Order[] = useMemo(() => {
    return storeOrders.map(order => ({
      id: order.id,
      customer: order.recipient,
      phone: order.phone,
      address: order.address,
      city: order.city,
      status: order.status,
      amount: order.cod,
      date: order.date,
      items: order.notes || 'لا توجد تفاصيل',
      notes: order.notes,
    }));
  }, [storeOrders]);

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; bgColor: string; label: string }> = {
      'جديد': { color: 'text-purple-700', bgColor: 'bg-purple-100', label: 'جديد' },
      'قيد المعالجة': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'قيد المعالجة' },
      'قيد التوصيل': { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'قيد التوصيل' },
      'تم التوصيل': { color: 'text-green-700', bgColor: 'bg-green-100', label: 'تم التوصيل' },
      'ملغي': { color: 'text-red-700', bgColor: 'bg-red-100', label: 'ملغي' },
      'مرتجع': { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'مرتجع' },
    };
    return statusMap[status] || { color: 'text-gray-700', bgColor: 'bg-gray-100', label: status };
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: orders.length,
      new: orders.filter(o => o.status === 'جديد').length,
      inProgress: orders.filter(o => o.status === 'قيد المعالجة' || o.status === 'قيد التوصيل').length,
      delivered: orders.filter(o => o.status === 'تم التوصيل').length,
      cancelled: orders.filter(o => o.status === 'ملغي').length,
      returned: orders.filter(o => o.status === 'مرتجع').length,
      totalRevenue: orders.filter(o => o.status === 'تم التوصيل').reduce((sum, o) => sum + o.amount, 0),
    };
  }, [orders]);

  // Table columns
  const columns: DataTableColumn<Order>[] = [
    {
      accessorKey: 'id',
      header: 'رقم الطلب',
      cell: (row) => (
        <Link href={`/merchant/orders/${row.id}`} className="font-mono text-primary hover:underline font-medium">
          {row.id}
        </Link>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'العميل',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.customer}</div>
          <div className="text-sm text-muted-foreground" dir="ltr">{row.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'items',
      header: 'المنتجات',
      cell: (row) => (
        <div className="max-w-[200px]">
          <div className="truncate">{row.items}</div>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'العنوان',
      cell: (row) => (
        <div className="max-w-[250px]">
          <div className="truncate">{row.address}</div>
          <div className="text-sm text-muted-foreground">{row.city}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: (row) => {
        const statusInfo = getStatusInfo(row.status);
        return (
          <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'المبلغ',
      cell: (row) => (
        <div className="font-bold text-green-600" dir="ltr">
          {row.amount.toFixed(2)} {currencySymbol}
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'التاريخ',
      cell: (row) => (
        <div className="text-sm" dir="ltr">
          {row.date}
        </div>
      ),
    },
  ];

  const handleBulkDelete = (selectedOrders: Order[]) => {
    toast({
      title: 'تم الحذف',
      description: `تم حذف ${selectedOrders.length} طلب بنجاح`,
    });
  };

  const handleBulkPrint = (selectedOrders: Order[]) => {
    toast({
      title: 'جاري الطباعة',
      description: `جاري طباعة ${selectedOrders.length} طلب`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">طلباتي</h1>
          <p className="text-muted-foreground mt-1">إدارة ومتابعة جميع طلباتك</p>
        </div>
        <Button asChild>
          <Link href="/merchant/add-order">
            <Icon name="Plus" className="ml-2 h-4 w-4" />
            طلب جديد
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon name="Package" className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
              <p className="text-2xl font-bold mt-1">{stats.inProgress}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Icon name="Clock" className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">تم التوصيل</p>
              <p className="text-2xl font-bold mt-1">{stats.delivered}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold mt-1" dir="ltr">{stats.totalRevenue.toFixed(2)} {currencySymbol}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="DollarSign" className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Advanced Table */}
      <Card className="p-6">
        <AdvancedDataTable
          data={orders}
          columns={columns}
          searchPlaceholder="بحث برقم الطلب، اسم العميل، رقم الهاتف..."
          enableRowSelection={true}
          exportFilename="merchant_orders"
          actions={(row) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/merchant/orders/${row.id}`}>
                    <Eye className="ml-2 h-4 w-4" />
                    عرض التفاصيل
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="ml-2 h-4 w-4" />
                  تحميل الفاتورة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          bulkActions={(selectedRows) => (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkPrint(selectedRows)}
              >
                <Printer className="ml-2 h-4 w-4" />
                طباعة المحدد
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkDelete(selectedRows)}
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف المحدد
              </Button>
            </>
          )}
        />
      </Card>
    </div>
  );
}
