'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '../icon';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSettings } from '@/contexts/SettingsContext';
const API_URL = typeof window !== 'undefined' 
  ? ((globalThis as any).VITE_API_URL || 'http://localhost:3001/api')
  : 'http://localhost:3001/api';

interface DriverStats {
  driverName: string;
  period: string;
  totalOrders: number;
  deliveredOrders: number;
  totalEarnings: number;
  additionalFare: number;
  successRate: number;
  avgDeliveryTimeHours: number;
}

interface ComparisonData {
  current: any;
  previous: any;
  growth: any;
}

interface FeeBreakdown {
  driverName: string;
  deliveryFees: number;
  additionalFares: number;
  penalties: number;
  bonuses: number;
  netTotal: number;
  totalItems: number;
}

export const DriverDashboard = ({ driverName }: { driverName: string }) => {
  const { formatCurrency } = useSettings();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [statsRes, compRes, feeRes] = await Promise.all([
          fetch(`${API_URL}/financials/driver-statistics/${driverName}?period=${period}`),
          fetch(`${API_URL}/financials/comparison/${driverName}`),
          fetch(`${API_URL}/financials/fee-breakdown/${driverName}`)
        ]);

        const statsData = statsRes.ok ? await statsRes.json() : null;
        const compData = compRes.ok ? await compRes.json() : null;
        const feeData = feeRes.ok ? await feeRes.json() : null;

        setStats(statsData);
        setComparison(compData);
        setFeeBreakdown(feeData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [driverName, period]);

  if (loading || !stats) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  const pieData = feeBreakdown ? [
    { name: 'أجور التوصيل', value: feeBreakdown.deliveryFees },
    { name: 'الرسوم الإضافية', value: feeBreakdown.additionalFares }
  ] : [];

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم - {driverName}</h1>
          <p className="text-gray-500 mt-1">إحصائيات الأداء والأرباح</p>
        </div>
        <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">الأرباح الإجمالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.period === 'today' ? 'اليوم' : stats.period === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">عدد الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{stats.deliveredOrders} ✅ مسلم</Badge>
              <Badge variant="outline">{stats.totalOrders - stats.deliveredOrders} ⏳ معلق</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">نسبة النجاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">متوسط وقت التسليم: {stats.avgDeliveryTimeHours.toFixed(1)} ساعة</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Cards */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>مقارنة مع الفترة السابقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">الطلبات</p>
                <div className="text-2xl font-bold mt-2">{comparison.current.orders}</div>
                <p className={`text-sm mt-1 ${parseFloat(comparison.growth.orders) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.growth.orders}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الأرباح</p>
                <div className="text-2xl font-bold mt-2">{formatCurrency(comparison.current.earnings)}</div>
                <p className={`text-sm mt-1 ${parseFloat(comparison.growth.earnings) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.growth.earnings}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">السابق - الطلبات</p>
                <div className="text-2xl font-bold mt-2">{comparison.previous.orders}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">السابق - الأرباح</p>
                <div className="text-2xl font-bold mt-2">{formatCurrency(comparison.previous.earnings)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fee Breakdown Pie Chart */}
        {feeBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle>توزيع الأرباح</CardTitle>
              <CardDescription>تفصيل أجور التوصيل والرسوم الإضافية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${formatCurrency(value)}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>أجور التوصيل:</span>
                  <span className="font-bold">{formatCurrency(feeBreakdown.deliveryFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم إضافية:</span>
                  <span className="font-bold">{formatCurrency(feeBreakdown.additionalFares)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>الإجمالي الصافي:</span>
                  <span>{formatCurrency(feeBreakdown.netTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات تفصيلية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">عدد الطلبات المسلمة</span>
              <span className="font-bold text-lg">{stats.deliveredOrders}/{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">متوسط الدخل/طلب</span>
              <span className="font-bold text-lg">{stats.totalOrders > 0 ? formatCurrency(stats.totalEarnings / stats.totalOrders) : '0'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">متوسط وقت التسليم</span>
              <span className="font-bold text-lg">{stats.avgDeliveryTimeHours.toFixed(1)} ساعة</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">عدد البنود</span>
              <span className="font-bold text-lg">{feeBreakdown?.totalItems || 0}</span>
            </div>

            <Button className="w-full mt-4">
              <Icon name="Download" className="ml-2 h-4 w-4" />
              تحميل التقرير
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
