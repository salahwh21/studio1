'use client';
import { useState } from 'react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/icon';

type AutomationRule = {
    id: string;
    conditionField: 'age_in_branch' | 'reason';
    conditionOperator: 'greater_than' | 'equals';
    conditionValue: string;
    action: 'change_status' | 'notify_merchant';
    actionValue: string;
    enabled: boolean;
};

const AutomationEngine = () => {
    const [rules, setRules] = useState<AutomationRule[]>([
        { id: 'rule1', conditionField: 'age_in_branch', conditionOperator: 'greater_than', conditionValue: '3', action: 'change_status', actionValue: 'يتطلب مراجعة', enabled: true },
        { id: 'rule2', conditionField: 'reason', conditionOperator: 'equals', conditionValue: 'عنوان خاطئ', action: 'notify_merchant', actionValue: 'تنبيه بتحديث العنوان', enabled: false },
    ]);

    const handleAddRule = () => {
        setRules(prev => [...prev, { id: `rule${Date.now()}`, conditionField: 'age_in_branch', conditionOperator: 'greater_than', conditionValue: '', action: 'change_status', actionValue: '', enabled: true }]);
    };

    const handleRemoveRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    return (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon name="Wand2"/> محرك الأتمتة للمرتجعات</CardTitle>
                <CardDescription>إنشاء قواعد تلقائية لتسهيل إدارة المرتجعات. سيتم تنفيذ هذه القواعد مرة واحدة يوميًا.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/4">إذا كان</TableHead>
                            <TableHead className="w-1/4">والشرط</TableHead>
                            <TableHead className="w-1/4">إذن نفذ الإجراء</TableHead>
                            <TableHead>إجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.map(rule => (
                            <TableRow key={rule.id}>
                                <TableCell className="flex flex-col gap-2">
                                     <Select defaultValue={rule.conditionField}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="age_in_branch">عمر المرتجع بالفرع (أيام)</SelectItem>
                                            <SelectItem value="reason">سبب الإرجاع</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                     <div className="flex gap-2">
                                        <Select defaultValue={rule.conditionOperator} className="w-1/3">
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="greater_than">&gt;</SelectItem>
                                                <SelectItem value="equals">=</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input placeholder="القيمة" defaultValue={rule.conditionValue} className="w-2/3"/>
                                     </div>
                                </TableCell>
                                <TableCell>
                                     <Select defaultValue={rule.action}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="change_status">تغيير الحالة إلى</SelectItem>
                                            <SelectItem value="notify_merchant">إرسال تنبيه للتاجر</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(rule.id)}><Icon name="Trash2" className="h-4 w-4 text-destructive"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button variant="outline" className="mt-4 w-full" onClick={handleAddRule}><Icon name="PlusCircle" className="mr-2 h-4 w-4"/> إضافة قاعدة جديدة</Button>
            </CardContent>
        </Card>
    );
};


export default function ReturnsSettingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">إعدادات المرتجعات</CardTitle>
                    <CardDescription className="mt-1">أتمتة وتخصيص عمليات إدارة المرتجعات.</CardDescription>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/settings">
                        <Icon name="ArrowLeft" className="h-4 w-4" />
                    </Link>
                </Button>
                </CardHeader>
            </Card>
            <AutomationEngine />
        </div>
    )
}