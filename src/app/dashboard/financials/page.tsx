
'use client';

import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/icon';

import { CollectFromDriver } from '@/components/financials/collect-from-driver';
import { DriverPaymentsLog } from '@/components/financials/driver-payments-log';
import { PrepareMerchantPayments } from '@/components/financials/prepare-merchant-payments';
import { MerchantPaymentsLog } from '@/components/financials/merchant-payments-log';

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

        <Tabs defaultValue="collect-from-driver" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="collect-from-driver">1. تحصيل من السائق</TabsTrigger>
                <TabsTrigger value="driver-payments-log">2. سجل كشوفات الاستلام</TabsTrigger>
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
