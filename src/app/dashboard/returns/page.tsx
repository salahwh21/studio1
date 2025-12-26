'use client';

import { useMemo } from 'react';
import { 
  PackageX, 
  Users, 
  Building,
  FileText,
  Package,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { useOrdersStore } from '@/store/orders-store';
import { useUsersStore } from '@/store/user-store';
import { useReturnsStore } from '@/store/returns-store';
import { useSettings } from '@/contexts/SettingsContext';

export default function ReturnsPage() {
  const { orders } = useOrdersStore();
  const { users } = useUsersStore();
  const { driverReturnSlips } = useReturnsStore();
  const { settings, formatCurrency } = useSettings();
  
  const drivers = users.filter(u => u.roleId === 'driver');

  // Calculate statistics
  const stats = useMemo(() => {
    // Orders with drivers (not delivered)
    const withDrivers = orders.filter(o => 
      o.driver && 
      o.status !== 'تم التوصيل' && 
      o.status !== 'تم استلام المال في الفرع' &&
      o.status !== 'مكتمل' &&
      o.status !== 'مرجع للفرع' &&
      o.status !== 'مرجع للتاجر'
    );

    // Orders in branch
    const inBranch = orders.filter(o => o.status === 'مرجع للفرع');

    // Orders returned to merchant
    const returnedToMerchant = orders.filter(o => o.status === 'مرجع للتاجر');

    // Total slips
    const totalSlips = driverReturnSlips.length;

    // COD calculations
    const withDriversCOD = withDrivers.reduce((sum, o) => sum + o.cod, 0);
    const inBranchCOD = inBranch.reduce((sum, o) => sum + o.cod, 0);
    const returnedCOD = returnedToMerchant.reduce((sum, o) => sum + o.cod, 0);

    // Drivers with orders
    const driversWithOrders = new Set(withDrivers.map(o => o.driver)).size;

    // Merchants with returns
    const merchantsWithReturns = new Set(inBranch.map(o => o.merchant)).size;

    return {
      withDrivers: withDrivers.length,
      withDriversCOD,
      inBranch: inBranch.length,
      inBranchCOD,
      returnedToMerchant: returnedToMerchant.length,
      returnedCOD,
      totalSlips,
      driversWithOrders,
      merchantsWithReturns
    };
  }, [orders, driverReturnSlips]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <PackageX className="h-8 w-8 text-primary" />
          إدارة المرتجعات
        </h1>
        <p className="text-muted-foreground mt-2">نظام متكامل لإدارة المرتجعات من السائقين والتجار</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-r-4 border-r-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مع السائقين</p>
                <p className="text-3xl font-bold mt-1">{stats.withDrivers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.withDriversCOD)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full dark:bg-orange-950">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">في الفرع</p>
                <p className="text-3xl font-bold mt-1">{stats.inBranch}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.inBranchCOD)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-950">
                <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مرجع للتاجر</p>
                <p className="text-3xl font-bold mt-1">{stats.returnedToMerchant}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.returnedCOD)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-950">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">سندات الاستلام</p>
                <p className="text-3xl font-bold mt-1">{stats.totalSlips}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.driversWithOrders} سائقين
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-950">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/returns/receive">
          <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-950">
                  <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                استلام من السائقين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.withDrivers}</p>
              <p className="text-xs text-muted-foreground">طلبات جاهزة</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/returns/inspection">
          <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-950">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                فحص وتقييم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.inBranch}</p>
              <p className="text-xs text-muted-foreground">بانتظار الفحص</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/returns/process">
          <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-950">
                  <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                معالجة في الفرع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.inBranch}</p>
              <p className="text-xs text-muted-foreground">تحتاج معالجة</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/returns/history">
          <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-md h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-950">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                سجل الاستلام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalSlips}</p>
              <p className="text-xs text-muted-foreground">سند استلام</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">حالة المعالجة</CardTitle>
            <CardDescription>نسبة الطلبات المعالجة من إجمالي المرتجعات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">مع السائقين</span>
                <span className="text-sm text-muted-foreground">{stats.withDrivers} طلبات</span>
              </div>
              <Progress 
                value={(stats.withDrivers / (stats.withDrivers + stats.inBranch + stats.returnedToMerchant || 1)) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">في الفرع</span>
                <span className="text-sm text-muted-foreground">{stats.inBranch} طلبات</span>
              </div>
              <Progress 
                value={(stats.inBranch / (stats.withDrivers + stats.inBranch + stats.returnedToMerchant || 1)) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">مرجع للتاجر</span>
                <span className="text-sm text-muted-foreground">{stats.returnedToMerchant} طلبات</span>
              </div>
              <Progress 
                value={(stats.returnedToMerchant / (stats.withDrivers + stats.inBranch + stats.returnedToMerchant || 1)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ملخص سريع</CardTitle>
            <CardDescription>معلومات إضافية عن المرتجعات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">سائقين لديهم طلبات</span>
              </div>
              <Badge variant="secondary">{stats.driversWithOrders}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">تجار لديهم مرتجعات</span>
              </div>
              <Badge variant="secondary">{stats.merchantsWithReturns}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">إجمالي المبالغ</span>
              </div>
              <Badge variant="secondary">
                {formatCurrency(stats.withDriversCOD + stats.inBranchCOD + stats.returnedCOD)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
