
'use client';

import { useMemo } from 'react';
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

type FinancialSummary = {
  id: string;
  name: string;
  balance: number;
  status: 'due' | 'paid' | 'overdue';
};

// --- Components ---

const DriverAccountingTab = () => {
    const { formatCurrency } = useSettings();
    const { orders } = useOrdersStore();
    const { users } = useUsersStore();

    const driverAccountingData = useMemo(() => {
        const drivers = users.filter(u => u.roleId === 'driver');
        return drivers.map(driver => {
            const driverOrders = orders.filter(o => o.driver === driver.name && (o.status === 'تم التوصيل' || o.status === 'رفض ودفع أجور'));
            const totalCollected = driverOrders.reduce((sum, order) => sum + (order.cod || 0), 0);
            const totalFees = driverOrders.reduce((sum, order) => sum + (order.driverFee || 0) + (order.driverAdditionalFare || 0), 0);
            const balance = totalCollected - totalFees; // Amount driver owes the company
            
            return {
                id: driver.id,
                name: driver.name,
                balance: balance,
                status: balance > 0 ? 'due' : 'paid',
            } as FinancialSummary;
        });
    }, [orders, users]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>كشوفات حسابات السائقين</CardTitle>
                <CardDescription>متابعة الأرصدة والمستحقات والمدفوعات الخاصة بالسائقين.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center whitespace-nowrap">اسم السائق</TableHead>
                            <TableHead className="text-center whitespace-nowrap">الرصيد المستحق (ذمم)</TableHead>
                            <TableHead className="text-center whitespace-nowrap">الحالة</TableHead>
                            <TableHead className="text-center whitespace-nowrap">إجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {driverAccountingData.map(driver => (
                            <TableRow key={driver.id}>
                                <TableCell className="font-medium text-center whitespace-nowrap">{driver.name}</TableCell>
                                <TableCell className={driver.balance >= 0 ? 'text-green-600 text-center whitespace-nowrap' : 'text-red-600 text-center whitespace-nowrap'}>
                                    {formatCurrency(driver.balance)}
                                </TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                    <Badge variant={driver.status === 'due' ? 'secondary' : 'default'} className={driver.status === 'due' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                                        {driver.status === 'due' ? 'مستحق للدفع' : 'تم التسوية'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                    <Button variant="outline" size="sm">عرض التفاصيل</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
};

const MerchantAccountingTab = () => {
    const { formatCurrency } = useSettings();
    const { orders } = useOrdersStore();
    const { users } = useUsersStore();

    const merchantAccountingData = useMemo(() => {
        const merchants = users.filter(u => u.roleId === 'merchant');
        return merchants.map(merchant => {
            const merchantOrders = orders.filter(o => o.merchant === merchant.storeName && o.status === 'تم التوصيل');
            const amountDue = merchantOrders.reduce((sum, order) => sum + (order.itemPrice || 0), 0);
             
            return {
                id: merchant.id,
                name: merchant.storeName || merchant.name,
                balance: amountDue, // Amount the company owes the merchant
                status: amountDue > 0 ? 'due' : 'paid',
            } as FinancialSummary;
        });
    }, [orders, users]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>كشوفات حسابات التجار</CardTitle>
                <CardDescription>إدارة المستحقات والمدفوعات ورسوم التوصيل للتجار.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center whitespace-nowrap">اسم التاجر</TableHead>
                            <TableHead className="text-center whitespace-nowrap">المبلغ المستحق</TableHead>
                            <TableHead className="text-center whitespace-nowrap">الحالة</TableHead>
                            <TableHead className="text-center whitespace-nowrap">إجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {merchantAccountingData.map(merchant => (
                            <TableRow key={merchant.id} className={merchant.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                <TableCell className="font-medium text-center whitespace-nowrap">{merchant.name}</TableCell>
                                <TableCell className="text-center whitespace-nowrap">{formatCurrency(merchant.balance)}</TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                     <Badge variant={merchant.status === 'paid' ? 'default' : (merchant.status === 'due' ? 'secondary' : 'destructive')} className={merchant.status === 'paid' ? 'bg-green-100 text-green-800' : (merchant.status === 'due' ? 'bg-yellow-100 text-yellow-800' : '')}>
                                        {merchant.status === 'paid' ? 'مدفوع' : (merchant.status === 'due' ? 'مستحق' : 'متأخر')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                    <Button variant="outline" size="sm">عرض التفاصيل</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


export default function FinancialsPage() {
  return (
    <Tabs defaultValue="drivers" className="w-full space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">المحاسبة</h1>
            <p className="text-muted-foreground">تتبع الإيرادات والمصروفات والأرباح بدقة.</p>
        </div>
        <TabsList className="grid grid-cols-2 w-auto">
            <TabsTrigger value="drivers"><Icon name="Users" className="h-4 w-4 mr-1"/> محاسبة السائقين</TabsTrigger>
            <TabsTrigger value="merchants"><Icon name="Store" className="h-4 w-4 mr-1"/> محاسبة التجار</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="drivers">
        <DriverAccountingTab />
      </TabsContent>
      <TabsContent value="merchants">
        <MerchantAccountingTab />
      </TabsContent>
    </Tabs>
  );
}
