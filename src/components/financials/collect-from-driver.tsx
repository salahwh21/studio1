
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOrdersStore } from '@/store/orders-store';
import { useUsersStore } from '@/store/user-store';
import { useSettings } from '@/contexts/SettingsContext';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const CollectFromDriver = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const { formatCurrency } = useSettings();

    const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);

    const driverCollections = useMemo(() => {
        const collections: Record<string, { orderCount: number; amount: number; }> = {};
        
        orders.forEach(order => {
            if (order.status === 'تم التوصيل' && order.driver) {
                if (!collections[order.driver]) {
                    collections[order.driver] = { orderCount: 0, amount: 0 };
                }
                collections[order.driver].orderCount++;
                collections[order.driver].amount += order.cod;
            }
        });
        
        return Object.entries(collections).map(([driverName, data]) => ({
            driverName,
            ...data
        }));
    }, [orders]);

    const handleConfirmCollection = (driverName: string, amount: number) => {
        toast({
            title: "تم تأكيد الاستلام (محاكاة)",
            description: `تم تسجيل استلام مبلغ ${formatCurrency(amount)} من السائق ${driverName}.`,
        });
        // In a real app, you would update the order statuses or create a financial transaction record here.
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>المرحلة الأولى: تحصيل المبالغ من السائقين</CardTitle>
                <CardDescription>
                    عرض المبالغ المستحقة على السائقين من الشحنات التي تم توصيلها وتأكيد استلامها.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center border-l">اسم السائق</TableHead>
                            <TableHead className="text-center border-l">عدد الشحنات</TableHead>
                            <TableHead className="text-center border-l">المبلغ المستحق</TableHead>
                            <TableHead className="text-center">إجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {driverCollections.length > 0 ? driverCollections.map(collection => (
                            <TableRow key={collection.driverName}>
                                <TableCell className="text-center border-l font-medium">{collection.driverName}</TableCell>
                                <TableCell className="text-center border-l">
                                    <Badge variant="secondary">{collection.orderCount}</Badge>
                                </TableCell>
                                <TableCell className="text-center border-l font-bold text-primary">{formatCurrency(collection.amount)}</TableCell>
                                <TableCell className="text-center">
                                    <Button size="sm" onClick={() => handleConfirmCollection(collection.driverName, collection.amount)}>
                                        <Icon name="Check" className="ml-2 h-4 w-4" />
                                        تأكيد استلام المبلغ
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">لا توجد مبالغ مستحقة للتحصيل حاليًا.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
