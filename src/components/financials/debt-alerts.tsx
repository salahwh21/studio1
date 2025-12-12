'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertTriangle,
    Truck,
    Store,
    RefreshCw,
    ChevronRight,
    Bell
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

interface DebtItem {
    name: string;
    pendingOrders: number;
    pendingAmount: number;
    oldestOrderDate: string;
    urgency: 'low' | 'medium' | 'high';
}

interface DebtAlertsData {
    drivers: DebtItem[];
    merchants: DebtItem[];
    summary: {
        totalDriverDebt: number;
        totalMerchantDebt: number;
        driversWithDebt: number;
        merchantsAwaitingPayment: number;
        highUrgencyCount: number;
    };
}

export function DebtAlerts() {
    const [data, setData] = useState<DebtAlertsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { formatCurrency } = useSettings();
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${API_URL}/financials/debt-alerts`, {
                credentials: 'include',
            });
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch debt alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSendReminder = async (item: DebtItem) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${API_URL}/financials/notify-debt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: item.name,
                    amount: item.pendingAmount,
                    method: 'email'
                }),
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                toast({
                    title: 'تم الإرسال',
                    description: result.message,
                });
            }
        } catch (error) {
            console.error('Failed to send reminder:', error);
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: 'فشل إرسال التنبيه',
            });
        }
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'high':
                return <Badge variant="destructive" className="text-xs">عاجل</Badge>;
            case 'medium':
                return <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-700">متوسط</Badge>;
            default:
                return <Badge variant="outline" className="text-xs">عادي</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Alert */}
            {data?.summary.highUrgencyCount && data.summary.highUrgencyCount > 0 && (
                <Card className="border-red-500/50 bg-red-500/5">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-red-700">
                                    {data.summary.highUrgencyCount} حالة تحتاج اهتمام عاجل
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    طلبات متأخرة أكثر من 7 أيام
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {/* Drivers with Debt */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-blue-600" />
                            <div>
                                <CardTitle className="text-base">سائقون عليهم مبالغ</CardTitle>
                                <CardDescription>
                                    إجمالي: {formatCurrency(data?.summary.totalDriverDebt ?? 0)}
                                </CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={fetchData}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-48">
                            {data?.drivers && data.drivers.length > 0 ? (
                                <div className="space-y-2">
                                    {data.drivers.map((driver, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{driver.name}</span>
                                                {getUrgencyBadge(driver.urgency)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-left">
                                                    <p className="font-semibold text-sm">{formatCurrency(driver.pendingAmount)}</p>
                                                    <p className="text-xs text-muted-foreground">{driver.pendingOrders} طلب</p>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSendReminder(driver)} title="إرسال تذكير">
                                                    <Bell className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    لا توجد مبالغ معلقة
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Merchants Awaiting Payment */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-purple-600" />
                            <div>
                                <CardTitle className="text-base">تجار ينتظرون الدفع</CardTitle>
                                <CardDescription>
                                    إجمالي: {formatCurrency(data?.summary.totalMerchantDebt ?? 0)}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-48">
                            {data?.merchants && data.merchants.length > 0 ? (
                                <div className="space-y-2">
                                    {data.merchants.map((merchant, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{merchant.name}</span>
                                                {getUrgencyBadge(merchant.urgency)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-left">
                                                    <p className="font-semibold text-sm">{formatCurrency(merchant.pendingAmount)}</p>
                                                    <p className="text-xs text-muted-foreground">{merchant.pendingOrders} طلب</p>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSendReminder(merchant)} title="إرسال تذكير">
                                                    <Bell className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    لا توجد مبالغ معلقة
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
