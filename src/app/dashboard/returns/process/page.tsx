'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building, 
  Package,
  Search,
  Filter,
  RefreshCw,
  Undo2,
  Calendar,
  XCircle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import { useOrdersStore, type Order } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';
import { cn } from '@/lib/utils';

type ActionType = 'redistribute' | 'return-merchant' | 'postpone' | 'cancel';

export default function ProcessReturnsPage() {
  const { toast } = useToast();
  const { orders, updateOrderField } = useOrdersStore();
  const { statuses } = useStatusesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get orders in branch (مرجع للفرع)
  const branchOrders = useMemo(() => {
    return orders.filter(o => o.status === 'مرجع للفرع');
  }, [orders]);

  // Get unique merchants
  const merchants = useMemo(() => {
    const merchantSet = new Set(branchOrders.map(o => o.merchant));
    return Array.from(merchantSet).filter(Boolean);
  }, [branchOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = branchOrders;
    
    if (selectedMerchant !== 'all') {
      filtered = filtered.filter(o => o.merchant === selectedMerchant);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phone.includes(searchQuery) ||
        o.merchant.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [branchOrders, selectedMerchant, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = branchOrders.length;
    const totalCOD = branchOrders.reduce((sum, o) => sum + o.cod, 0);
    const byMerchant = new Map<string, number>();
    
    branchOrders.forEach(o => {
      byMerchant.set(o.merchant, (byMerchant.get(o.merchant) || 0) + 1);
    });

    return { totalOrders, totalCOD, byMerchant };
  }, [branchOrders]);

  const handleAction = (order: Order, action: ActionType) => {
    setSelectedOrder(order);
    setActionType(action);
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedOrder || !actionType) return;

    let newStatus = '';
    let message = '';

    switch (actionType) {
      case 'redistribute':
        newStatus = 'بالانتظار';
        message = 'تم إعادة الطلب للتوصيل';
        break;
      case 'return-merchant':
        newStatus = 'مرجع للتاجر';
        message = 'تم تحويل الطلب لمرتجعات التاجر';
        break;
      case 'postpone':
        newStatus = 'مؤجل';
        message = 'تم تأجيل الطلب';
        break;
      case 'cancel':
        newStatus = 'ملغي';
        message = 'تم إلغاء الطلب';
        break;
    }

    updateOrderField(selectedOrder.id, 'previousStatus', selectedOrder.status);
    updateOrderField(selectedOrder.id, 'status', newStatus);
    if (notes) {
      updateOrderField(selectedOrder.id, 'notes', notes);
    }

    toast({
      title: 'تم بنجاح',
      description: message
    });

    setIsDialogOpen(false);
    setSelectedOrder(null);
    setActionType(null);
    setNotes('');
  };

  const getStatusColor = (statusName: string) => {
    return statuses.find(s => s.name === statusName)?.color || '#808080';
  };

  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case 'redistribute': return RefreshCw;
      case 'return-merchant': return Undo2;
      case 'postpone': return Calendar;
      case 'cancel': return XCircle;
    }
  };

  const getActionLabel = (action: ActionType) => {
    switch (action) {
      case 'redistribute': return 'إعادة للتوصيل';
      case 'return-merchant': return 'إرجاع للتاجر';
      case 'postpone': return 'تأجيل';
      case 'cancel': return 'إلغاء';
    }
  };

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case 'redistribute': return 'bg-blue-600 hover:bg-blue-700';
      case 'return-merchant': return 'bg-purple-600 hover:bg-purple-700';
      case 'postpone': return 'bg-orange-600 hover:bg-orange-700';
      case 'cancel': return 'bg-red-600 hover:bg-red-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building className="h-8 w-8 text-primary" />
            معالجة المرتجعات في الفرع
          </h1>
          <p className="text-muted-foreground mt-2">معالجة الطلبات المستلمة من السائقين</p>
        </div>
        <Link href="/dashboard/returns">
          <Button variant="outline">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">في الفرع</p>
                <p className="text-3xl font-bold mt-1" dir="ltr">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-950">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبالغ</p>
                <p className="text-2xl font-bold mt-1" dir="ltr">{stats.totalCOD.toFixed(2)} <span className="text-sm">د.أ</span></p>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-950">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عدد التجار</p>
                <p className="text-3xl font-bold mt-1" dir="ltr">{stats.byMerchant.size}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-950">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="بحث برقم الطلب، المستلم، الهاتف، أو التاجر..." 
                  className="pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="جميع التجار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التجار</SelectItem>
                {merchants.map(merchant => (
                  <SelectItem key={merchant} value={merchant}>
                    {merchant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            الطلبات في الفرع
          </CardTitle>
          <CardDescription>
            اختر الإجراء المناسب لكل طلب
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">لا توجد طلبات في الفرع</p>
              <p className="text-sm mt-2">جميع الطلبات تمت معالجتها</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Order Info */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-lg">{order.recipient}</p>
                              <p className="text-sm text-muted-foreground">{order.phone}</p>
                            </div>
                            <Badge 
                              style={{ 
                                backgroundColor: getStatusColor(order.status),
                                color: 'white'
                              }}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">رقم الطلب:</span>
                              <p className="font-mono font-bold">#{order.id}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">التاجر:</span>
                              <p className="font-bold">{order.merchant}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">المبلغ:</span>
                              <p className="font-bold" dir="ltr">{order.cod.toFixed(2)} د.أ</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">الحالة السابقة:</span>
                              <p className="text-sm">{order.previousStatus}</p>
                            </div>
                          </div>

                          <div className="text-sm">
                            <span className="text-muted-foreground">العنوان:</span>
                            <p>{order.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleAction(order, 'redistribute')}
                        >
                          <RefreshCw className="h-4 w-4 ml-2" />
                          إعادة للتوصيل
                        </Button>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleAction(order, 'return-merchant')}
                        >
                          <Undo2 className="h-4 w-4 ml-2" />
                          إرجاع للتاجر
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(order, 'postpone')}
                        >
                          <Calendar className="h-4 w-4 ml-2" />
                          تأجيل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleAction(order, 'cancel')}
                        >
                          <XCircle className="h-4 w-4 ml-2" />
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType && React.createElement(getActionIcon(actionType), { className: "h-5 w-5" })}
              {actionType && getActionLabel(actionType)}
            </DialogTitle>
            <DialogDescription>
              تأكيد الإجراء للطلب #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedOrder && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">المستلم:</span>
                  <span className="font-bold">{selectedOrder.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">التاجر:</span>
                  <span className="font-bold">{selectedOrder.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">المبلغ:</span>
                  <span className="font-bold" dir="ltr">{selectedOrder.cod.toFixed(2)} د.أ</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                placeholder="أضف ملاحظات حول هذا الإجراء..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleConfirmAction}
              className={actionType ? getActionColor(actionType) : ''}
            >
              <CheckCircle2 className="h-4 w-4 ml-2" />
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
