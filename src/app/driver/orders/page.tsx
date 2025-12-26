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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

// أنواع التجميع
type GroupBy = 'none' | 'region' | 'merchant' | 'status';

// مكون بطاقة الطلب المحسن
interface OrderCardProps {
  order: any;
  formatCurrency: (value: number) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  onSelect: () => void;
  onUpdateStatus: (status: string) => void;
  compact?: boolean;
}

function OrderCard({ order, formatCurrency, getStatusColor, getStatusIcon, onSelect, onUpdateStatus, compact }: OrderCardProps) {
  const isActive = order.status === 'جاري التوصيل' || order.status === 'بالانتظار';
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);
  const [driverNote, setDriverNote] = useState('');
  
  // إنشاء رسالة واتساب بصيغة نظيفة
  const generateWhatsAppMessage = (customNote: string = '') => {
    const lines = [
      `رقم الطلب: #${order.id.slice(-6)}`,
      '',
      'معلومات المستلم',
      `الاسم: ${order.recipient}`,
      `الهاتف: ${order.phone}`,
      `العنوان: ${order.address ? order.address + ', ' : ''}${order.region}, ${order.city}`,
      '',
      `المبلغ المطلوب: ${formatCurrency(order.cod)}`,
    ];
    
    if (customNote.trim()) {
      lines.push('', `ملاحظات: ${customNote.trim()}`);
    }
    
    lines.push('', '- شكرا لتعاملكم معنا -');
    
    return encodeURIComponent(lines.join('\n'));
  };

  // فتح واتساب بدون رقم محدد - السائق يختار المستلم
  const openWhatsAppWithoutNumber = () => {
    const message = generateWhatsAppMessage(driverNote);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setWhatsappDialogOpen(false);
    setDriverNote('');
  };

  // فتح واتساب لرقم محدد (للاتصال السريع)
  const openWhatsAppDirect = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('962') ? cleanPhone : `962${cleanPhone.slice(1)}`;
    window.open(`https://wa.me/${phoneWithCode}`, '_blank');
  };
  
  return (
    <div
      className={cn(
        "bg-card rounded-xl border-2 transition-all hover:shadow-lg flex flex-col overflow-hidden",
        "p-3 w-[300px]",
        isActive ? "border-blue-300 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background" : "border-gray-200"
      )}
    >
      {/* السطر الأول: رقم الطلب + الحالة */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">#{order.id.slice(-6)}</span>
        <Badge className={cn("gap-1", getStatusColor(order.status))}>
          <Icon name={getStatusIcon(order.status)} className="h-3 w-3" />
          {order.status}
        </Badge>
      </div>

      {/* السطر الثاني: المرسل (التاجر) */}
      {order.merchant && (
        <div className="flex items-center justify-between mb-2 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="Store" className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-sm">{order.merchant}</span>
          </div>
          <div className="flex items-center gap-1">
            {order.merchantPhone && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-blue-600 hover:bg-blue-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${order.merchantPhone}`);
                  }}
                >
                  <Icon name="Phone" className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-green-600 hover:bg-green-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    openWhatsAppDirect(order.merchantPhone);
                  }}
                >
                  <Icon name="MessageCircle" className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* السطر الثالث: معلومات الزبون */}
      <div className="flex items-center justify-between mb-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Icon name="User" className="h-4 w-4 text-green-600" />
          <span className="font-bold">{order.recipient}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-blue-600 hover:bg-blue-100"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${order.phone}`);
            }}
          >
            <Icon name="Phone" className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-green-600 hover:bg-green-100"
            onClick={(e) => {
              e.stopPropagation();
              openWhatsAppDirect(order.phone);
            }}
          >
            <Icon name="MessageCircle" className="h-4 w-4" />
          </Button>
          {(order.lat && order.lng) || order.address ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-red-600 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                if (order.lat && order.lng) {
                  window.open(`https://maps.google.com/?q=${order.lat},${order.lng}`, '_blank');
                } else {
                  window.open(`https://maps.google.com/?q=${encodeURIComponent(order.address + ' ' + order.region)}`, '_blank');
                }
              }}
            >
              <Icon name="MapPin" className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* السطر الرابع: العنوان */}
      <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="Navigation" className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">{order.region}, {order.city}</p>
            {order.address && (
              <p className="text-muted-foreground text-xs">{order.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* السطر الخامس: المعلومات المالية */}
      <div className="mb-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-700 dark:text-green-300">قيمة التحصيل (COD)</span>
          <span className="text-2xl font-bold text-green-600">{formatCurrency(order.cod)}</span>
        </div>
        {order.deliveryFee !== undefined && (
          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
            <span>أجور التوصيل: {formatCurrency(order.deliveryFee)}</span>
            <span>للتاجر: {formatCurrency(order.itemPrice || 0)}</span>
          </div>
        )}
      </div>

      {/* الملاحظات إن وجدت */}
      {order.notes && (
        <div 
          className="mb-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setNotesDialogOpen(true);
          }}
        >
          <div className="flex items-start gap-2">
            <Icon name="AlertCircle" className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
            <p className="text-xs text-orange-700 dark:text-orange-300 line-clamp-1">{order.notes?.replace(/[\u200B-\u200D\uFEFF]/g, '')}</p>
            <Icon name="ChevronLeft" className="h-4 w-4 text-orange-400 shrink-0 mr-auto" />
          </div>
        </div>
      )}

      {/* نافذة عرض الملاحظات كاملة */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="AlertCircle" className="h-5 w-5 text-orange-500" />
              ملاحظات الطلب
            </DialogTitle>
            <DialogDescription>
              طلب #{order.id.slice(-6)} - {order.recipient}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200 whitespace-pre-wrap">
              {order.notes?.replace(/[\u200B-\u200D\uFEFF]/g, '')}
            </p>
          </div>
          <Button variant="outline" onClick={() => setNotesDialogOpen(false)} className="w-full">
            إغلاق
          </Button>
        </DialogContent>
      </Dialog>

      {/* مساحة مرنة لدفع الأزرار للأسفل */}
      <div className="flex-grow" />

      {/* السطر الأخير: أزرار الإجراءات */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {/* زر إرسال رسالة واتساب */}
        <Button
          variant="outline"
          className="h-10 gap-2 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
          onClick={(e) => {
            e.stopPropagation();
            setWhatsappDialogOpen(true);
          }}
        >
          <Icon name="MessageCircle" className="h-4 w-4" />
          واتساب
        </Button>

        {/* زر الإجراءات */}
        <Button
          variant="default"
          className="h-10 gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            setActionsDialogOpen(true);
          }}
        >
          <Icon name="Settings2" className="h-4 w-4" />
          الإجراءات
        </Button>
      </div>

      {/* نافذة الإجراءات */}
      <Dialog open={actionsDialogOpen} onOpenChange={setActionsDialogOpen}>
        <DialogContent className="max-w-sm" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Settings2" className="h-5 w-5 text-blue-600" />
              تحديث حالة الطلب
            </DialogTitle>
            <DialogDescription>
              طلب #{order.id.slice(-6)} - {order.recipient}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-12 bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => {
                onUpdateStatus('تم التوصيل');
                setActionsDialogOpen(false);
              }}
            >
              <Icon name="CheckCircle" className="h-5 w-5" />
              تم التوصيل
            </Button>
            <Button
              variant="outline"
              className="h-12 border-orange-300 text-orange-600 hover:bg-orange-50 gap-2"
              onClick={() => {
                onUpdateStatus('مؤجل');
                setActionsDialogOpen(false);
              }}
            >
              <Icon name="Clock" className="h-5 w-5" />
              مؤجل
            </Button>
            <Button
              variant="outline"
              className="h-12 border-amber-300 text-amber-600 hover:bg-amber-50 gap-2"
              onClick={() => {
                onUpdateStatus('رسوم');
                setActionsDialogOpen(false);
              }}
            >
              <Icon name="Banknote" className="h-5 w-5" />
              رسوم
            </Button>
            <Button
              variant="outline"
              className="h-12 border-red-300 text-red-600 hover:bg-red-50 gap-2"
              onClick={() => {
                onUpdateStatus('رفض');
                setActionsDialogOpen(false);
              }}
            >
              <Icon name="XCircle" className="h-5 w-5" />
              رفض
            </Button>
            <Button
              variant="outline"
              className="h-12 border-purple-300 text-purple-600 hover:bg-purple-50 gap-2"
              onClick={() => {
                onUpdateStatus('بعد التوصيل');
                setActionsDialogOpen(false);
              }}
            >
              <Icon name="Timer" className="h-5 w-5" />
              بعد التوصيل
            </Button>
            <Button
              variant="outline"
              className="h-12 border-cyan-300 text-cyan-600 hover:bg-cyan-50 gap-2"
              onClick={() => {
                onUpdateStatus('توصيل جزئي');
                setActionsDialogOpen(false);
              }}
            >
              <Icon name="PackageMinus" className="h-5 w-5" />
              توصيل جزئي
            </Button>
            <Button
              variant="outline"
              className="h-12 border-indigo-300 text-indigo-600 hover:bg-indigo-50 gap-2 col-span-2"
              onClick={() => {
                onUpdateStatus('تبديل');
                setActionsDialogOpen(false);
              }}
            >
              <Icon name="RefreshCw" className="h-5 w-5" />
              تبديل
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setActionsDialogOpen(false)}
          >
            إلغاء
          </Button>
        </DialogContent>
      </Dialog>

      {/* نافذة إرسال رسالة واتساب */}
      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="MessageCircle" className="h-5 w-5 text-green-600" />
              إرسال تفاصيل الطلب
            </DialogTitle>
            <DialogDescription>
              أضف ملاحظاتك ثم اختر من تريد إرسال الرسالة له
            </DialogDescription>
          </DialogHeader>
          
          {/* معاينة الرسالة */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm space-y-1 border">
            <p className="font-bold">رقم الطلب: #{order.id.slice(-6)}</p>
            <p className="text-muted-foreground mt-2">معلومات المستلم</p>
            <p>الاسم: {order.recipient}</p>
            <p>الهاتف: {order.phone}</p>
            <p>العنوان: {order.address ? order.address + ', ' : ''}{order.region}, {order.city}</p>
            <p className="mt-2 font-bold text-green-600">المبلغ المطلوب: {formatCurrency(order.cod)}</p>
            {driverNote && (
              <p className="mt-2 text-orange-600">ملاحظات: {driverNote}</p>
            )}
            <p className="text-center text-muted-foreground mt-3">- شكرا لتعاملكم معنا -</p>
          </div>

          {/* حقل ملاحظات السائق */}
          <div className="space-y-2">
            <Label htmlFor="driverNote">ملاحظاتك (اختياري)</Label>
            <Textarea
              id="driverNote"
              placeholder="أضف ملاحظاتك هنا..."
              value={driverNote}
              onChange={(e) => setDriverNote(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* أزرار الإرسال */}
          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 gap-2"
              onClick={openWhatsAppWithoutNumber}
            >
              <Icon name="Send" className="h-4 w-4" />
              إرسال عبر واتساب
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setWhatsappDialogOpen(false);
                setDriverNote('');
              }}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
  const [groupBy, setGroupBy] = useState<GroupBy>('region');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

  // طلبات السائق
  const myOrders = useMemo(() => {
    return orders.filter(o => o.driver === user?.name);
  }, [orders, user]);

  // الحصول على المناطق والتجار الفريدين
  const uniqueRegions = useMemo(() => {
    return [...new Set(myOrders.map(o => o.region).filter(Boolean))];
  }, [myOrders]);

  const uniqueMerchants = useMemo(() => {
    return [...new Set(myOrders.map(o => o.merchant).filter(Boolean))];
  }, [myOrders]);

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
        o.address.toLowerCase().includes(query) ||
        o.region?.toLowerCase().includes(query) ||
        o.merchant?.toLowerCase().includes(query)
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

  // تجميع الطلبات
  const groupedOrders = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups: Record<string, typeof filteredOrders> = {};
    
    filteredOrders.forEach(order => {
      let key = '';
      switch (groupBy) {
        case 'region':
          key = order.region || 'بدون منطقة';
          break;
        case 'merchant':
          key = order.merchant || 'بدون تاجر';
          break;
        case 'status':
          key = order.status || 'بدون حالة';
          break;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(order);
    });

    return Object.entries(groups)
      .map(([name, orders]) => ({
        name,
        orders,
        totalCod: orders.reduce((sum, o) => sum + (o.cod || 0), 0),
        pendingCount: orders.filter(o => o.status === 'جاري التوصيل' || o.status === 'بالانتظار').length,
      }))
      .sort((a, b) => b.pendingCount - a.pendingCount);
  }, [filteredOrders, groupBy]);

  // فتح/إغلاق المجموعات
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  // فتح جميع المجموعات افتراضياً
  useEffect(() => {
    if (groupedOrders) {
      setExpandedGroups(new Set(groupedOrders.map(g => g.name)));
    }
  }, [groupBy]);

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
    <div className="space-y-4 pb-20">
      {/* Header with Stats */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 pt-2 pb-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold">طلباتي</h1>
            <p className="text-sm text-muted-foreground">
              {filteredOrders.length} طلب • {filteredOrders.filter(o => o.status === 'جاري التوصيل' || o.status === 'بالانتظار').length} قيد التوصيل
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('cards')}
            >
              <Icon name="LayoutGrid" className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <Icon name="List" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <Badge 
            variant={statusFilter === 'all' ? 'default' : 'outline'} 
            className="cursor-pointer shrink-0 py-1.5 px-3"
            onClick={() => setStatusFilter('all')}
          >
            الكل ({myOrders.length})
          </Badge>
          <Badge 
            variant={statusFilter === 'pending' ? 'default' : 'outline'} 
            className="cursor-pointer shrink-0 py-1.5 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-200"
            onClick={() => setStatusFilter('pending')}
          >
            <Icon name="Truck" className="h-3 w-3 ml-1" />
            قيد التوصيل ({myOrders.filter(o => o.status === 'جاري التوصيل' || o.status === 'بالانتظار').length})
          </Badge>
          <Badge 
            variant={statusFilter === 'delivered' ? 'default' : 'outline'} 
            className="cursor-pointer shrink-0 py-1.5 px-3 bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-200"
            onClick={() => setStatusFilter('delivered')}
          >
            <Icon name="PackageCheck" className="h-3 w-3 ml-1" />
            تم ({myOrders.filter(o => o.status === 'تم التوصيل').length})
          </Badge>
          <Badge 
            variant={statusFilter === 'postponed' ? 'default' : 'outline'} 
            className="cursor-pointer shrink-0 py-1.5 px-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border-orange-200"
            onClick={() => setStatusFilter('postponed')}
          >
            <Icon name="Clock" className="h-3 w-3 ml-1" />
            مؤجل ({myOrders.filter(o => o.status === 'مؤجل').length})
          </Badge>
          <Badge 
            variant={statusFilter === 'returned' ? 'default' : 'outline'} 
            className="cursor-pointer shrink-0 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-200"
            onClick={() => setStatusFilter('returned')}
          >
            <Icon name="Undo2" className="h-3 w-3 ml-1" />
            مرتجع ({myOrders.filter(o => o.status === 'مرتجع').length})
          </Badge>
        </div>
      </div>

      {/* Search and Group */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Icon name="Search" className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم، الهاتف، المنطقة، التاجر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <Icon name="X" className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Group By Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-sm text-muted-foreground shrink-0">تجميع:</span>
          <div className="flex gap-1">
            {[
              { value: 'none', label: 'بدون', icon: 'List' },
              { value: 'region', label: 'المنطقة', icon: 'MapPin' },
              { value: 'merchant', label: 'التاجر', icon: 'Store' },
              { value: 'status', label: 'الحالة', icon: 'Tag' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={groupBy === option.value ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 h-8"
                onClick={() => setGroupBy(option.value as GroupBy)}
              >
                <Icon name={option.icon as any} className="h-3.5 w-3.5 ml-1" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
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
        ) : groupBy === 'none' ? (
          // عرض بدون تجميع
          filteredOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              onSelect={() => setSelectedOrder(order)}
              onUpdateStatus={(status) => openUpdateDialog(order, status)}
            />
          ))
        ) : (
          // عرض مع تجميع
          groupedOrders?.map((group) => (
            <Collapsible
              key={group.name}
              open={expandedGroups.has(group.name)}
              onOpenChange={() => toggleGroup(group.name)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          groupBy === 'region' ? 'bg-blue-100 text-blue-600' :
                          groupBy === 'merchant' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        )}>
                          <Icon 
                            name={groupBy === 'region' ? 'MapPin' : groupBy === 'merchant' ? 'Store' : 'Tag'} 
                            className="h-5 w-5" 
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{group.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {group.orders.length} طلب • {group.pendingCount} قيد التوصيل
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <p className="font-bold text-green-600">{formatCurrency(group.totalCod)}</p>
                          <p className="text-xs text-muted-foreground">المجموع</p>
                        </div>
                        <Icon 
                          name={expandedGroups.has(group.name) ? 'ChevronUp' : 'ChevronDown'} 
                          className="h-5 w-5 text-muted-foreground" 
                        />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-2 pt-0">
                    <ScrollArea className="w-full" orientation="horizontal">
                      <div className="flex gap-3 pb-3">
                        {group.orders.map((order) => (
                          <div key={order.id} className="w-[320px] flex-shrink-0">
                            <OrderCard 
                              order={order} 
                              formatCurrency={formatCurrency}
                              getStatusColor={getStatusColor}
                              getStatusIcon={getStatusIcon}
                              onSelect={() => setSelectedOrder(order)}
                              onUpdateStatus={(status) => openUpdateDialog(order, status)}
                              compact
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
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
