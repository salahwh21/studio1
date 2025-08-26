'use client';

import { DollarSign, MinusCircle, PlusCircle, TrendingUp } from 'lucide-react';
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ComposedChart } from 'recharts';

const chartData = [
  { month: "يناير", income: 1860, expense: 800 },
  { month: "فبراير", income: 3050, expense: 1200 },
  { month: "مارس", income: 2370, expense: 950 },
  { month: "أبريل", income: 2730, expense: 1500 },
  { month: "مايو", income: 2090, expense: 1100 },
  { month: "يونيو", income: 2140, expense: 1300 },
];

const chartConfig = {
  income: {
    label: 'الدخل',
    color: 'hsl(var(--primary))',
  },
  expense: {
    label: 'المصروفات',
    color: 'hsl(var(--destructive))',
  },
};

export default function FinancialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدخل</CardTitle>
            <PlusCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14,240.00 د.ع</div>
            <p className="text-xs text-muted-foreground">نمو 15% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <MinusCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,850.00 د.ع</div>
            <p className="text-xs text-muted-foreground">زيادة 8% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8,390.00 د.ع</div>
            <p className="text-xs text-muted-foreground">نمو 22% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">هامش الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58.92%</div>
            <p className="text-xs text-muted-foreground">زيادة 5.2% عن الشهر الماضي</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الدخل مقابل المصروفات</CardTitle>
          <CardDescription>ملخص للدخل والمصروفات خلال الـ 6 أشهر الماضية.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ComposedChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `${value / 1000} ألف`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} name="الدخل" />
              <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2} dot={false} name="المصروفات"/>
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
            <CardTitle>المعاملات الأخيرة</CardTitle>
            <CardDescription>
              قائمة بأحدث معاملاتك المالية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>معرف المعاملة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">#T00{i+1}</TableCell>
                    <TableCell>
                      <Badge variant={i % 2 === 0 ? "default" : "destructive"}>
                         {i % 2 === 0 ? 'دخل' : 'مصروف'}
                      </Badge>
                    </TableCell>
                    <TableCell>2023-08-1{i+1}</TableCell>
                    <TableCell className={`text-right font-medium ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {i % 2 === 0 ? '+' : '-'}${150 + i * 20}.00
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}

    