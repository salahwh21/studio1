'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SettingsHeader } from '@/components/settings-header';
import {
    Save,
    Wand2,
    Plus,
    Trash2,
    Settings2,
    Clock,
    Bell,
    AlertTriangle,
    CheckCircle2,
    Info,
    Undo2,
    Package,
    Timer,
    MessageSquare,
    Zap,
    ToggleRight,
    PlayCircle,
    PauseCircle,
    Edit,
    Copy,
    MoreVertical,
    ArrowRight,
    RefreshCcw
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AutomationRule = {
    id: string;
    name: string;
    conditionField: 'age_in_branch' | 'reason' | 'attempts';
    conditionOperator: 'greater_than' | 'equals' | 'less_than';
    conditionValue: string;
    action: 'change_status' | 'notify_merchant' | 'notify_driver' | 'auto_return';
    actionValue: string;
    enabled: boolean;
};

const defaultRules: AutomationRule[] = [
    { 
        id: 'rule1', 
        name: 'تنبيه المرتجعات القديمة',
        conditionField: 'age_in_branch', 
        conditionOperator: 'greater_than', 
        conditionValue: '3', 
        action: 'change_status', 
        actionValue: 'يتطلب مراجعة', 
        enabled: true 
    },
    { 
        id: 'rule2', 
        name: 'تنبيه العنوان الخاطئ',
        conditionField: 'reason', 
        conditionOperator: 'equals', 
        conditionValue: 'عنوان خاطئ', 
        action: 'notify_merchant', 
        actionValue: 'تنبيه بتحديث العنوان', 
        enabled: false 
    },
    { 
        id: 'rule3', 
        name: 'إرجاع تلقائي بعد 3 محاولات',
        conditionField: 'attempts', 
        conditionOperator: 'greater_than', 
        conditionValue: '3', 
        action: 'auto_return', 
        actionValue: 'إرجاع للتاجر', 
        enabled: true 
    },
];

const conditionFields = [
    { value: 'age_in_branch', label: 'عمر المرتجع بالفرع (أيام)', icon: Clock },
    { value: 'reason', label: 'سبب الإرجاع', icon: MessageSquare },
    { value: 'attempts', label: 'عدد محاولات التوصيل', icon: RefreshCcw },
];

const conditionOperators = [
    { value: 'greater_than', label: 'أكبر من', symbol: '>' },
    { value: 'equals', label: 'يساوي', symbol: '=' },
    { value: 'less_than', label: 'أقل من', symbol: '<' },
];

const actions = [
    { value: 'change_status', label: 'تغيير الحالة إلى', icon: Undo2 },
    { value: 'notify_merchant', label: 'إرسال تنبيه للتاجر', icon: Bell },
    { value: 'notify_driver', label: 'إرسال تنبيه للسائق', icon: Bell },
    { value: 'auto_return', label: 'إرجاع تلقائي', icon: Package },
];

const returnReasons = [
    'عنوان خاطئ',
    'المستلم غير متواجد',
    'رفض الاستلام',
    'المنتج تالف',
    'طلب خاطئ',
    'تأخر التوصيل',
    'أخرى',
];

export default function ReturnsSettingsPage() {
    const { toast } = useToast();
    const [rules, setRules] = useState<AutomationRule[]>(defaultRules);
    const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

    const handleAddRule = () => {
        const newRule: AutomationRule = {
            id: `rule-${Date.now()}`,
            name: 'قاعدة جديدة',
            conditionField: 'age_in_branch',
            conditionOperator: 'greater_than',
            conditionValue: '',
            action: 'change_status',
            actionValue: '',
            enabled: true
        };
        setRules(prev => [...prev, newRule]);
        setEditingRule(newRule);
    };

    const handleRemoveRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
        toast({ title: 'تم الحذف', description: 'تم حذف القاعدة بنجاح' });
    };

    const handleRuleChange = (id: string, field: keyof AutomationRule, value: any) => {
        setRules(prev => prev.map(rule => 
            rule.id === id ? { ...rule, [field]: value } : rule
        ));
    };

    const handleToggleRule = (id: string) => {
        setRules(prev => prev.map(rule => 
            rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
        ));
    };

    const handleDuplicateRule = (rule: AutomationRule) => {
        const newRule: AutomationRule = {
            ...rule,
            id: `rule-${Date.now()}`,
            name: `${rule.name} (نسخة)`,
        };
        setRules(prev => [...prev, newRule]);
        toast({ title: 'تم النسخ', description: 'تم نسخ القاعدة بنجاح' });
    };

    const handleSave = () => {
        toast({
            title: "تم الحفظ بنجاح!",
            description: "تم تحديث إعدادات المرتجعات.",
        });
    };

    const activeRulesCount = rules.filter(r => r.enabled).length;

    // Stats cards
    const statsCards = [
        {
            icon: Zap,
            label: 'القواعد النشطة',
            value: `${activeRulesCount} من ${rules.length}`,
            color: 'bg-green-500/10 text-green-600'
        },
        {
            icon: Clock,
            label: 'التنفيذ',
            value: 'يومياً',
            color: 'bg-blue-500/10 text-blue-600'
        },
        {
            icon: Bell,
            label: 'التنبيهات',
            value: 'مفعلة',
            color: 'bg-amber-500/10 text-amber-600'
        },
        {
            icon: Undo2,
            label: 'الإرجاع التلقائي',
            value: 'مفعل',
            color: 'bg-purple-500/10 text-purple-600'
        },
    ];

    return (
        <div className="space-y-6">
            <SettingsHeader
                icon="Undo2"
                title="إعدادات المرتجعات"
                description="أتمتة وتخصيص عمليات إدارة المرتجعات وقواعد المعالجة"
                color="emerald"
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <Card key={index} className="border-r-4 border-r-primary/50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    <p className="font-semibold text-sm truncate">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="automation" className="space-y-6" dir="rtl">
                <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                    <TabsTrigger value="automation" className="gap-2 py-2.5">
                        <Wand2 className="h-4 w-4" />
                        <span className="hidden sm:inline">محرك الأتمتة</span>
                        <span className="sm:hidden">الأتمتة</span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2 py-2.5">
                        <Settings2 className="h-4 w-4" />
                        <span className="hidden sm:inline">الإعدادات العامة</span>
                        <span className="sm:hidden">الإعدادات</span>
                    </TabsTrigger>
                </TabsList>

                {/* Automation Tab */}
                <TabsContent value="automation" className="space-y-6">
                    {/* Automation Engine Card */}
                    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                        <Wand2 className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">محرك الأتمتة للمرتجعات</CardTitle>
                                        <CardDescription>إنشاء قواعد تلقائية لتسهيل إدارة المرتجعات</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={handleAddRule} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    إضافة قاعدة
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Rules List */}
                            {rules.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-medium">لا توجد قواعد أتمتة</p>
                                    <p className="text-sm mt-1">أضف قاعدة جديدة لبدء أتمتة المرتجعات</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rules.map((rule) => (
                                        <div 
                                            key={rule.id} 
                                            className={`rounded-xl border p-4 transition-all ${
                                                rule.enabled 
                                                    ? 'bg-card hover:shadow-md' 
                                                    : 'bg-muted/50 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 space-y-3">
                                                    {/* Rule Header */}
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-1.5 rounded-lg ${rule.enabled ? 'bg-green-500/10' : 'bg-muted'}`}>
                                                            {rule.enabled ? (
                                                                <PlayCircle className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <PauseCircle className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-sm">{rule.name}</h4>
                                                            <Badge variant={rule.enabled ? 'default' : 'secondary'} className="text-[10px] mt-1">
                                                                {rule.enabled ? 'نشطة' : 'متوقفة'}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Rule Logic Display */}
                                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                                        <Badge variant="outline" className="gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {conditionFields.find(f => f.value === rule.conditionField)?.label}
                                                        </Badge>
                                                        <span className="text-muted-foreground">
                                                            {conditionOperators.find(o => o.value === rule.conditionOperator)?.symbol}
                                                        </span>
                                                        <Badge variant="secondary">{rule.conditionValue || '...'}</Badge>
                                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                        <Badge variant="outline" className="gap-1 bg-primary/5">
                                                            <Zap className="h-3 w-3" />
                                                            {actions.find(a => a.value === rule.action)?.label}
                                                        </Badge>
                                                    </div>

                                                    {/* Rule Editor (Expanded) */}
                                                    {editingRule?.id === rule.id && (
                                                        <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>اسم القاعدة</Label>
                                                                    <Input
                                                                        value={rule.name}
                                                                        onChange={(e) => handleRuleChange(rule.id, 'name', e.target.value)}
                                                                        placeholder="اسم القاعدة"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>الشرط</Label>
                                                                    <Select
                                                                        value={rule.conditionField}
                                                                        onValueChange={(v) => handleRuleChange(rule.id, 'conditionField', v)}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {conditionFields.map(f => (
                                                                                <SelectItem key={f.value} value={f.value}>
                                                                                    {f.label}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>المقارنة</Label>
                                                                    <div className="flex gap-2">
                                                                        <Select
                                                                            value={rule.conditionOperator}
                                                                            onValueChange={(v) => handleRuleChange(rule.id, 'conditionOperator', v)}
                                                                        >
                                                                            <SelectTrigger className="w-24">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {conditionOperators.map(o => (
                                                                                    <SelectItem key={o.value} value={o.value}>
                                                                                        {o.symbol} {o.label}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        {rule.conditionField === 'reason' ? (
                                                                            <Select
                                                                                value={rule.conditionValue}
                                                                                onValueChange={(v) => handleRuleChange(rule.id, 'conditionValue', v)}
                                                                            >
                                                                                <SelectTrigger className="flex-1">
                                                                                    <SelectValue placeholder="اختر السبب" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {returnReasons.map(r => (
                                                                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        ) : (
                                                                            <Input
                                                                                type="number"
                                                                                value={rule.conditionValue}
                                                                                onChange={(e) => handleRuleChange(rule.id, 'conditionValue', e.target.value)}
                                                                                placeholder="القيمة"
                                                                                className="flex-1"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>الإجراء</Label>
                                                                    <Select
                                                                        value={rule.action}
                                                                        onValueChange={(v) => handleRuleChange(rule.id, 'action', v)}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {actions.map(a => (
                                                                                <SelectItem key={a.value} value={a.value}>
                                                                                    {a.label}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end">
                                                                <Button size="sm" onClick={() => setEditingRule(null)}>
                                                                    <CheckCircle2 className="h-4 w-4 ml-1" />
                                                                    تم
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Rule Actions */}
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={rule.enabled}
                                                        onCheckedChange={() => handleToggleRule(rule.id)}
                                                    />
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => setEditingRule(rule)}>
                                                                <Edit className="h-4 w-4 ml-2" />
                                                                تعديل
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDuplicateRule(rule)}>
                                                                <Copy className="h-4 w-4 ml-2" />
                                                                نسخ
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleRemoveRule(rule.id)}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4 ml-2" />
                                                                حذف
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Info Note */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">كيف تعمل الأتمتة؟</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        يتم تنفيذ القواعد النشطة مرة واحدة يومياً في الساعة 6 صباحاً. 
                                        يمكنك إيقاف أي قاعدة مؤقتاً دون حذفها.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Settings2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">الإعدادات العامة</CardTitle>
                                    <CardDescription>تخصيص سلوك نظام المرتجعات</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Return Period */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Timer className="h-4 w-4 text-primary" />
                                    مدة الاحتفاظ بالمرتجع (أيام)
                                </Label>
                                <Input
                                    type="number"
                                    defaultValue={7}
                                    min={1}
                                    className="h-11 max-w-xs"
                                />
                                <p className="text-xs text-muted-foreground">
                                    المدة القصوى للاحتفاظ بالمرتجع في الفرع قبل إرجاعه للتاجر
                                </p>
                            </div>

                            <Separator />

                            {/* Notification Settings */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Bell className="h-4 w-4" />
                                    إعدادات التنبيهات
                                </h4>

                                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Bell className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <Label className="font-medium cursor-pointer">
                                                تنبيه التاجر عند استلام مرتجع
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                إرسال إشعار للتاجر عند وصول مرتجع جديد
                                            </p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <Label className="font-medium cursor-pointer">
                                                تنبيه قبل انتهاء مدة الاحتفاظ
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                تنبيه التاجر قبل يومين من انتهاء المدة
                                            </p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <Label className="font-medium cursor-pointer">
                                                إرسال تقرير يومي
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                تقرير يومي بالمرتجعات للإدارة
                                            </p>
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                            </div>

                            <Separator />

                            {/* Return Reasons */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    أسباب الإرجاع المتاحة
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {returnReasons.map((reason, index) => (
                                        <Badge key={index} variant="secondary" className="py-1.5 px-3">
                                            {reason}
                                        </Badge>
                                    ))}
                                    <Button variant="outline" size="sm" className="h-7 gap-1">
                                        <Plus className="h-3 w-3" />
                                        إضافة
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                    {activeRulesCount} قاعدة نشطة من أصل {rules.length}
                </p>
                <Button size="lg" onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                </Button>
            </div>
        </div>
    );
}
