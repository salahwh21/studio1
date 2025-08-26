
'use client';

import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  Star,
  Truck,
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
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

const revenueData = [
    { month: 'يناير', revenue: 45231.84 },
    { month: 'فبراير', revenue: 47890.12 },
    { month: 'مارس', revenue: 51234.56 },
    { month: 'أبريل', revenue: 53890.78 },
    { month: 'مايو', revenue: 55123.45 },
    { month: 'يونيو', revenue: 58345.90 },
];

const orderStatusData = [
    { name: 'قيد التوصيل', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'مكتملة', value: 1980, fill: 'hsl(var(--chart-2))' },
    { name: 'مرتجعة', value: 124, fill: 'hsl(var(--chart-3))' },
    { name: 'قيد الانتظار', value: 210, fill: 'hsl(var(--chart-4))' },
    { name: 'متأخرة', value: 35, fill: 'hsl(var(--chart-5))' },
];


const topDrivers = [
    { name: "علي الأحمد", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", completed: 125, delayed: 2, returned: 1, rate: 98, assigned: 128 },
    { name: "محمد الخالد", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d", completed: 110, delayed: 5, returned: 3, rate: 95, assigned: 118 },
    { name: "فاطمة الزهراء", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d", completed: 98, delayed: 1, returned: 0, rate: 99, assigned: 99 },
    { name: "يوسف إبراهيم", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d", completed: 95, delayed: 8, returned: 2, rate: 93, assigned: 105 },
    { name: "عائشة بكر", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708d", completed: 90, delayed: 3, returned: 5, rate: 92, assigned: 98 },
]


const chartConfig = {
  revenue: {
    label: 'الإيرادات',
    color: 'hsl(var(--primary))',
  },
  'قيد التوصيل': { label: 'قيد التوصيل', color: 'hsl(var(--chart-1))' },
  'مكتملة': { label: 'مكتملة', color: 'hsl(var(--chart-2))' },
  'مرتجعة': { label: 'مرتجعة', color: 'hsl(var(--chart-3))' },
  'قيد الانتظار': { label: 'قيد الانتظار', color: 'hsl(var(--chart-4))' },
  'متأخرة': { label: 'متأخرة', color: 'hsl(var(--chart-5))' },
};


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      
      <div className="space-y-2">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">تنبيه: 35 طلب متأخر!</AlertTitle>
            <AlertDescription>
                تجاوزت بعض الطلبات الوقت المحدد للتسليم. <Link href="/orders?status=delayed" className="underline font-semibold">عرض التفاصيل</Link>
            </AlertDescription>
        </Alert>
         <Alert className="bg-orange-100 dark:bg-orange-900/30 border-orange-500/50 text-orange-800 dark:text-orange-300">
            <AlertCircle className="h-4 w-4 !text-orange-600 dark:!text-orange-400" />
            <AlertTitle className="font-bold">تنبيه: 8 طلبات ذات أولوية عالية</AlertTitle>
            <AlertDescription>
                لديك طلبات جديدة ذات أولوية عالية تحتاج إلى تعيين سائق. <Link href="/orders?priority=high" className="underline font-semibold">عرض التفاصيل</Link>
            </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>الإحصائيات العامة</CardTitle>
            <CardDescription>نظرة شاملة على أداء أعمالك خلال الـ 6 أشهر الماضية.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
             <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-start gap-2 p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-6 w-6 text-muted-foreground"/>
                            <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                        </div>
                        <p className="text-2xl font-bold">٤٥٢,٣١٨ د.ع</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-6 w-6 text-muted-foreground"/>
                            <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                        </div>
                        <p className="text-2xl font-bold">٢,٣٥٠</p>
                    </div>
                 </div>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <LineChart
                        data={revenueData}
                        margin={{ left: -20, right: 10, top:10, bottom: 0 }}
                        accessibilityLayer
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                             tickFormatter={(value) => `${(value / 1000).toLocaleString()} ألف`}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={<ChartTooltipContent indicator="dot" formatter={(value) => new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD' }).format(value as number)} />}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={true} />
                    </LineChart>
                </ChartContainer>
             </div>
             <div className="flex flex-col items-center justify-center">
                <p className="font-medium text-center mb-2">توزيع حالات الطلبات</p>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie data={orderStatusData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" paddingAngle={5}>
                      </Pie>
                      <Legend content={<ChartLegendContent nameKey="name" />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
             </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>أداء أفضل السائقين</CardTitle>
            <CardDescription>نظرة سريعة على أداء السائقين</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 overflow-y-auto pr-4">
           {topDrivers.map((driver, index) => (
             <Link href={'/driver-app'} key={driver.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={driver.avatar} alt={driver.name} />
                    <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{driver.name} {index === 0 && <Star className="inline h-4 w-4 text-green-500 fill-green-500"/>}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{driver.completed} مكتملة</span>
                    <span className="text-gray-400">&bull;</span>
                    <span>{driver.assigned} معينة</span>
                  </div>
                   <div className="w-full bg-muted rounded-full h-2.5 mt-1">
                      <div className="h-2.5 rounded-full" style={{ width: `${(driver.completed/driver.assigned)*100}%`, backgroundColor: index === 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--primary))' }}></div>
                    </div>
                </div>
                 <div className="flex flex-col items-end">
                    <span className="font-bold text-lg" style={{ color: index === 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--foreground))' }}>{((driver.completed/driver.assigned)*100).toFixed(0)}%</span>
                    <span className="text-xs text-muted-foreground">إنجاز</span>
                 </div>
             </Link>
           ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
