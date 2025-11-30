'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '../icon';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSettings } from '@/contexts/SettingsContext';
import apiClient from '@/lib/api';

interface MerchantStats {
  merchantName: string;
  period: string;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  totalRevenue: number;
  successRate: number;
  returnRate: number;
  avgDeliveryDays: number;
}

export const MerchantReportsEnhanced = ({ merchantName }: { merchantName: string }) => {
  const { formatCurrency } = useSettings();
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/financials/merchant-statistics/${merchantName}?period=${period}`);
        setStats(res.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [merchantName, period]);

  if (loading || !stats) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  const failureReasons = [
    { name: 'تم الرفض', value: 25, color: '#ef4444' },
    { name: 'عنوان غير دقيق', value: 15, color: '#f97316' },
    { name: 'هاتف مغلق', value: 10, color: '#eab308' }
  ];

  const getTierBadge = (successRate: number) => {
    if (successRate >= 95) return { label: 'الفئة الذهبية', color: 'bg-yellow-100 text-yellow-800' };
    if (successRate >= 85) return { label: 'الفئة الفضية', color: 'bg-gray-100 text-gray-800' };
    return { label: 'الفئة البرونزية', color: 'bg-orange-100 text-orange-800' };
  };

  const tier = getTierBadge(stats.successRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">تقرير الأداء - {merchantName}</h1>
          <p className="text-gray-500 mt-1">تحليل شامل لأداء متجرك</p>
        </div>
        <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">طلب {period === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">نسبة النجاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <Badge className={`mt-2 ${tier.color}`}>{tier.label}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">القيمة الإجمالية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">متوسط التسليم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgDeliveryDays.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">يوم</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Success Rate Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالات الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={[
                    { name: 'مسلم', value: stats.deliveredOrders, color: '#10b981' },
                    { name: 'مرتجع', value: stats.returnedOrders, color: '#ef4444' },
                    { name: 'معلق', value: stats.totalOrders - stats.deliveredOrders - stats.returnedOrders, color: '#f59e0b' }
                  ]}
                  cx="50%" 
                  cy="50%" 
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2].map((index, i) => (
                    <Cell key={`cell-${i}`} fill={['#10b981', '#ef4444', '#f59e0b'][i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Failure Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>أسباب الفشل (عينة)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={failureReasons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات تفصيلية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg mb-4">الأداء الإجمالي</h3>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">الطلبات المسلمة</span>
                <span className="font-bold">{stats.deliveredOrders}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">الطلبات المرتجعة</span>
                <span className="font-bold text-red-600">{stats.returnedOrders} ({stats.returnRate.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">الطلبات المعلقة</span>
                <span className="font-bold">{stats.totalOrders - stats.deliveredOrders - stats.returnedOrders}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg mb-4">البيانات المالية</h3>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">متوسط قيمة الطلب</span>
                <span className="font-bold">{stats.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : '0'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">الإيرادات الصافية (متوقعة)</span>
                <span className="font-bold">{formatCurrency(stats.totalRevenue * 0.92)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">رسوم النظام (8%)</span>
                <span className="font-bold text-red-600">{formatCurrency(stats.totalRevenue * 0.08)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-bold text-lg mb-4">الإجراءات</h3>
            <div className="flex gap-3">
              <Button variant="outline">
                <Icon name="Download" className="ml-2 h-4 w-4" />
                تحميل التقرير (PDF)
              </Button>
              <Button variant="outline">
                <Icon name="FileSpreadsheet" className="ml-2 h-4 w-4" />
                تصدير (Excel)
              </Button>
              <Button variant="outline">
                <Icon name="Send" className="ml-2 h-4 w-4" />
                إرسال بريد
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
