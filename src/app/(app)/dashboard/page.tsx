
'use client';

import {
  AlertCircle,
  ArrowUpRight,
  Ban,
  CheckCircle,
  ChevronRight,
  DollarSign,
  PackageSearch,
  ShoppingCart,
  Star,
  Truck,
  X,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const monthlySalesData = [
  { month: 'يناير', sales: 186000 },
  { month: 'فبراير', sales: 305000 },
  { month: 'مارس', sales: 237000 },
  { month: 'أبريل', sales: 273000 },
  { month: 'مايو', sales: 209000 },
  { month: 'يونيو', sales: 214000 },
];

const orderStatusData = [
    { name: 'قيد التوصيل', value: 400, fill: 'var(--color-delivering)' },
    { name: 'مكتملة', value: 1980, fill: 'var(--color-completed)' },
    { name: 'مرتجعة', value: 124, fill: 'var(--color-returned)' },
    { name: 'قيد الانتظار', value: 210, fill: 'var(--color-pending)' },
    { name: 'متأخرة', value: 35, fill: 'var(--color-delayed)' },
];


const topDrivers = [
    { name: "علي الأحمد", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", completed: 125, delayed: 2, returned: 1, rate: 98, assigned: 128 },
    { name: "محمد الخالد", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d", completed: 110, delayed: 5, returned: 3, rate: 95, assigned: 118 },
    { name: "فاطمة الزهراء", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d", completed: 98, delayed: 1, returned: 0, rate: 99, assigned: 99 },
    { name: "يوسف إبراهيم", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d", completed: 95, delayed: 8, returned: 2, rate: 93, assigned: 105 },
    { name: "عائشة بكر", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708d", completed: 90, delayed: 3, returned: 5, rate: 92, assigned: 98 },
]


const chartConfig = {
  sales: {
    label: 'المبيعات',
    color: 'hsl(var(--primary))',
  },
  delivering: { label: 'قيد التوصيل', color: 'hsl(210 90% 50%)' },
  completed: { label: 'مكتملة', color: 'hsl(142 71% 45%)' },
  returned: { label: 'مرتجعة', color: 'hsl(0 72% 51%)' },
  pending: { label: 'قيد الانتظار', color: 'hsl(48 96% 50%)' },
  delayed: { label: 'متأخرة', color: 'hsl(25 95% 53%)' },
};


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Alerts Panel */}
      <div className="space-y-2">
        <Alert variant="destructive" className="bg-red-100 dark:bg-red-900/30 border-red-500/50 text-red-800 dark:text-red-300">
            <AlertCircle className="h-4 w-4 !text-red-600 dark:!text-red-400" />
            <AlertTitle className="font-bold">تنبيه: طلبات متأخرة!</AlertTitle>
            <AlertDescription>
                يوجد 5 طلبات تجاوزت الوقت المحدد للتسليم. <Link href="/orders?status=delayed" className="underline font-semibold">عرض التفاصيل</Link>
            </AlertDescription>
        </Alert>
         <Alert className="bg-orange-100 dark:bg-orange-900/30 border-orange-500/50 text-orange-800 dark:text-orange-300">
            <AlertCircle className="h-4 w-4 !text-orange-600 dark:!text-orange-400" />
            <AlertTitle className="font-bold">تنبيه: طلبات ذات أولوية عالية</AlertTitle>
            <AlertDescription>
                لديك 8 طلبات جديدة ذات أولوية عالية تحتاج إلى تعيين سائق. <Link href="/orders?priority=high" className="underline font-semibold">عرض التفاصيل</Link>
            </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* General Stats Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>الإحصائيات العامة</CardTitle>
            <CardDescription>نظرة شاملة على أداء أعمالك.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <DollarSign className="h-8 w-8 text-muted-foreground"/>
                    <div>
                        <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                        <p className="text-2xl font-bold">٤٥٢,٣١٨ د.ع</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground"/>
                    <div>
                        <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                        <p className="text-2xl font-bold">٢,٣٥٠</p>
                    </div>
                </div>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart
                        data={monthlySalesData}
                        layout="vertical"
                        margin={{ left: 10, right: 10, top:10, bottom: 0 }}
                        accessibilityLayer
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                        dataKey="month"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        />
                        <XAxis type="number" hide />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            content={<ChartTooltipContent indicator="line" formatter={(value) => value.toLocaleString('ar-IQ')} />}
                        />
                        <Bar dataKey="sales" fill="var(--color-sales)" radius={5} />
                    </BarChart>
                </ChartContainer>
             </div>
             <div className="flex flex-col items-center justify-center">
                 <p className="font-medium text-center mb-2">توزيع حالات الطلبات</p>
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-[300px] mx-auto">
                    <PieChart>
                         <Tooltip
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie data={orderStatusData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                             {orderStatusData.map((entry, index) => (
                                <div key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
             </div>
          </CardContent>
        </Card>

        {/* Driver Performance Cards */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>أداء السائقين</CardTitle>
            <CardDescription>نظرة على أداء أفضل السائقين.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 overflow-y-auto">
           {topDrivers.map((driver, index) => (
             <div key={driver.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={driver.avatar} alt={driver.name} />
                    <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{driver.name} {index === 0 && <Star className="inline h-4 w-4 text-accent fill-accent"/>}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{driver.completed} مكتملة</span>
                    <span>&bull;</span>
                    <span>{driver.delayed} مؤجلة</span>
                     <span>&bull;</span>
                    <span>{driver.returned} مرتجعة</span>
                  </div>
                   <div className="w-full bg-muted rounded-full h-2.5 mt-1">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${driver.rate}%` }}></div>
                    </div>
                </div>
                 <Button variant="ghost" size="icon" className="shrink-0">
                    <ChevronRight className="h-5 w-5" />
                 </Button>
             </div>
           ))}
          </CardContent>
        </Card>

      </div>
        
    </div>
  );
}

    