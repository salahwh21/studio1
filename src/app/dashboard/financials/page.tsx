
'use client';

import { useMemo, useState } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useUsersStore, type User } from '@/store/user-store';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';

// ---------------- Section 1: Collect from Driver ----------------
const CollectFromDriver = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>المرحلة الأولى: تحصيل المبالغ من السائقين</CardTitle>
        <CardDescription>
          عرض المبالغ المستحقة على السائقين من الشحنات التي تم توصيلها وتأكيد استلامها.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">سيتم بناء هذه الواجهة هنا لإدارة عملية التحصيل اليومي من السائقين.</p>
      </CardContent>
    </Card>
  );
};


// ---------------- Section 2: Driver Payments Log ----------------
const DriverPaymentsLog = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>سجل الدفعات للسائقين</CardTitle>
                 <CardDescription>
                    عرض وتأكيد دفع أجور السائقين المستحقة.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">سيتم بناء هذه الواجهة هنا لعرض سجل دفع أجور السائقين.</p>
            </CardContent>
        </Card>
    );
};


// ---------------- Section 3: Prepare Merchant Payments ----------------
const PrepareMerchantPayments = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>تجهيز مستحقات التجار</CardTitle>
                 <CardDescription>
                    تجميع المبالغ المستحقة للتجار من الطلبات المكتملة وإنشاء كشوفات دفع.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">سيتم بناء هذه الواجهة هنا لتجميع وتجهيز كشوفات دفع التجار.</p>
            </CardContent>
        </Card>
    );
};


// ---------------- Section 4: Merchant Payments Log ----------------
const MerchantPaymentsLog = () => {
     return (
        <Card>
            <CardHeader>
                <CardTitle>سجل دفعات التجار</CardTitle>
                 <CardDescription>
                    عرض وطباعة وتأكيد كشوفات الدفع التي تم إنشاؤها للتجار.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">سيتم بناء هذه الواجهة هنا لعرض سجل دفعات التجار وتأكيدها.</p>
            </CardContent>
        </Card>
    );
}

// ---------------- Main Component ----------------
export default function FinancialsPage() {
  return (
    <div className="space-y-6">
       <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Icon name="Calculator" /> المحاسبة والمالية
                </CardTitle>
                <CardDescription>
                    إدارة شاملة للعمليات المالية من تحصيل وتسويات ودفعات.
                </CardDescription>
            </CardHeader>
        </Card>

        <Tabs defaultValue="collect-from-driver" className="w-full">
            <TabsList className="grid w-full grid-cols-4" dir="rtl">
                <TabsTrigger value="collect-from-driver">1. تحصيل من السائق</TabsTrigger>
                <TabsTrigger value="driver-payments-log">2. دفعات السائقين</TabsTrigger>
                <TabsTrigger value="prepare-merchant-payments">3. تجهيز دفعات التجار</TabsTrigger>
                <TabsTrigger value="merchant-payments-log">4. سجل دفعات التجار</TabsTrigger>
            </TabsList>
            <TabsContent value="collect-from-driver" className="mt-6">
                <CollectFromDriver />
            </TabsContent>
            <TabsContent value="driver-payments-log" className="mt-6">
                <DriverPaymentsLog />
            </TabsContent>
            <TabsContent value="prepare-merchant-payments" className="mt-6">
                <PrepareMerchantPayments />
            </TabsContent>
            <TabsContent value="merchant-payments-log" className="mt-6">
                <MerchantPaymentsLog />
            </TabsContent>
        </Tabs>
    </div>
  );
}
