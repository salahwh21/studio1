
'use client';

import { ArrowUpRight, DollarSign, ReceiptText, ShoppingCart, CheckCircle, XCircle, Truck, Star, Ban, PackageSearch } from 'lucide-react';
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
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const monthlySalesData = [
  { month: 'يناير', sales: 1860 },
  { month: 'فبراير', sales: 3050 },
  { month: 'مارس', sales: 2370 },
  { month: 'أبريل', sales: 2730 },
  { month: 'مايو', sales: 2090 },
  { month: 'يونيو', sales: 2140 },
];

const chartConfig = {
  sales: {
    label: 'المبيعات',
    color: 'hsl(var(--primary))',
  },
};

const topDrivers = [
    { name: "علي الأحمد", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", completed: 125, delayed: 2, returned: 1, rate: "98%" },
    { name: "محمد الخالد", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d", completed: 110, delayed: 5, returned: 3, rate: "95%" },
    { name: "فاطمة الزهراء", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d", completed: 98, delayed: 1, returned: 0, rate: "99%" },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">٤٥,٢٣١.٨٩ د.ع</div>
            <p className="text-xs text-muted-foreground">نمو بنسبة ٢٠.١٪ عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+٢,٣٥٠</div>
            <p className="text-xs text-muted-foreground">نمو بنسبة ٨٠.١٪ عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+١,٩٨٠</div>
            <p className="text-xs text-muted-foreground">نمو بنسبة ١٩٪ عن الشهر الماضي</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات الملغاة</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+٣٥</div>
            <p className="text-xs text-muted-foreground">انخفاض بنسبة ٢٪ عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المرتجعات</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">١٢٤</div>
            <p className="text-xs text-muted-foreground">انخفاض بنسبة ٥٪ عن الشهر الماضي</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>نظرة عامة على الإيرادات</CardTitle>
            <CardDescription>نظرة عامة على إيرادات الأشهر الستة الماضية.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart data={monthlySalesData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => `${value / 1000} ألف`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>أحدث الطلبات</CardTitle>
              <CardDescription>نظرة عامة على أحدث الطلبات المستلمة.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/orders">
                عرض الكل
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العميل</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">علي الأحمد</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      ali.ahmed@example.com
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">تم التوصيل</Badge>
                  </TableCell>
                  <TableCell className="text-right">٢٥٠.٠٠ د.ع</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">فاطمة الخان</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      fatima.khan@example.com
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">قيد التجهيز</Badge>
                  </TableCell>
                  <TableCell className="text-right">١٥٠.٠٠ د.ع</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">يوسف إبراهيم</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      yusuf.i@example.com
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">تم التوصيل</Badge>
                  </TableCell>
                  <TableCell className="text-right">٣٥٠.٠٠ د.ع</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>
                    <div className="font-medium">عائشة بكر</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      a.bakr@example.com
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">ملغي</Badge>
                  </TableCell>
                  <TableCell className="text-right">٥٠.٠٠ د.ع</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">عمر حسن</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      omar.h@example.com
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">تم التوصيل</Badge>
                  </TableCell>
                  <TableCell className="text-right">٤٥٠.٠٠ د.ع</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <div>
        <h2 className="text-xl font-semibold mb-4">أداء أفضل السائقين</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topDrivers.map((driver, index) => (
             <Card key={index} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                 <Avatar className="h-12 w-12">
                    <AvatarImage src={driver.avatar} alt={driver.name} />
                    <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle>{driver.name}</CardTitle>
                  <CardDescription>نسبة الإنجاز: {driver.rate}</CardDescription>
                </div>
                {index === 0 && <Badge className="ml-auto bg-accent text-accent-foreground"><Star className="h-4 w-4 mr-1"/>الأفضل</Badge>}
              </CardHeader>
              <CardContent className="grid flex-1 grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-md bg-green-100 dark:bg-green-900/50 p-2 flex flex-col justify-center">
                    <p className="font-bold text-lg text-green-700 dark:text-green-400">{driver.completed}</p>
                    <p className="text-xs text-green-600 dark:text-green-500">مكتمل</p>
                </div>
                 <div className="rounded-md bg-yellow-100 dark:bg-yellow-900/50 p-2 flex flex-col justify-center">
                    <p className="font-bold text-lg text-yellow-700 dark:text-yellow-400">{driver.delayed}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500">مؤجل</p>
                </div>
                 <div className="rounded-md bg-red-100 dark:bg-red-900/50 p-2 flex flex-col justify-center">
                    <p className="font-bold text-lg text-red-700 dark:text-red-400">{driver.returned}</p>
                    <p className="text-xs text-red-600 dark:text-red-500">مرتجع</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
