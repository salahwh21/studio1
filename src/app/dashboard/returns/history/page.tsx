'use client';

import { useState, useMemo } from 'react';
import { 
  FileText, 
  Search,
  Calendar,
  Package,
  DollarSign,
  Printer,
  Eye,
  ArrowLeft,
  Users,
  Building,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useReturnsStore } from '@/store/returns-store';
import { useStatusesStore } from '@/store/statuses-store';
import { cn } from '@/lib/utils';

export default function ReturnsHistoryPage() {
  const { driverReturnSlips } = useReturnsStore();
  const { statuses } = useStatusesStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  // Get unique drivers from slips
  const drivers = useMemo(() => {
    const driverSet = new Set(driverReturnSlips.map(s => s.driverName));
    return Array.from(driverSet);
  }, [driverReturnSlips]);

  // Filter slips
  const filteredSlips = useMemo(() => {
    let filtered = driverReturnSlips;
    
    if (selectedDriver) {
      filtered = filtered.filter(s => s.driverName === selectedDriver);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.driverName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [driverReturnSlips, selectedDriver, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSlips = driverReturnSlips.length;
    const totalOrders = driverReturnSlips.reduce((sum, s) => sum + s.itemCount, 0);
    const totalCOD = driverReturnSlips.reduce((sum, s) => 
      sum + s.orders.reduce((orderSum, o) => orderSum + o.cod, 0), 0
    );

    return { totalSlips, totalOrders, totalCOD };
  }, [driverReturnSlips]);

  const getStatusColor = (statusName: string) => {
    return statuses.find(s => s.name === statusName)?.color || '#808080';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handlePrintSlip = (slipId: string) => {
    // TODO: Implement print functionality
    console.log('Print slip:', slipId);
  };

  const slip = selectedSlip ? driverReturnSlips.find(s => s.id === selectedSlip) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            سجل استلام المرتجعات
          </h1>
          <p className="text-muted-foreground mt-2">عرض جميع سندات الاستلام السابقة</p>
        </div>
        <Link href="/dashboard/returns">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للاستلام
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي السندات</p>
                <p className="text-3xl font-bold mt-1" dir="ltr">{stats.totalSlips}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-950">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
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
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                  placeholder="بحث برقم السند أو اسم السائق..." 
                  className="pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedDriver || "all"} onValueChange={(value) => setSelectedDriver(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="جميع السائقين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع السائقين</SelectItem>
                {drivers.map(driver => (
                  <SelectItem key={driver} value={driver}>
                    {driver}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Slips List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            سندات الاستلام
          </CardTitle>
          <CardDescription>
            جميع سندات استلام المرتجعات من السائقين
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSlips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">لا توجد سندات استلام</p>
              <p className="text-sm mt-2">لم يتم إنشاء أي سندات استلام بعد</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredSlips.map(slip => {
                  const totalCOD = slip.orders.reduce((sum, o) => sum + o.cod, 0);
                  
                  return (
                    <Card key={slip.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-lg">#{slip.id}</h3>
                                  <Badge variant="secondary">
                                    <Users className="h-3 w-3 ml-1" />
                                    {slip.driverName}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(slip.date)}
                                </p>
                              </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">عدد الطلبات</p>
                                  <p className="font-bold">{slip.itemCount}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">إجمالي المبلغ</p>
                                  <p className="font-bold" dir="ltr">{totalCOD.toFixed(2)} د.أ</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">الحالة</p>
                                  <Badge variant="default" className="bg-purple-600">
                                    مرجع للفرع
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedSlip(slip.id)}>
                                  <Eye className="h-4 w-4 ml-2" />
                                  عرض
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    سند استلام #{slip.id}
                                  </DialogTitle>
                                  <DialogDescription>
                                    تفاصيل سند الاستلام من السائق {slip.driverName}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {slip && (
                                  <div className="space-y-4 py-4">
                                    {/* Slip Info */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                      <div>
                                        <p className="text-sm text-muted-foreground">رقم السند</p>
                                        <p className="font-bold">{slip.id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">السائق</p>
                                        <p className="font-bold">{slip.driverName}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">التاريخ</p>
                                        <p className="font-bold">{formatDate(slip.date)}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">عدد الطلبات</p>
                                        <p className="font-bold">{slip.itemCount}</p>
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Orders List */}
                                    <div>
                                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        الطلبات المستلمة
                                      </h4>
                                      <ScrollArea className="h-[300px]">
                                        <div className="space-y-2">
                                          {slip.orders.map(order => (
                                            <div key={order.id} className="p-3 bg-muted/50 rounded-lg">
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold">{order.recipient}</p>
                                                    <Badge 
                                                      style={{ 
                                                        backgroundColor: getStatusColor(order.status),
                                                        color: 'white'
                                                      }}
                                                      className="text-xs"
                                                    >
                                                      {order.status}
                                                    </Badge>
                                                  </div>
                                                  <p className="text-sm text-muted-foreground">#{order.id}</p>
                                                  <p className="text-sm text-muted-foreground mt-1">{order.phone}</p>
                                                </div>
                                                <p className="font-bold" dir="ltr">{order.cod.toFixed(2)} د.أ</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </ScrollArea>
                                    </div>

                                    <Separator />

                                    {/* Summary */}
                                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold">الإجمالي:</span>
                                        <span className="text-2xl font-bold" dir="ltr">
                                          {totalCOD.toFixed(2)} د.أ
                                        </span>
                                      </div>
                                    </div>

                                    <Button className="w-full" onClick={() => handlePrintSlip(slip.id)}>
                                      <Printer className="h-4 w-4 ml-2" />
                                      طباعة السند
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => handlePrintSlip(slip.id)}>
                              <Printer className="h-4 w-4 ml-2" />
                              طباعة
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
