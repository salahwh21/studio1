'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrdersStore } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function DriverOrdersPage() {
  const { user } = useAuth();
  const { orders, updateOrderField } = useOrdersStore();
  const { formatCurrency } = useSettings();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  // طلبات السائق
  const myOrders = useMemo(() => {
    return orders.filter(o => o.driver === user?.name);
  }, [orders, user]);

  // تطبيق الفلاتر
  const filteredOrders = useMemo(() => {
    let filtered = myOrders;

    // فلتر حسب الحالة
    if (statusFilter !== 'all') {
      const statusMap: Record<string, string[]> = {
        pending: ['جاري التوصيل', 'بالانتظار'],
        delivered: ['تم التوصيل'],
        postponed: ['مؤجل'],
        returned: ['مرتجع'],
      };
      filtered = filtered.filter(o => statusMap[statusFilter]?.includes(o.status));
    }

    // فلتر حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(query) ||
        o.recipient.toLowerCase().includes(query) ||
        o.phone.includes(query) ||
        o.address.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      // ترتيب: النشطة أولاً، ثم حسب التاريخ
      const statusPriority: Record<string, number> = {
        'جاري التوصيل': 1,
        'بالانتظار': 2,
        'مؤجل': 3,
        'تم التوصيل': 4,
        'مرتجع': 5,
      };
      return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
    });
  }, [myOrders, statusFilter, searchQuery]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'تم التوصيل': 'bg-green-500',
      'جاري التوصيل': 'bg-blue-500',
      'بالانتظار': 'bg-yellow-500',
      'مؤجل': 'bg-orange-500',
      'مرتجع': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'تم التوصيل': 'PackageCheck',
      'جاري التوصيل': 'Truck',
      'بالانتظار': 'Clock',
      'مؤجل': 'CalendarClock',
      'مرتجع': 'Undo2',
    };
    return icons[status] || 'Package';
  };

  const handleUpdateStatus = () => {
    if (selectedOrder && newStatus) {
      updateOrderField(selectedOrder.id, 'status', newStatus);
      if (notes) {
        const currentNotes = selectedOrder.notes || '';
        const timestamp = new Date().toLocaleString('ar-JO');
        const updatedNotes = `${currentNotes}\n[${timestamp}] ${newStatus}: ${notes}`;
        updateOrderField(selectedOrder.id, 'notes', updatedNotes);
      }
      setUpdateDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      setNotes('');
    }
  };

  const openUpdateDialog = (order: any, status: string) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setUpdateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">طلباتي</h1>
        <p className="text-muted-foreground mt-1">
          إدارة ومتابعة جميع طلباتك
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Icon name="Search" className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم الطلب، اسم العميل، أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد التوصيل</SelectItem>
                <SelectItem value="delivered">تم التوصيل</SelectItem>
                <SelectItem value="postponed">مؤجلة</SelectItem>
                <SelectItem value="returned">مرتجعة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          عرض {filteredOrders.length} من {myOrders.length} طلب
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            <Icon name="X" className="ml-2 h-4 w-4" />
            مسح البحث
          </Button>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="Package" className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد طلبات'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0",
                    getStatusColor(order.status)
                  )}>
                    <Icon name={getStatusIcon(order.status)} className="h-6 w-6 text-white" />
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-lg">{order.recipient}</p>
                        <p className="text-sm text-muted-foreground">#{order.id}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">{formatCurrency(order.cod)}</p>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Phone" className="h-4 w-4" />
                        <a href={`tel:${order.phone}`} className="hover:text-primary" onClick={(e) => e.stopPropagation()}>
                          {order.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="MapPin" className="h-4 w-4" />
                        <span className="truncate">{order.region} - {order.address}</span>
                      </div>
                      {order.notes && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <Icon name="FileText" className="h-4 w-4 mt-0.5" />
                          <span className="text-xs line-clamp-2">{order.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${order.phone}`);
                        }}
                      >
                        <Icon name="Phone" className="ml-2 h-4 w-4" />
                        اتصال
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://maps.google.com/?q=${order.address}`);
                        }}
                      >
                        <Icon name="MapPin" className="ml-2 h-4 w-4" />
                        الموقع
                      </Button>
                      {(order.status === 'جاري التوصيل' || order.status === 'بالانتظار') && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 mr-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUpdateDialog(order, 'تم التوصيل');
                          }}
                        >
                          <Icon name="PackageCheck" className="ml-2 h-4 w-4" />
                          تم التوصيل
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder && !updateDialogOpen} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
            <DialogDescription>
              رقم الطلب: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">العميل:</span>
                  <span className="font-medium">{selectedOrder.recipient}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">الهاتف:</span>
                  <a href={`tel:${selectedOrder.phone}`} className="font-medium text-primary">
                    {selectedOrder.phone}
                  </a>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">المنطقة:</span>
                  <span className="font-medium">{selectedOrder.region}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">العنوان:</span>
                  <span className="font-medium text-left text-sm">{selectedOrder.address}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">المبلغ:</span>
                  <span className="font-bold text-lg">{formatCurrency(selectedOrder.cod)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">الحالة:</span>
                  <Badge>{selectedOrder.status}</Badge>
                </div>
                {selectedOrder.notes && (
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-2">ملاحظات:</span>
                    <p className="text-sm bg-accent p-3 rounded-lg whitespace-pre-wrap">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(`tel:${selectedOrder.phone}`)}
                >
                  <Icon name="Phone" className="ml-2 h-4 w-4" />
                  اتصال
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://maps.google.com/?q=${selectedOrder.address}`)}
                >
                  <Icon name="MapPin" className="ml-2 h-4 w-4" />
                  الموقع
                </Button>
              </div>

              {(selectedOrder.status === 'جاري التوصيل' || selectedOrder.status === 'بالانتظار') && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm font-medium">تحديث الحالة:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => openUpdateDialog(selectedOrder, 'تم التوصيل')}
                    >
                      <Icon name="PackageCheck" className="ml-2 h-4 w-4" />
                      تم التوصيل
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openUpdateDialog(selectedOrder, 'مؤجل')}
                    >
                      <Icon name="Clock" className="ml-2 h-4 w-4" />
                      تأجيل
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => openUpdateDialog(selectedOrder, 'مرتجع')}
                    >
                      <Icon name="Undo2" className="ml-2 h-4 w-4" />
                      إرجاع
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحديث حالة الطلب</DialogTitle>
            <DialogDescription>
              الحالة الجديدة: <Badge>{newStatus}</Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                placeholder="أضف ملاحظات حول سبب التحديث..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateStatus} className="flex-1">
                تأكيد التحديث
              </Button>
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
