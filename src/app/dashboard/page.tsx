
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';


const chartConfig = {
  delivered: { label: 'تم التوصيل', color: 'hsl(var(--chart-2))' },
  postponed: { label: 'مؤجلة', color: 'hsl(var(--chart-4))' },
  returned: { label: 'مرتجعة', color: 'hsl(var(--chart-3))' },
  profit: { label: 'الربح', color: 'hsl(var(--primary))' },
  'تم التوصيل': { label: 'مكتملة', color: 'hsl(var(--chart-2))' },
  'جاري التوصيل': { label: 'قيد التوصيل', color: 'hsl(var(--chart-1))' },
  'راجع': { label: 'مرتجعة', color: 'hsl(var(--chart-3))' },
};


const RevenueCard = ({ title, value, iconName, color = 'text-green-500' }: { title: string, value: string | number, iconName: any, color?: string }) => (
    <Card>
        <CardContent className="p-4 flex items-center justify-center text-center h-full">
             <Icon name={iconName} className={`w-8 h-8 ml-4 ${color}`} />
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const [selectedDriver, setSelectedDriver] = useState('all');
    const { formatCurrency } = useSettings();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();

    const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);

    const driverStats = useMemo(() => {
        return drivers.map(driver => {
            const driverOrders = orders.filter(o => o.driver === driver.name);
            const completed = driverOrders.filter(o => o.status === 'تم التوصيل').length;
            const postponed = driverOrders.filter(o => o.status === 'مؤجل').length;
            const returned = driverOrders.filter(o => o.status === 'راجع').length;
            const total = driverOrders.length;
            return {
                id: driver.id,
                name: driver.name,
                avatar: driver.avatar,
                phone: driver.email,
                status: 'نشط', // Placeholder
                completed,
                postponed,
                returned,
                total
            };
        });
    }, [drivers, orders]);

    const orderStatusData = useMemo(() => {
        return orders.reduce((acc, order) => {
            const status = order.status;
            if (!acc[status]) {
                acc[status] = { name: status, value: 0 };
            }
            acc[status].value++;
            return acc;
        }, {} as Record<string, {name: string, value: number}>);
    }, [orders]);

    const profitChartData = useMemo(() => {
        const dataByDate = orders.reduce((acc, order) => {
            if (order.status === 'تم التوصيل') {
                const date = order.date;
                if (!acc[date]) {
                    acc[date] = 0;
                }
                acc[date] += (order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(dataByDate)
            .map(([date, profit]) => ({ date, profit }))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [orders]);

    const filteredDriverStats = selectedDriver === 'all'
        ? driverStats
        : driverStats.filter(driver => driver.name === selectedDriver);

    const barChartData = driverStats.map(d => ({
        name: d.name,
        delivered: d.completed,
        postponed: d.postponed,
        returned: d.returned
    }));

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>

            <Card>
                <CardHeader>
                    <CardTitle>إحصائيات عامة</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <RevenueCard title="إجمالي الإيرادات" value={formatCurrency(profitChartData.reduce((sum, item) => sum + (item.profit || 0), 0))} iconName="TrendingUp" />
                         <RevenueCard title="إجمالي الطلبات" value={orders.length} iconName="ShoppingCart" color="text-blue-500" />
                        {Object.values(orderStatusData).map((stat) => (
                             <Button
                                key={stat.name}
                                asChild
                                variant="outline"
                                className={`h-auto flex-col items-center justify-center p-4 transition-colors`}
                            >
                                <Link href={`/dashboard/orders?status=${encodeURIComponent(stat.name)}`}>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                                </Link>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>نظرة عامة على أداء السائقين</CardTitle>
                            <CardDescription>عرض ملخص لأداء كل سائق على حدة.</CardDescription>
                        </div>
                        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                            <SelectTrigger className="w-full sm:w-[240px]">
                                <SelectValue placeholder="فلترة حسب السائق" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">كل السائقين</SelectItem>
                                {drivers.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredDriverStats.map((driver, index) => {
                            const { id, name, phone, status, completed, postponed, returned, total, avatar } = driver;
                            const progressValue = total > 0 ? (completed / total) * 100 : 0;

                            const statsList = [
                                { label: 'تم التوصيل', value: completed, color: 'text-green-500', filter: 'تم التوصيل', iconName: 'PackageCheck' as const },
                                { label: 'مؤجلة', value: postponed, color: 'text-orange-500', filter: 'مؤجل', iconName: 'RefreshCw' as const },
                                { label: 'مرتجعة', value: returned, color: 'text-red-500', filter: 'راجع', iconName: 'XCircle' as const },
                            ];

                            return (
                                <Card key={id} className="overflow-hidden">
                                     <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="flex flex-1 items-center gap-4">
                                            <Avatar className="h-14 w-14">
                                                <AvatarImage src={avatar} alt={name} data-ai-hint="driver profile" />
                                                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link href={`/dashboard/driver-app`} className="font-bold text-lg hover:text-primary flex items-center gap-1">
                                                    {name}
                                                    {index === 0 && selectedDriver === 'all' && <Icon name="Star" className="inline h-4 w-4 text-yellow-500 fill-yellow-500"/>}
                                                </Link>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Icon name="Phone" className="w-3 h-3" />
                                                    {phone}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${status === 'نشط' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                            <span className="text-sm font-medium">{status}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="text-sm text-muted-foreground">مستوى الإنجاز</span>
                                              <span className="font-semibold">{Math.round(progressValue)}%</span>
                                          </div>
                                          <Progress value={progressValue} className="h-2" />
                                          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                              <span>{completed} من {total}</span>
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2 text-center">
                                          {statsList.map(s => (
                                              <Link key={s.label} href={`/dashboard/orders?driver=${encodeURIComponent(name)}&status=${encodeURIComponent(s.filter)}`} className="hover:bg-accent/50 rounded-md p-2 transition-colors flex flex-col items-center justify-center">
                                                  <Icon name={s.iconName} className={`w-5 h-5 mb-1 ${s.color}`} />
                                                  <p className="font-semibold text-base">{s.value}</p>
                                                  <p className="text-xs text-muted-foreground">{s.label}</p>
                                              </Link>
                                          ))}
                                      </div>
                                    </div>
                                </Card>
                            )
                        })}
                        {filteredDriverStats.length === 0 && (
                            <div className="lg:col-span-2 text-center text-muted-foreground py-10">
                                {selectedDriver ? `لم يتم العثور على سائق بهذا الاسم.` : `لا يوجد سائقين لعرضهم.`}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>أداء السائقين (مقارنة)</CardTitle>
                        <CardDescription>مقارنة بين عدد الشحنات المسلمة، المؤجلة، والملغية لكل سائق.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                       <ChartContainer config={chartConfig} className="h-full w-full">
                            <BarChart data={barChartData} accessibilityLayer margin={{ top: 20, right: 20, bottom: 40, left: -10 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar dataKey="delivered" name="تم التوصيل" fill="var(--color-delivered)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="postponed" name="مؤجلة" fill="var(--color-postponed)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="returned" name="مرتجعة" fill="var(--color-returned)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <div className="space-y-8">
                     <Card>
                         <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>تقرير الأرباح اليومي</CardTitle>
                                    <CardDescription>نظرة على الأرباح المحققة خلال الأسبوع الماضي.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="gap-1">
                                    <Icon name="Download" className="h-4 w-4" />
                                    تصدير
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px] -mt-6">
                            <ChartContainer config={chartConfig} className="w-full h-full">
                                <LineChart data={profitChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} />
                                     <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('ar-JO', {day: 'numeric', month: 'short'})} />
                                     <YAxis tickFormatter={(value) => `${(value)}`} />
                                    <Tooltip
                                        content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} name="الربح" />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    )
}

    