'use client';
import { useMemo } from 'react';
import { useOrdersStore } from '@/store/orders-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/icon';
import { ReturnsFromDrivers } from '@/components/returns/returns-from-drivers';
import { ReturnSlipsToMerchants } from '@/components/returns/return-slips-to-merchants';

// --- Main Page Component ---
export default function ReturnsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Icon name="Undo2" />
            إدارة المرتجعات
          </CardTitle>
          <CardDescription>
            استلام الشحنات الراجعة من السائقين وتجهيزها في كشوفات لإعادتها إلى التجار.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="returns-from-drivers">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="returns-from-drivers">
            <Icon name="Truck" className="ml-2 h-4 w-4" />
            استلام من السائقين
          </TabsTrigger>
          <TabsTrigger value="return-slips-to-merchants">
            <Icon name="FileText" className="ml-2 h-4 w-4" />
            كشوفات إرجاع للتجار
          </TabsTrigger>
        </TabsList>

        <TabsContent value="returns-from-drivers" className="mt-4">
            <ReturnsFromDrivers />
        </TabsContent>

        <TabsContent value="return-slips-to-merchants" className="mt-4">
            <ReturnSlipsToMerchants />
        </TabsContent>

      </Tabs>
    </div>
  );
}
