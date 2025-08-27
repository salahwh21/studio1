
'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  TrendingUp,
  Phone,
  PackageCheck,
  RefreshCw,
  XCircle,
  Star,
  ShoppingCart,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const topDrivers = [
    { id: 1, name: "علي الأحمد", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", phone: '07912345678', status: 'نشط', completed: 125, postponed: 5, returned: 2, total: 132 },
    { id: 2, name: "محمد الخالد", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d", phone: '07812345678', status: 'نشط', completed: 110, postponed: 8, returned: 3, total: 121 },
    { id: 3, name: "فاطمة الزهراء", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026706d", phone: '07712345678', status: 'نشط', completed: 98, postponed: 2, returned: 1, total: 101 },
    { id: 4, name: "يوسف إبراهيم", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d", phone: '07923456789', status: 'إجازة', completed: 95, postponed: 10, returned: 5, total: 110 },
    { id: 5, name: "عائشة بكر", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708d", phone: '07823456789', status: 'نشط', completed: 90, postponed: 4, returned: 6, total: 100 },
];

const orderStatusData = [
    { name: 'مكتملة', value: 1980, color: 'border-green-500/50 hover:bg-green-50' },
    { name: 'قيد التوصيل', value: 400, color: 'border-blue-500/50 hover:bg-blue-50' },
    { name: 'قيد الانتظار', value: 210, color: 'border-yellow-500/50 hover:bg-yellow-50' },
    { name: 'متأخرة', value: 35, color: 'border-orange-500/50 hover:bg-orange-50' },
    { name: 'مرتجعة', value: 124, color: 'border-red-500/50 hover:bg-red-50' },
];

const chartConfig = {
  delivered: { label: 'تم التوصيل', color: 'hsl(var(--chart-2))' },
  postponed: { label: 'مؤجلة', color: 'hsl(var(--chart-4))' },
  returned: { label: 'ملغية/مرتجعة', color: 'hsl(var(--chart-3))' },
};

const chartData = topDrivers.map(d => ({
    name: d.name,
    delivered: d.completed,
    postponed: d.postponed,
    returned: d.returned
}));


const StatCard = ({ title, value, icon: Icon, color = 'text-primary' }: { title: string, value: string | number, icon?: React.ElementType, color?: string }) => (
    <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </CardContent>
    </Card>
);

const RevenueCard = ({ title, value, icon: Icon, color = 'text-green-500' }: { title: string, value: string | number, icon: React.ElementType, color?: string }) => (
    <Card>
        <CardContent className="p-4 flex items-center justify-center text-center h-full">
             <Icon className={`w-8 h-8 ml-4 ${color}`} />
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </CardContent>
    </Card>
);


export default function DashboardPage() {
    const [selectedDriver, setSelectedDriver] = useState('all');

    const filteredDriverStats = selectedDriver === 'all'
        ? topDrivers
        : topDrivers.filter(driver => driver.name === selectedDriver);

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>إحصائيات عامة</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <RevenueCard title="إجمالي الإيرادات" value={`4,523 د.أ`} icon={TrendingUp} />
                         <RevenueCard title="إجمالي الطلبات" value="2,350" icon={ShoppingCart} color="text-blue-500" />
                        {orderStatusData.map((stat) => (
                             <Button
                                key={stat.name}
                                asChild
                                variant="outline"
                                className={`h-auto flex-col items-center justify-center p-4 transition-colors ${stat.color}`}
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
                                {topDrivers.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
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
                                { label: 'تم التوصيل', value: completed, color: 'text-green-500', filter: 'delivered', icon: PackageCheck },
                                { label: 'مؤجلة', value: postponed, color: 'text-orange-500', filter: 'postponed', icon: RefreshCw },
                                { label: 'ملغية/مرتجعة', value: returned, color: 'text-red-500', filter: 'returned', icon: XCircle },
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
                                                    {index === 0 && selectedDriver === 'all' && <Star className="inline h-4 w-4 text-yellow-500 fill-yellow-500"/>}
                                                </Link>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
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
                                              <Link key={s.label} href={`/dashboard/orders?driver=${encodeURIComponent(name)}&status=${s.filter}`} className="hover:bg-accent/50 rounded-md p-2 transition-colors flex flex-col items-center justify-center">
                                                  <s.icon className={`w-5 h-5 mb-1 ${s.color}`} />
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

            <Card>
                <CardHeader>
                    <CardTitle>أداء السائقين (مقارنة)</CardTitle>
                    <CardDescription>مقارنة بين عدد الشحنات المسلمة، المؤجلة، والملغية لكل سائق.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                   <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart data={chartData} accessibilityLayer margin={{ top: 20, right: 20, bottom: 40, left: -10 }}>
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
                            <Bar dataKey="returned" name="ملغية/مرتجعة" fill="var(--color-returned)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
