
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Icon from '@/components/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReceiveFromDrivers } from '@/components/returns/receive-from-drivers';
import { DriverSlips } from '@/components/returns/driver-slips';
import { PrepareForMerchants } from '@/components/returns/prepare-for-merchants';
import { MerchantSlips } from '@/components/returns/merchant-slips';
import { ExportButtons } from '@/components/returns/export-buttons';
import { useReturnsStore } from '@/store/returns-store';
import { useUsersStore } from '@/store/user-store';
import { useSettings } from '@/contexts/SettingsContext';

export default function ReturnsPage() {
  const { driverSlips, merchantSlips } = useReturnsStore();
  const { users } = useUsersStore();
  const { settings } = useSettings();
  const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;
  
  return (
    <div className="space-y-6">
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
      
      <ExportButtons
        driverSlips={driverSlips}
        merchantSlips={merchantSlips}
        users={users}
        reportsLogo={reportsLogo}
      />

      <Tabs defaultValue="receive-from-drivers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
           <TabsTrigger value="merchant-slips">
            <Icon name="ClipboardList" className="ml-2 h-4 w-4" />
            كشوفات إرجاع التجار
          </TabsTrigger>
           <TabsTrigger value="prepare-for-merchants">
            <Icon name="Package" className="ml-2 h-4 w-4" />
            تجهيز مرتجعات التجار
          </TabsTrigger>
          <TabsTrigger value="driver-slips">
            <Icon name="History" className="ml-2 h-4 w-4" />
            كشوفات استلام السائقين
          </TabsTrigger>
          <TabsTrigger value="receive-from-drivers">
            <Icon name="Truck" className="ml-2 h-4 w-4" />
            استلام من السائقين
          </TabsTrigger>
        </TabsList>
        <TabsContent value="receive-from-drivers" className="mt-6">
          <ReceiveFromDrivers />
        </TabsContent>
        <TabsContent value="driver-slips" className="mt-6">
          <DriverSlips />
        </TabsContent>
        <TabsContent value="prepare-for-merchants" className="mt-6">
          <PrepareForMerchants />
        </TabsContent>
        <TabsContent value="merchant-slips" className="mt-6">
          <MerchantSlips />
        </TabsContent>
      </Tabs>
    </div>
  );
}
