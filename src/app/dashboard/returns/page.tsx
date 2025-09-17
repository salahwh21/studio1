'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/icon';
import { ReturnsFromDrivers } from '@/components/returns/returns-from-drivers';
import { ReturnSlipsToMerchants } from '@/components/returns/return-slips-to-merchants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

      <Tabs defaultValue="from-drivers">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="from-drivers">
                <Icon name="Users" className="ml-2 h-4 w-4" />
                استلام المرتجعات من السائقين
            </TabsTrigger>
            <TabsTrigger value="to-merchants">
                <Icon name="Store" className="ml-2 h-4 w-4" />
                إدارة كشوفات الإرجاع للتجار
            </TabsTrigger>
        </TabsList>
        <TabsContent value="from-drivers" className="mt-6">
            <ReturnsFromDrivers />
        </TabsContent>
        <TabsContent value="to-merchants" className="mt-6">
            <ReturnSlipsToMerchants />
        </TabsContent>
      </Tabs>
    </div>
  );
}
