'use client';

import { PackageX, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReturnsTable } from './components/returns-table';
import { useOrdersStore } from '@/store/orders-store';

export default function ReturnsPage() {
  const { orders } = useOrdersStore();

  const driverReturnStatuses = [
    'مرتجع',
    'ملغي',
    'تبديل',
    'رفض ودفع أجور',
    'رفض ولم يدفع أجور',
    'وصول وعدم رد'
  ];

  // تصفية الطلبات: يجب أن تكون من الحالات أعلاه، ولها سائق معين (لا يساوي "غير معين")
  const driverReturnOrders = orders.filter((order) => 
    driverReturnStatuses.includes(order.status) &&
    order.driver &&
    order.driver !== 'غير معين'
  );

  // تصفية الطلبات: المرجعة للفرع وبانتظار قرار
  const branchReturnOrders = orders.filter((order) => 
    order.status === 'مرجع للفرع'
  );

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <PackageX className="h-8 w-8 text-primary" />
          إدارة المرتجعات
        </h1>
        <p className="text-muted-foreground mt-2">معالجة المرتجعات من السائقين واتخاذ القرارات في الفرع</p>
      </div>

      <Tabs defaultValue="driver-returns" dir="rtl" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-fit mb-2 flex-shrink-0">
          <TabsTrigger value="driver-returns" className="flex items-center gap-2">
            <PackageX className="h-4 w-4" />
            مرتجعات مع السائق
            <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
              {driverReturnOrders.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="branch-returns" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            مرتجعات في الفرع
            <span className="ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
              {branchReturnOrders.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="driver-returns" className="flex-1 overflow-hidden m-0 p-0 border rounded-xl bg-background shadow-sm">
          <div className="h-full overflow-y-auto" style={{ height: 'calc(100vh - 12rem)' }}>
            <ReturnsTable 
              orders={driverReturnOrders} 
              availableStatuses={['مرجع للفرع']} 
            />
          </div>
        </TabsContent>

        <TabsContent value="branch-returns" className="flex-1 overflow-hidden m-0 p-0 border rounded-xl bg-background shadow-sm">
          <div className="h-full overflow-y-auto" style={{ height: 'calc(100vh - 12rem)' }}>
            <ReturnsTable 
              orders={branchReturnOrders} 
              availableStatuses={['مؤجل', 'مرجع للتاجر']} 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
