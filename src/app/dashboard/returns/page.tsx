      'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, History, Package, ClipboardList, Undo2 } from 'lucide-react';


const LoadingSkeleton = () => (
    <Card>
        <CardContent className="p-6">
            <Skeleton className="h-40 w-full" />
        </CardContent>
    </Card>
);

const ReceiveFromDrivers = dynamic(() => import('@/components/returns-stages/receive-from-drivers').then(mod => mod.ReceiveFromDrivers), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});
const DriverSlips = dynamic(() => import('@/components/returns-stages/driver-slips').then(mod => mod.DriverSlips), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});
const PrepareForMerchants = dynamic(() => import('@/components/returns-stages/prepare-for-merchants').then(mod => mod.PrepareForMerchants), {
  loading:
  () => <LoadingSkeleton />,
  ssr: false,
});
const MerchantSlips = dynamic(() => import('@/components/returns-stages/merchant-slips').then(mod => mod.MerchantSlips), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});

const returnSections = [
  {
    value: 'receive-from-drivers',
    icon: Truck,
    title: '1. استلام من السائقين',
    description: 'تسجيل الشحنات المرتجعة من السائقين.',
  },
  {
    value: 'driver-slips',
    icon: History,
    title: '2. كشوفات استلام السائقين',
    description: 'عرض وطباعة كشوفات استلام السائقين.',
  },
  {
    value: 'prepare-for-merchants',
    icon: Package,
    title: '3. تجهيز للتجار',
    description: 'تجميع مرتجعات كل تاجر لإنشاء كشف إرجاع.',
  },
  {
    value: 'merchant-slips',
    icon: ClipboardList,
    title: '4. كشوفات إرجاع التجار',
    description: 'عرض وتأكيد تسليم الكشوفات النهائية للتجار.',
  },
];

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <Undo2 />
            إدارة المرتجعات
          </CardTitle>
          <CardDescription>
            إدارة دورة المرتجعات بكفاءة، من استلامها من السائق وحتى إعادتها للتاجر.
          </CardDescription>
        </CardHeader>
      </Card>
      
       <Tabs defaultValue={returnSections[0].value} className="w-full">
         <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {returnSections.map(section => (
                <TabsTrigger 
                    key={section.value} 
                    value={section.value}
                    className="flex flex-col sm:flex-row text-center sm:text-right justify-center sm:justify-start h-auto p-4 gap-3 data-[state=active]:bg-primary/10 data-[state=active]:shadow-md"
                >
                     <section.icon className="h-6 w-6 text-primary mb-2 sm:mb-0 sm:mr-2" />
                     <div className="flex flex-col">
                        <p className="font-bold">{section.title}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{section.description}</p>
                     </div>
                </TabsTrigger>
            ))}
        </TabsList>
        <div className="mt-6">
            <TabsContent value="receive-from-drivers">
                <ReceiveFromDrivers />
            </TabsContent>
            <TabsContent value="driver-slips">
                <DriverSlips />
            </TabsContent>
            <TabsContent value="prepare-for-merchants">
                <PrepareForMerchants />
            </TabsContent>
            <TabsContent value="merchant-slips">
                <MerchantSlips />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
