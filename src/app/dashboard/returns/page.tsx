
      'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Icon from '@/components/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';


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
  loading: () => <LoadingSkeleton />,
  ssr: false,
});
const MerchantSlips = dynamic(() => import('@/components/returns-stages/merchant-slips').then(mod => mod.MerchantSlips), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});

const returnSections = [
  {
    value: 'receive-from-drivers',
    icon: 'Truck',
    title: '1. استلام من السائقين',
    description: 'استلام الشحنات الراجعة من السائقين وتسجيلها في النظام.',
    component: <ReceiveFromDrivers />,
  },
  {
    value: 'driver-slips',
    icon: 'History',
    title: '2. كشوفات استلام السائقين',
    description: 'عرض وطباعة الكشوفات السابقة التي تم إنشاؤها للسائقين.',
    component: <DriverSlips />,
  },
  {
    value: 'prepare-for-merchants',
    icon: 'Package',
    title: '3. تجهيز مرتجعات التجار',
    description: 'تجميع مرتجعات كل تاجر في قوائم تمهيدًا لإنشاء كشف إرجاع.',
    component: <PrepareForMerchants />,
  },
  {
    value: 'merchant-slips',
    icon: 'ClipboardList',
    title: '4. كشوفات إرجاع التجار',
    description: 'عرض وتأكيد تسليم الكشوفات النهائية للتجار.',
    component: <MerchantSlips />,
  },
];

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <Icon name="Undo2" />
            إدارة المرتجعات
          </CardTitle>
          <CardDescription>
            اتبع الخطوات التالية لإدارة دورة المرتجعات بكفاءة، بدءًا من استلامها من السائق وحتى إعادتها للتاجر.
          </CardDescription>
        </CardHeader>
      </Card>
      
       <Tabs defaultValue={returnSections[0].value} className="w-full" dir="rtl">
        <TabsList className="h-auto p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 bg-transparent">
            {returnSections.map(section => (
                <TabsTrigger 
                    key={section.value} 
                    value={section.value} 
                    className="w-full h-auto p-4 flex flex-col items-center gap-2 text-center md:flex-row md:text-right md:items-start data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:border-primary/20 data-[state=active]:border-b-2"
                >
                     <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <Icon name={section.icon as any} className="h-6 w-6" />
                     </div>
                     <div className="flex-1">
                        <p className="font-bold">{section.title}</p>
                        <p className="text-xs text-muted-foreground hidden md:block">{section.description}</p>
                     </div>
                </TabsTrigger>
            ))}
        </TabsList>
        {returnSections.map(section => (
            <TabsContent key={section.value} value={section.value} className="mt-6">
                {section.component}
            </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

    