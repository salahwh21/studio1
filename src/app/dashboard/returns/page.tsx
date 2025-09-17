'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Icon from '@/components/icon';
import { ReturnsFromDrivers } from '@/components/returns/returns-from-drivers';
import { ReturnSlipsToMerchants } from '@/components/returns/return-slips-to-merchants';
import { Separator } from '@/components/ui/separator';

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

      {/* Section 1: Returns from Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3">
           <ReturnsFromDrivers />
        </div>
        <div className="lg:col-span-2 lg:sticky lg:top-24">
           {/* This is where the slips from drivers would go if it were a separate component */}
        </div>
      </div>
      
      <Separator className="my-8" />

      {/* Section 2: Returns to Merchants */}
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3">
           <ReturnSlipsToMerchants />
        </div>
         <div className="lg:col-span-2 lg:sticky lg:top-24">
           {/* This is where the slips to merchants would go if it were a separate component */}
        </div>
      </div>
    </div>
  );
}
