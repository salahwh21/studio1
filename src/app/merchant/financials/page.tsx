'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Clock,
  TrendingUp,
  Download,
  FileText,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { AdvancedDataTable, DataTableColumn } from '@/components/merchant/advanced-data-table';
import { useSettings } from '@/contexts/SettingsContext';
import { useOrdersStore } from '@/store/orders-store';

interface Transaction {
  id: string;
  type: 'إيداع' | 'سحب' | 'عمولة';
  amount: number;
  date: string;
  status: 'مكتمل' | 'قيد المعالجة' | 'ملغي';
  description: string;
  reference?: string;
}

interface Invoice {
  id: string;
  period: string;
  amount: number;
  status: 'مدفوع' | 'قيد الانتظار' | 'متأخر';
  dueDate: string;
  paidDate?: string;
  orders: number;
}

export default function MerchantFinancialsPage() {
  const [period, setPeriod] = useState('month');
  const { orders: allOrders } = useOrdersStore();
  const { settings, formatCurrency } = useSettings();
  const currencySymbol = settings.regional.currencySymbol;

  // حساب المعاملات من الطلبات الحقيقية
  const transactions: Transaction[] = useMemo(() => {
    const txns: Transaction[] = [];
    let txnCounter = 1;
    
    // تجميع الطلبات المكتملة حسب التاريخ
    const deliveredOrders = allOrders
      .filter(o => o.status === 'تم التوصيل')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // إنشاء معاملات إيداع (كل 5 طلبات)
    for (let i = 0; i < deliveredOrders.length; i += 5) {
      const batch = deliveredOrders.slice(i, i + 5);
      const totalAmount = batch.reduce((sum, o) => sum + (o.cod || 0), 0);
      const commission = totalAmount * 0.05;
      
      if (batch.length > 0) {
        const batchDate = batch[0].date;
        const batchId = `BATCH-${txnCounter}`;
        
        // إيداع
        txns.push({
          id: `TXN-${String(txnCounter).padStart(3, '0')}`,
          type: 'إيداع',
          amount: totalAmount,
          date: `${batchDate} 10:00`,
          status: 'مكتمل',
          description: 'دفعة من الطلبات المكتملة',
          reference: batchId,
        });
        
        // عمولة
        txns.push({
          id: `TXN-${String(txnCounter + 1).padStart(3, '0')}`,
          type: 'عمولة',
          amount: -commission,
          date: `${batchDate} 10:00`,
          status: 'مكتمل',
          description: 'عمولة المنصة (5%)',
          reference: batchId,
        });
        
        txnCounter += 2;
      }
    }
    
    return txns.slice(0, 20); // آخر 20 معاملة
  }, [allOrders]);

  const invoices: Invoice[] = useMemo(() => {
    // تجميع الطلبات حسب الشهر
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthlyData: Record<string, { orders: number; revenue: number; month: number; year: number }> = {};
    
    allOrders.forEach(order => {
      if (order.status === 'تم التوصيل') {
        const orderDate = new Date(order.date);
        const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            orders: 0,
            revenue: 0,
            month: orderDate.getMonth(),
            year: orderDate.getFullYear(),
          };
        }
        
        monthlyData[monthKey].orders += 1;
        monthlyData[monthKey].revenue += order.cod || 0;
      }
    });
    
    return Object.entries(monthlyData)
      .map(([key, data], index) => ({
        id: `INV-${String(index + 1).padStart(3, '0')}`,
        period: `${months[data.month]} ${data.year}`,
        amount: data.revenue,
        status: 'مدفوع' as const,
        dueDate: `${data.year}-${String(data.month + 1).padStart(2, '0')}-28`,
        paidDate: `${data.year}-${String(data.month + 1).padStart(2, '0')}-30`,
        orders: data.orders,
      }))
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
      .slice(0, 12); // آخر 12 شهر
  }, [allOrders]);

  // Financial stats from real data
  const stats = useMemo(() => {
    const deliveredOrders = allOrders.filter(o => o.status === 'تم التوصيل');
    const totalEarned = deliveredOrders.reduce((sum, o) => sum + (o.cod || 0), 0);
    const platformFees = totalEarned * 0.05;
    const totalWithdrawn = 0; // يمكن تتبعه من معاملات السحب
    const currentBalance = totalEarned - platformFees - totalWithdrawn;
    
    // حساب الرصيد المعلق (طلبات قيد التوصيل)
    const pendingOrders = allOrders.filter(o => o.status === 'جاري التوصيل' || o.status === 'قيد التوصيل');
    const pendingBalance = pendingOrders.reduce((sum, o) => sum + (o.cod || 0), 0);
    
    return {
      currentBalance,
      pendingBalance,
      totalWithdrawn,
      totalEarned,
      platformFees,
      nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextPaymentAmount: pendingBalance,
    };
  }, [allOrders]);

  // Transaction columns
  const transactionColumns: DataTableColumn<Transaction>[] = [
    {
      accessorKey: 'id',
      header: 'رقم المعاملة',
      cell: (row) => <span className="font-mono font-medium">{row.id}</span>,
    },
    {
      accessorKey: 'type',
      header: 'النوع',
      cell: (row) => {
        const colors = {
          'إيداع': 'bg-green-100 text-green-700',
          'سحب': 'bg-red-100 text-red-700',
          'عمولة': 'bg-orange-100 text-orange-700',
        };
        return <Badge className={`${colors[row.type]} border-0`}>{row.type}</Badge>;
      },
    },
    {
      accessorKey: 'description',
      header: 'الوصف',
    },
    {
      accessorKey: 'amount',
      header: 'المبلغ',
      cell: (row) => (
        <span className={`font-bold ${row.amount > 0 ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
          {row.amount > 0 ? '+' : ''}{row.amount.toFixed(2)} {currencySymbol}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: (row) => {
        const colors = {
          'مكتمل': 'bg-green-100 text-green-700',
          'قيد المعالجة': 'bg-yellow-100 text-yellow-700',
          'ملغي': 'bg-red-100 text-red-700',
        };
        return <Badge className={`${colors[row.status]} border-0`}>{row.status}</Badge>;
      },
    },
    {
      accessorKey: 'date',
      header: 'التاريخ',
      cell: (row) => <span className="text-sm" dir="ltr">{row.date}</span>,
    },
  ];

  // Invoice columns
  const invoiceColumns: DataTableColumn<Invoice>[] = [
    {
      accessorKey: 'id',
      header: 'رقم الفاتورة',
      cell: (row) => <span className="font-mono font-medium">{row.id}</span>,
    },
    {
      accessorKey: 'period',
      header: 'الفترة',
    },
    {
      accessorKey: 'orders',
      header: 'عدد الطلبات',
      cell: (row) => <span className="font-medium">{row.orders}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'المبلغ',
      cell: (row) => <span className="font-bold text-green-600" dir="ltr">{row.amount.toFixed(2)} {currencySymbol}</span>,
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: (row) => {
        const colors = {
          'مدفوع': 'bg-green-100 text-green-700',
          'قيد الانتظار': 'bg-yellow-100 text-yellow-700',
          'متأخر': 'bg-red-100 text-red-700',
        };
        return <Badge className={`${colors[row.status]} border-0`}>{row.status}</Badge>;
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'تاريخ الاستحقاق',
      cell: (row) => <span className="text-sm" dir="ltr">{row.dueDate}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">الحسابات المالية</h1>
          <p className="text-muted-foreground mt-1">إدارة المدفوعات والفواتير والمعاملات المالية</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
              <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
              <SelectItem value="year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="ml-2 h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              الرصيد الحالي
            </CardTitle>
            <Wallet className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900" dir="ltr">{stats.currentBalance.toFixed(2)} {currencySymbol}</div>
            <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              متاح للسحب الآن
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">
              قيد الانتظار
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900" dir="ltr">{stats.pendingBalance.toFixed(2)} {currencySymbol}</div>
            <p className="text-xs text-yellow-700 mt-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              التحويل في {stats.nextPaymentDate}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              إجمالي الأرباح
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900" dir="ltr">{stats.totalEarned.toFixed(2)} {currencySymbol}</div>
            <p className="text-xs text-blue-700 mt-2">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              عمولة المنصة
            </CardTitle>
            <CreditCard className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900" dir="ltr">{stats.platformFees.toFixed(2)} {currencySymbol}</div>
            <p className="text-xs text-purple-700 mt-2">
              5% من المبيعات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Payment Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">الدفعة القادمة</p>
              <p className="text-sm text-blue-700">سيتم تحويل {stats.nextPaymentAmount.toFixed(2)} {currencySymbol} في {stats.nextPaymentDate}</p>
            </div>
          </div>
          <Button variant="outline" className="bg-white">
            عرض التفاصيل
          </Button>
        </CardContent>
      </Card>

      {/* Tabs for Transactions and Invoices */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="p-6">
            <AdvancedDataTable
              data={transactions}
              columns={transactionColumns}
              searchPlaceholder="بحث في المعاملات..."
              exportFilename="merchant_transactions"
            />
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="p-6">
            <AdvancedDataTable
              data={invoices}
              columns={invoiceColumns}
              searchPlaceholder="بحث في الفواتير..."
              exportFilename="merchant_invoices"
              actions={(row) => (
                <Button variant="outline" size="sm">
                  <Download className="ml-2 h-4 w-4" />
                  تحميل
                </Button>
              )}
            />
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الإيرادات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>إجمالي الأرباح</span>
                    <span className="font-bold text-green-600" dir="ltr">{stats.totalEarned.toFixed(2)} {currencySymbol}</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>عمولة المنصة (5%)</span>
                    <span className="font-bold text-orange-600" dir="ltr">-{stats.platformFees.toFixed(2)} {currencySymbol}</span>
                  </div>
                  <Progress value={(stats.platformFees / stats.totalEarned) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>المسحوبات</span>
                    <span className="font-bold text-red-600" dir="ltr">-{stats.totalWithdrawn.toFixed(2)} {currencySymbol}</span>
                  </div>
                  <Progress value={(stats.totalWithdrawn / stats.totalEarned) * 100} className="h-2" />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">الرصيد المتبقي</span>
                    <span className="text-2xl font-bold text-green-600" dir="ltr">
                      {(stats.totalEarned - stats.platformFees - stats.totalWithdrawn).toFixed(2)} {currencySymbol}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الدفع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">متوسط الدفعة</span>
                  <span className="text-xl font-bold" dir="ltr">1,125.00 {currencySymbol}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">عدد الدفعات</span>
                  <span className="text-xl font-bold">14</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">آخر دفعة</span>
                  <span className="text-xl font-bold" dir="ltr">1,250.00 {currencySymbol}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">تاريخ آخر دفعة</span>
                  <span className="text-xl font-bold" dir="ltr">2024-01-14</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
