'use client';

import {
  DollarSign,
  TrendingUp,
  Users,
  Store,
  FileText,
  Download,
} from 'lucide-react';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  LineChart,
  ComposedChart,
  ResponsiveContainer,
  PieChart,
  Pie
} from 'recharts';

// --- Data ---

const driverAccountingData = [
    { id: 1, name: 'علي الأحمد', balance: 150000, status: 'due', lastPayout: '2023-08-10' },
    { id: 2, name: 'محمد الخالد', balance: -25000, status: 'paid', lastPayout: '2023-08-15' },
    { id: 3, name: 'فاطمة الزهراء', balance: 75000, status: 'due', lastPayout: '2023-08-09' },
];

const merchantAccountingData = [
    { id: 1, name: 'تاجر أ', amountDue: 550000, status: 'due', lastPayment: '2023-07-25' },
    { id: 2, name: 'تاجر ب', amountDue: 0, status: 'paid', lastPayment: '2023-08-14' },
    { id: 3, name: 'تاجر ج', amountDue: 120000, status: 'overdue', lastPayment: '2023-07-10' },
];

const profitChartData = [
  { date: "2023-08-01", profit: 45000 },
  { date: "2023-08-02", profit: 48000 },
  { date: "2023-08-03", profit: 52000 },
  { date: "2023-08-04", profit: 47000 },
  { date: "2023-08-05", profit: 55000 },
  { date: "2023-08-06", profit: 60000 },
  { date: "2023-08-07", profit: 58000 },
];

const ordersStatusData = [
    { name: 'مكتملة', value: 1980, fill: 'hsl(var(--chart-2))' },
    { name: 'قيد التوصيل', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'مرتجعة', value: 124, fill: 'hsl(var(--chart-3))' },
];

const chartConfig = {
  profit: { label: 'الربح', color: 'hsl(var(--primary))' },
  مكتملة: { label: 'مكتملة', color: 'hsl(var(--chart-2))' },
  'قيد التوصيل': { label: 'قيد التوصيل', color: 'hsl(var(--chart-1))' },
  مرتجعة: { label: 'مرتجعة', color: 'hsl(var(--chart-3))' },
};


// --- Components ---

const DriverAccountingTab = () => (
    <Card>
        <CardHeader>
            <CardTitle>كشوفات حسابات السائقين</CardTitle>
            <CardDescription>متابعة الأرصدة والمستحقات والمدفوعات الخاصة بالسائقين.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>اسم السائق</TableHead>
                        <TableHead>الرصيد المستحق</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead className="text-right">إجراء</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {driverAccountingData.map(driver => (
                        <TableRow key={driver.id}>
                            <TableCell className="font-medium">{driver.name}</TableCell>
                            <TableCell className={driver.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {driver.balance.toLocaleString('ar-IQ')} د.ع
                            </TableCell>
                            <TableCell>
                                <Badge variant={driver.status === 'due' ? 'secondary' : 'default'} className={driver.status === 'due' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                                    {driver.status === 'due' ? 'مستحق' : 'مدفوع'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">عرض التفاصيل</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const MerchantAccountingTab = () => (
    <Card>
        <CardHeader>
            <CardTitle>كشوفات حسابات التجار</CardTitle>
            <CardDescription>إدارة المستحقات والمدفوعات ورسوم التوصيل للتجار.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>اسم التاجر</TableHead>
                        <TableHead>المبلغ المستحق</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead className="text-right">إجراء</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {merchantAccountingData.map(merchant => (
                        <TableRow key={merchant.id} className={merchant.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                            <TableCell className="font-medium">{merchant.name}</TableCell>
                            <TableCell>{merchant.amountDue.toLocaleString('ar-IQ')} د.ع</TableCell>
                            <TableCell>
                                 <Badge variant={merchant.status === 'paid' ? 'default' : (merchant.status === 'due' ? 'secondary' : 'destructive')} className={merchant.status === 'paid' ? 'bg-green-100 text-green-800' : (merchant.status === 'due' ? 'bg-yellow-100 text-yellow-800' : '')}>
                                    {merchant.status === 'paid' ? 'مدفوع' : (merchant.status === 'due' ? 'مستحق' : 'متأخر')}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">عرض التفاصيل</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const ProfitReportsTab = () => (
     <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>تقرير الأرباح اليومي</CardTitle>
                            <CardDescription>نظرة على الأرباح المحققة خلال الأسبوع الماضي.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" />
                            تصدير
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <LineChart data={profitChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                             <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('ar-IQ', {day: 'numeric', month: 'short'})} />
                             <YAxis tickFormatter={(value) => `${(value / 1000)} ألف`} />
                            <Tooltip
                                content={<ChartTooltipContent formatter={(value) => (value as number).toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD' })} />}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} name="الربح" />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>ملخص الإيرادات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center">
                        <DollarSign className="h-6 w-6 text-muted-foreground mr-4" />
                        <div>
                            <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                            <p className="text-2xl font-bold">٤٥٢,٣١٨ د.ع</p>
                        </div>
                    </div>
                     <div className="flex items-center">
                        <TrendingUp className="h-6 w-6 text-muted-foreground mr-4" />
                        <div>
                            <p className="text-sm text-muted-foreground">متوسط رسوم التوصيل</p>
                            <p className="text-2xl font-bold">٦,٢٥٠ د.ع</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>توزيع الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
                        <ResponsiveContainer width="100%" height={150}>
                             <PieChart>
                                <Tooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie data={ordersStatusData} dataKey="value" nameKey="name" innerRadius="40%" />
                                <Legend content={({ payload }) => (
                                    <ul className="flex flex-wrap gap-x-4 justify-center text-xs mt-2">
                                    {payload?.map((entry, index) => (
                                        <li key={`item-${index}`} className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></span>
                                        {entry.value}
                                        </li>
                                    ))}
                                    </ul>
                                )} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
     </div>
);


export default function FinancialsPage() {
  return (
    <Tabs defaultValue="reports" className="w-full space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">الإدارة المالية</h1>
            <p className="text-muted-foreground">تتبع الإيرادات والمصروفات والأرباح بدقة.</p>
        </div>
        <TabsList className="grid grid-cols-3 w-auto">
            <TabsTrigger value="reports"><TrendingUp className="h-4 w-4 mr-1"/> تقارير الأرباح</TabsTrigger>
            <TabsTrigger value="drivers"><Users className="h-4 w-4 mr-1"/> محاسبة السائقين</TabsTrigger>
            <TabsTrigger value="merchants"><Store className="h-4 w-4 mr-1"/> محاسبة التجار</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="reports">
        <ProfitReportsTab />
      </TabsContent>
      <TabsContent value="drivers">
        <DriverAccountingTab />
      </TabsContent>
      <TabsContent value="merchants">
        <MerchantAccountingTab />
      </TabsContent>
    </Tabs>
  );
}
