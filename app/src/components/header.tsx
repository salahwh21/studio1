'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useContext } from 'react';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Logo } from './logo';
import { useSettings } from '@/contexts/SettingsContext';
import Icon from '@/components/icon';
import { useRolesStore } from '@/store/roles-store';
import { Skeleton } from './ui/skeleton';

type NavItem = {
  href: string;
  label: string;
  iconName: keyof typeof import('lucide-react');
  permissionId: string;
};

const allNavItems: NavItem[] = [
  { href: '/dashboard', iconName: 'LayoutDashboard', label: 'لوحة التحكم', permissionId: 'dashboard:view' },
  { href: '/dashboard/orders', iconName: 'ShoppingCart', label: 'عرض الطلبات', permissionId: 'orders:view' },
  { href: '/dashboard/add-order', iconName: 'PackagePlus', label: 'إضافة طلبات', permissionId: 'orders:create' },
  { href: '/dashboard/optimize', iconName: 'Wand2', label: 'تحسين المسار', permissionId: 'optimize:use' },
  { href: '/dashboard/drivers-map', iconName: 'Map', label: 'خريطة السائقين', permissionId: 'drivers-map:view' },
  { href: '/dashboard/returns', iconName: 'Undo2', label: 'إدارة المرتجعات', permissionId: 'returns:view' },
  { href: '/dashboard/financials', iconName: 'Calculator', label: 'المحاسبة', permissionId: 'financials:view' },
  { href: '/dashboard/settings', iconName: 'Settings', label: 'الإعدادات', permissionId: 'settings:view' },
  // Specific app views
  { href: '/dashboard/driver-app', iconName: 'Smartphone', label: 'تطبيق السائق', permissionId: 'driver-app:use' },
  { href: '/dashboard/merchant', iconName: 'Store', label: 'بوابة التاجر', permissionId: 'merchant-portal:use' },
];


export function AppHeader() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const context = useSettings();
  
  // --- RBAC Logic ---
  const { roles } = useRolesStore();
  // Simulate a logged-in user. In a real app, this would come from an auth context.
  const currentUserRole = 'admin'; 
  const userRole = roles.find(r => r.id === currentUserRole);
  const userPermissions = userRole?.permissions || [];
  
  const hasPermission = (permissionId: string) => {
      if (!userPermissions) return false;
      if (userPermissions.includes('all')) return true;
      // Check for specific permission or wildcard group permission (e.g., 'orders:*')
      const [group] = permissionId.split(':');
      if (userPermissions.includes(`${group}:*`)) return true;
      return userPermissions.includes(permissionId);
  };
  // --- End RBAC Logic ---


  if (!context || !context.isHydrated) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </header>
    );
  }

  const { settings } = context;
  const headerLogo = settings.login.headerLogo;
  
  // Determine which nav items to show based on permissions AND visibility settings
  const visiblePermissionIds = settings.menuVisibility[currentUserRole] || allNavItems.map(item => item.permissionId);
  const navItems = allNavItems.filter(item => hasPermission(item.permissionId) && visiblePermissionIds.includes(item.permissionId));


  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };
  
  const HeaderLogo = () => {
    if (headerLogo) {
      return <Image src={headerLogo} alt={settings.login.companyName || "Company Logo"} width={120} height={32} style={{objectFit: 'contain'}} />
    }
    return <Logo />;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-sidebar px-4 sm:px-6">
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard"><HeaderLogo /></Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-2 rounded-full border bg-muted/50 p-1">
            {navItems.map(item => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant={isActive(item.href) ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-full"
                  >
                    <Link href={item.href}>
                      <Icon name={item.iconName as any} className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </nav>
        
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Icon name="Bell" className="h-5 w-5" />
                        <span className="sr-only">فتح الإشعارات</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <div className="p-4 text-sm text-center text-muted-foreground">
                            لا توجد إشعارات جديدة
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Icon name="Sun" className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Icon name="Moon" className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">تبديل المظهر</span>
            </Button>
            
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="Admin" data-ai-hint="manager profile" />
                    <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings/account">
                            <Icon name="User" className="mr-2 h-4 w-4"/>
                            <span>الملف الشخصي</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings">
                           <Icon name="Settings" className="mr-2 h-4 w-4" />
                           <span>الإعدادات</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/">
                        <Icon name="LogOut" className="mr-2 h-4 w-4" />
                        <span>تسجيل الخروج</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}]]></content>
  </change>
  <change file_path="/src/lib/utils.ts"><![CDATA[import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
]]></change>
  <change file_path="/src/app/layout.tsx"><![CDATA[import './globals.css';
import type { Metadata, Viewport } from 'next';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/contexts/SettingsContext';

import { Tajawal } from 'next/font/google';

const tajawal = Tajawal({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-tajawal' });

export const metadata: Metadata = {
  title: 'إدارة تسجيل الطلبات - الوميض',
  description:
    'حل شامل لإدارة تسجيل الطلبات والشؤون المالية والسائقين لشركة الوميض.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      suppressHydrationWarning 
      className={tajawal.variable}
    >
      <body>
        <SettingsProvider>
          <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          >
          {children}
          <Toaster />
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
]]></change>
  <change file_path="/src/app/page.tsx"><![CDATA[import LoginPageClient from '@/components/login-page-client';

export default function LoginPage() {
  return <LoginPageClient />;
}
]]></change>
  <change file_path="/src/app/dashboard/layout.tsx"><![CDATA[
import { AppLayout } from '@/components/app-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>;
}
]]></change>
  <change file_path="/src/app/dashboard/page.tsx"><![CDATA['use client';

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