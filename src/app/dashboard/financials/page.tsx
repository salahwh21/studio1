'use client';

import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';
import { useOrdersStore } from '@/store/orders-store';
import { useUsersStore } from '@/store/user-store';
import { useFinancialsStore } from '@/store/financials-store';
import { useMemo } from 'react';

import { CollectFromDriver } from '@/components/financials/collect-from-driver';
import { DriverPaymentsLog } from '@/components/financials/driver-payments-log';
import { PrepareMerchantPayments } from '@/components/financials/prepare-merchant-payments';
import { MerchantPaymentsLog } from '@/components/financials/merchant-payments-log';
import { DriverDashboard } from '@/components/financials/driver-dashboard';
import { MerchantReportsEnhanced } from '@/components/financials/merchant-reports-enhanced';
import { DriversFinancialTable } from '@/components/financials/drivers-financial-table';
import { FinancialOverview } from '@/components/financials/financial-overview';

// ---------------- Main Component ----------------
export default function FinancialsPage() {
  const { formatCurrency } = useSettings();
  const { orders } = useOrdersStore();
  const { users } = useUsersStore();
  const { driverPaymentSlips, merchantPaymentSlips } = useFinancialsStore();

  // حساب الإحصائيات السريعة
  const quickStats = useMemo(() => {
    const drivers = users.filter(u => u.roleId === 'driver');
    const merchants = users.filter(u => u.roleId === 'merchant');

    // مبالغ مع السائقين
    const cashWithDrivers = orders
      .filter(o => o.status === 'تم التوصيل')
      .reduce((sum, o) => sum + (o.cod || 0), 0);

    // مبالغ مستلمة
    const cashCollected = orders
      .filter(o => o.status === 'تم استلام المال في الفرع')
      .reduce((sum, o) => sum + (o.cod || 0), 0);

    // إجمالي كشوفات السائقين
    const totalDriverSlips = driverPaymentSlips.length;
    const totalDriverSlipsAmount = driverPaymentSlips.reduce((sum, slip) => {
      return sum + slip.orders.reduce((s, o) => s + (o.cod || 0), 0);
    }, 0);

    // إجمالي كشوفات التجار
    const totalMerchantSlips = merchantPaymentSlips.length;
    const totalMerchantSlipsAmount = merchantPaymentSlips.reduce((sum, slip) => {
      return sum + slip.orders.reduce((s, o) => s + (o.itemPrice || 0), 0);
    }, 0);

    // سائقون عليهم مبالغ
    const driversWithOutstanding = new Set(
      orders
        .filter(o => o.status === 'تم التوصيل')
        .map(o => o.driver)
    ).size;

    return {
      cashWithDrivers,
      cashCollected,
      totalDriverSlips,
      totalDriverSlipsAmount,
      totalMerchantSlips,
      totalMerchantSlipsAmount,
      driversWithOutstanding,
      totalDrivers: drivers.length,
      totalMerchants: merchants.length,
    };
  }, [orders, users, driverPaymentSlips, merchantPaymentSlips]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Icon name="Calculator" className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  المحاسبة والمالية
                </CardTitle>
                <CardDescription className="mt-1">
                  إدارة شاملة للعمليات المالية من تحصيل وتسويات ودفعات والتحليلات المتقدمة
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {quickStats.totalDriverSlips + quickStats.totalMerchantSlips} كشف
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Wallet" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">مع السائقين</span>
              </div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(quickStats.cashWithDrivers)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-900">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Banknote" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">مستلمة</span>
              </div>
              <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                {formatCurrency(quickStats.cashCollected)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="FileText" className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">كشوفات السائقين</span>
              </div>
              <div className="text-xl font-bold text-amber-900 dark:text-amber-100">
                {quickStats.totalDriverSlips}
              </div>
              <div className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                {formatCurrency(quickStats.totalDriverSlipsAmount)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-900">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Receipt" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">كشوفات التجار</span>
              </div>
              <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                {quickStats.totalMerchantSlips}
              </div>
              <div className="text-xs text-purple-700/80 dark:text-purple-300/80 mt-1">
                {formatCurrency(quickStats.totalMerchantSlipsAmount)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border border-red-200 dark:border-red-900">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Users" className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-700 dark:text-red-300">سائقون عليهم مبالغ</span>
              </div>
              <div className="text-xl font-bold text-red-900 dark:text-red-100">
                {quickStats.driversWithOutstanding}
              </div>
              <div className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
                من {quickStats.totalDrivers} سائق
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/20 border border-gray-200 dark:border-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Store" className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">إجمالي التجار</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {quickStats.totalMerchants}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Icon name="LayoutDashboard" className="h-4 w-4" />
            <span className="hidden sm:inline">نظرة عامة</span>
            <span className="sm:hidden">عامة</span>
          </TabsTrigger>
          <TabsTrigger value="drivers-info" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Icon name="Users" className="h-4 w-4" />
            <span className="hidden sm:inline">السائقين</span>
            <span className="sm:hidden">سائقين</span>
          </TabsTrigger>
          <TabsTrigger value="collect-from-driver" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Icon name="Wallet" className="h-4 w-4" />
            <span className="hidden sm:inline">تحصيل</span>
            <span className="sm:hidden">تحصيل</span>
          </TabsTrigger>
          <TabsTrigger value="driver-payments-log" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Icon name="FileText" className="h-4 w-4" />
            <span className="hidden sm:inline">كشوفات</span>
            <span className="sm:hidden">كشوفات</span>
          </TabsTrigger>
          <TabsTrigger value="driver-analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Icon name="BarChart3" className="h-4 w-4" />
            <span className="hidden sm:inline">تحليلات</span>
            <span className="sm:hidden">تحليلات</span>
          </TabsTrigger>
          <TabsTrigger value="prepare-merchant-payments" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Icon name="CreditCard" className="h-4 w-4" />
            <span className="hidden sm:inline">دفعات</span>
            <span className="sm:hidden">دفعات</span>
          </TabsTrigger>
          <TabsTrigger value="merchant-payments-log" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Icon name="Receipt" className="h-4 w-4" />
            <span className="hidden sm:inline">سجل التجار</span>
            <span className="sm:hidden">سجل</span>
          </TabsTrigger>
          <TabsTrigger value="merchant-analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Icon name="TrendingUp" className="h-4 w-4" />
            <span className="hidden sm:inline">تقارير</span>
            <span className="sm:hidden">تقارير</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <FinancialOverview />
        </TabsContent>

        <TabsContent value="drivers-info" className="mt-6">
          <DriversFinancialTable />
        </TabsContent>

        <TabsContent value="collect-from-driver" className="mt-6">
          <CollectFromDriver />
        </TabsContent>

        <TabsContent value="driver-payments-log" className="mt-6">
          <DriverPaymentsLog />
        </TabsContent>

        <TabsContent value="driver-analytics" className="mt-6">
          <DriverDashboard driverName="أحمد" />
        </TabsContent>

        <TabsContent value="prepare-merchant-payments" className="mt-6">
          <PrepareMerchantPayments />
        </TabsContent>

        <TabsContent value="merchant-payments-log" className="mt-6">
          <MerchantPaymentsLog />
        </TabsContent>

        <TabsContent value="merchant-analytics" className="mt-6">
          <MerchantReportsEnhanced merchantName="المتجر الأول" />
        </TabsContent>
      </Tabs>
    </div >
  );
}
