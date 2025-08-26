'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { FileText, Search, Truck, Store, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const driverCollections = [
  { name: 'علي الأحمد', pending: 8, collected: 5, status: 'pending' },
  { name: 'فاطمة الزهراء', pending: 0, collected: 12, status: 'completed' },
  { name: 'محمد الخالد', pending: 3, collected: 4, status: 'pending' },
];

const merchantDeliveries = [
    { name: 'تاجر أ', atBranch: 13, deliveryDue: '2023-08-20', collectionPending: false, status: 'pending'},
    { name: 'تاجر ب', atBranch: 7, deliveryDue: '2023-08-21', collectionPending: true, status: 'pending' },
    { name: 'تاجر ج', atBranch: 22, deliveryDue: '2023-08-19', collectionPending: false, status: 'completed' },
];

const archiveData = [
    { date: '2023-08-18', driver: 'علي الأحمد', merchant: 'تاجر أ', count: 15, status: 'completed' },
    { date: '2023-08-17', driver: 'فاطمة الزهراء', merchant: 'تاجر ج', count: 10, status: 'completed' },
    { date: '2023-08-16', driver: 'محمد الخالد', merchant: 'تاجر ب', count: 8, status: 'completed' },
];

const DriverCollectionPanel = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-6 w-6 text-primary"/> تحصيل السائق</CardTitle>
            <CardDescription>متابعة المرتجعات التي يجب تحصيلها من السائقين.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {driverCollections.map(driver => (
                <Card key={driver.name} className={`${driver.status === 'pending' ? 'border-orange-400' : 'border-green-400'} border-l-4`}>
                    <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{driver.name}</CardTitle>
                             <Badge variant={driver.status === 'pending' ? 'secondary' : 'default'} className={driver.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                                {driver.status === 'pending' ? 'قيد التحصيل' : 'مكتمل'}
                            </Badge>
                        </div>
                         <CardDescription>
                            {driver.pending > 0 ? `${driver.pending} مرتجع بانتظار التحصيل` : 'لا توجد مرتجعات معلقة'}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                         <Button variant="outline" size="sm" className="gap-1"><FileText className="h-4 w-4" /> كشف تحصيل</Button>
                         <Button size="sm" disabled={driver.status === 'completed'}>تأكيد التحصيل</Button>
                    </CardFooter>
                </Card>
            ))}
        </CardContent>
    </Card>
);

const MerchantDeliveryPanel = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Store className="h-6 w-6 text-primary"/> تسليم التاجر</CardTitle>
            <CardDescription>متابعة المرتجعات في الفرع وتجهيزها للتسليم للتاجر.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             {merchantDeliveries.map(merchant => (
                <Card key={merchant.name} className={`${merchant.status === 'pending' ? 'border-orange-400' : 'border-green-400'} border-l-4`}>
                    <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                             <CardTitle className="text-base">{merchant.name}</CardTitle>
                             <Badge variant={merchant.status === 'pending' ? 'secondary' : 'default'} className={merchant.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                                {merchant.status === 'pending' ? 'قيد التسليم' : 'تم التسليم'}
                            </Badge>
                        </div>
                        <CardDescription>
                            {merchant.atBranch} مرتجع في الفرع.
                            {merchant.collectionPending && <span className="text-red-500 block"> (بانتظار تحصيل السائق)</span>}
                        </CardDescription>
                    </CardHeader>
                     <CardFooter className="p-4 pt-0 flex justify-between items-center">
                         <Button variant="outline" size="sm" className="gap-1"><FileText className="h-4 w-4" /> كشف تسليم</Button>
                         <div className="text-xs text-muted-foreground">موعد التسليم: {merchant.deliveryDue}</div>
                    </CardFooter>
                </Card>
            ))}
        </CardContent>
    </Card>
);

const ArchivePanel = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Archive className="h-6 w-6 text-primary"/> أرشيف الكشوفات</CardTitle>
             <div className="relative mt-2">
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="بحث بالتاريخ، السائق..." className="pr-8" />
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>التاجر</TableHead>
                        <TableHead>الحالة</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {archiveData.map(item => (
                        <TableRow key={item.date + item.merchant}>
                            <TableCell className="font-medium text-xs">{item.date}</TableCell>
                            <TableCell className="text-xs">{item.merchant}</TableCell>
                            <TableCell>
                                <Badge variant={item.status === 'completed' ? 'outline' : 'destructive'}>
                                    {item.status === 'completed' ? 'مكتمل' : 'معلق'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);


export default function ReturnsTrackingPage() {
  return (
    <div className="flex flex-col gap-6">

        {/* Mobile View */}
        <div className="md:hidden">
             <Accordion type="single" collapsible defaultValue='item-1' className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold"><Truck className="mr-2 h-5 w-5 text-primary"/> تحصيل السائق</AccordionTrigger>
                  <AccordionContent>
                     <DriverCollectionPanel />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-semibold"><Store className="mr-2 h-5 w-5 text-primary"/> تسليم التاجر</AccordionTrigger>
                  <AccordionContent>
                    <MerchantDeliveryPanel />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-semibold"><Archive className="mr-2 h-5 w-5 text-primary"/> الأرشيف</AccordionTrigger>
                  <AccordionContent>
                    <ArchivePanel />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
        </div>


        {/* Desktop View */}
        <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-3">
                 <DriverCollectionPanel />
            </div>
            <div className="lg:col-span-4">
                <MerchantDeliveryPanel />
            </div>
            <div className="lg:col-span-3">
                <ArchivePanel />
            </div>
        </div>
    </div>
  );
}
