'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Package,
    Truck,
    Store,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    FileDown
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { exportToPDF, PDFExportOptions } from '@/lib/pdf-export-utils';
import { useToast } from '@/hooks/use-toast';
import { DebtAlerts } from './debt-alerts';
import { DateRangePicker } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface FinancialOverviewData {
    period: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    ordersCount: number;
    deliveredCount: number;
    pendingPaymentsMerchant: number;
    pendingPaymentsDriver: number;
    periodComparison: {
        previousPeriod: number;
        currentPeriod: number;
        growthPercent: number;
    };
}

type Period = 'today' | 'week' | 'month';

export function FinancialOverview() {
    const [data, setData] = useState<FinancialOverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('month');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const { formatCurrency, formatDate } = useSettings();

    const fetchData = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            let queryParams = `period=${period}`;
            if (dateRange?.from && dateRange?.to) {
                const start = format(dateRange.from, 'yyyy-MM-dd');
                const end = format(dateRange.to, 'yyyy-MM-dd');
                queryParams = `startDate=${start}&endDate=${end}`;
            }

            const response = await fetch(`${API_URL}/financials/overview?${queryParams}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch financial overview:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            // If date range is selected, fetch with custom range
            fetchData();
        } else {
            // Otherwise fetch based on period
            fetchData();
        }
    }, [period, dateRange]);

    const periodLabels: Record<Period, string> = {
        today: 'اليوم',
        week: 'الأسبوع',
        month: 'الشهر',
    };

    const { toast } = useToast();

    const handleExportPDF = async () => {
        if (!data) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لا توجد بيانات للتصدير.' });
            return;
        }

        try {
            const today = formatDate(new Date(), { longFormat: true });

            const pdfOptions: PDFExportOptions = {
                title: 'الملخص المالي',
                subtitle: `الفترة: ${periodLabels[period]}`,
                date: today,
                tableHeaders: ['البيان', 'المبلغ'],
                tableRows: [
                    ['إجمالي الإيرادات (COD)', formatCurrency(data.totalRevenue)],
                    ['إجمالي المصروفات', formatCurrency(data.totalExpenses)],
                    ['صافي الربح (عمولات التوصيل)', formatCurrency(data.netProfit)],
                    ['عدد الطلبات', data.ordersCount.toString()],
                    ['طلبات تم توصيلها', data.deliveredCount.toString()],
                    ['مستحقات التجار المعلقة', formatCurrency(data.pendingPaymentsMerchant)],
                    ['مستحقات السائقين المعلقة', formatCurrency(data.pendingPaymentsDriver)],
                ],
                footerRow: ['النمو مقارنة بالفترة السابقة', `${data.periodComparison.growthPercent > 0 ? '+' : ''}${data.periodComparison.growthPercent}%`],
                showSignatures: false,
                orientation: 'portrait'
            };

            const fileName = `الملخص_المالي_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
            await exportToPDF(pdfOptions, fileName);

            toast({
                title: 'تم التصدير بنجاح',
                description: 'تم تصدير الملخص المالي إلى ملف PDF.'
            });
        } catch (error) {
            console.error('PDF export error:', error);
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير البيانات.'
            });
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    const growth = data?.periodComparison.growthPercent ?? 0;
    const isPositiveGrowth = growth > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">الملخص المالي</h2>
                    <p className="text-muted-foreground">نظرة عامة على الإيرادات والمصروفات</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-muted rounded-lg p-1">
                        {(['today', 'week', 'month'] as Period[]).map((p) => (
                            <Button
                                key={p}
                                variant={period === p && !dateRange ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => {
                                    setPeriod(p);
                                    setDateRange(undefined); // Reset Custom Range
                                }}
                                className="px-3"
                            >
                                {periodLabels[p]}
                            </Button>
                        ))}
                    </div>
                    <DateRangePicker
                        initialDateRange={dateRange}
                        onUpdate={(values) => {
                            setDateRange(values.range);
                            // Period will be ignored in fetchData if dateRange is set
                        }}
                        align="end"
                        locale="ar"
                    />
                    <Button variant="outline" size="icon" onClick={handleExportPDF} title="تصدير PDF">
                        <FileDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchData} title="تحديث">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue Card */}
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data?.totalRevenue ?? 0)}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {isPositiveGrowth ? (
                                <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={isPositiveGrowth ? 'text-emerald-600' : 'text-red-600'}>
                                {growth > 0 ? '+' : ''}{growth}%
                            </span>
                            <span className="mr-1">مقارنة بالفترة السابقة</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Expenses Card */}
                <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data?.totalExpenses ?? 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            أجور السائقين + مستحقات التجار
                        </p>
                    </CardContent>
                </Card>

                {/* Net Profit Card */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data?.netProfit ?? 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            عمولات التوصيل
                        </p>
                    </CardContent>
                </Card>

                {/* Orders Card */}
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Package className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.ordersCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data?.deliveredCount ?? 0} تم التوصيل
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Payments */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-base font-medium">مستحقات التجار المعلقة</CardTitle>
                            <CardDescription>مبالغ لم يتم تسليمها للتجار</CardDescription>
                        </div>
                        <Store className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">
                            {formatCurrency(data?.pendingPaymentsMerchant ?? 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-base font-medium">مستحقات السائقين المعلقة</CardTitle>
                            <CardDescription>أجور لم يتم صرفها للسائقين</CardDescription>
                        </div>
                        <Truck className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                            {formatCurrency(data?.pendingPaymentsDriver ?? 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Debt Alerts Section */}
            <div>
                <h3 className="text-lg font-semibold mb-3">تنبيهات المديونية</h3>
                <DebtAlerts />
            </div>
        </div>
    );
}
