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
  { month: "يناير", income: 18600, expense: 8000 },
  { month: "فبراير", income: 30500, expense: 12000 },
  { month: "مارس", income: 23700, expense: 9500 },
  { month: "أبريل", income: 27300, expense: 15000 },
  { month: "مايو", income: 20900, expense: 11000 },
  { month: "يونيو", income: 21400, expense: 13000 },
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
  const totalIncome = chartData.reduce((acc, item) => acc + item.income, 0);
  const totalExpense = chartData.reduce((acc, item) => acc + item.expense, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدخل</CardTitle>
            <PlusCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncome.toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD', minimumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">نمو 15% عن الفترة السابقة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <MinusCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpense.toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD', minimumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">زيادة 8% عن الفترة السابقة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{netProfit.toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD', minimumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">نمو 22% عن الفترة السابقة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">هامش الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">زيادة 5.2% عن الفترة السابقة</p>
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
              <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(value) => `${(value / 1000).toLocaleString('ar-IQ')} ألف`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => value.toLocaleString('ar-IQ')} />} />
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
                   <TableHead>الوصف</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {id: 1, type: 'income', date: '2023-08-11', desc: 'تحصيل من طلب #3210', amount: 25000},
                  {id: 2, type: 'expense', date: '2023-08-12', desc: 'وقود سيارة السائق علي', amount: -15000},
                  {id: 3, type: 'income', date: '2023-08-13', desc: 'تحصيل من طلب #3211', amount: 15000},
                  {id: 4, type: 'expense', date: '2023-08-14', desc: 'دفعة للسائق محمد', amount: -50000},
                  {id: 5, type: 'income', date: '2023-08-15', desc: 'تحصيل من طلب #3212', amount: 35000},
                  {id: 6, type: 'expense', date: '2023-08-16', desc: 'صيانة سيارة', amount: -20000},
                ].map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">#T00{t.id}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === 'income' ? "default" : "destructive"}>
                         {t.type === 'income' ? 'دخل' : 'مصروف'}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.desc}</TableCell>
                    <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.amount.toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD', minimumFractionDigits: 0})}
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
