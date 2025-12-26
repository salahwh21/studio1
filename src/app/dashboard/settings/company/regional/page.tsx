'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import Icon from '@/components/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsHeader } from '@/components/settings-header';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// البيانات مرتبة حسب المنطقة العربية
const currencies = [
    { code: 'JOD', name: 'دينار أردني', symbol: 'د.أ', flag: '🇯🇴' },
    { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦' },
    { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', flag: '🇦🇪' },
    { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك', flag: '🇰🇼' },
    { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب', flag: '🇧🇭' },
    { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق', flag: '🇶🇦' },
    { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع', flag: '🇴🇲' },
    { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', flag: '🇪🇬' },
    { code: 'IQD', name: 'دينار عراقي', symbol: 'د.ع', flag: '🇮🇶' },
    { code: 'LBP', name: 'ليرة لبنانية', symbol: 'ل.ل', flag: '🇱🇧' },
    { code: 'SYP', name: 'ليرة سورية', symbol: 'ل.س', flag: '🇸🇾' },
    { code: 'USD', name: 'دولار أمريكي', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'يورو', symbol: '€', flag: '🇪🇺' },
];

const languages = [
    { code: 'ar', name: 'العربية', flag: '🇯🇴' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
];

const timezones = [
    { value: 'Asia/Amman', label: 'عمّان (الأردن)', offset: '+03:00' },
    { value: 'Asia/Riyadh', label: 'الرياض (السعودية)', offset: '+03:00' },
    { value: 'Asia/Dubai', label: 'دبي (الإمارات)', offset: '+04:00' },
    { value: 'Asia/Kuwait', label: 'الكويت', offset: '+03:00' },
    { value: 'Asia/Qatar', label: 'الدوحة (قطر)', offset: '+03:00' },
    { value: 'Asia/Bahrain', label: 'المنامة (البحرين)', offset: '+03:00' },
    { value: 'Asia/Baghdad', label: 'بغداد (العراق)', offset: '+03:00' },
    { value: 'Africa/Cairo', label: 'القاهرة (مصر)', offset: '+02:00' },
    { value: 'Asia/Beirut', label: 'بيروت (لبنان)', offset: '+02:00' },
    { value: 'Asia/Damascus', label: 'دمشق (سوريا)', offset: '+03:00' },
];

const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'يوم/شهر/سنة', example: '25/12/2024' },
    { value: 'MM/DD/YYYY', label: 'شهر/يوم/سنة', example: '12/25/2024' },
    { value: 'YYYY-MM-DD', label: 'سنة-شهر-يوم', example: '2024-12-25' },
];

const weekStartDays = [
    { value: 'saturday', label: 'السبت', icon: '📅' },
    { value: 'sunday', label: 'الأحد', icon: '📅' },
    { value: 'monday', label: 'الإثنين', icon: '📅' },
];

export default function RegionalSettingsPage() {
    const { toast } = useToast();
    const context = useSettings();

    if (!context || !context.isHydrated) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-80 w-full rounded-xl" />
                    <Skeleton className="h-80 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    const { settings, updateRegionalSetting } = context;

    // معاينة حية للتنسيق
    const preview = useMemo(() => {
        const amount = 1234.56;
        const currency = currencies.find(c => c.code === settings.regional.currency);
        const symbol = settings.regional.currencySymbol || currency?.symbol || '';
        
        const formattedNumber = amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).replace(/,/g, settings.regional.thousandsSeparator || ',')
          .replace(/\./g, settings.regional.decimalSeparator || '.');
        
        const formattedCurrency = settings.regional.currencySymbolPosition === 'before' 
            ? `${symbol} ${formattedNumber}`
            : `${formattedNumber} ${symbol}`;

        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        
        let formattedDate = settings.regional.dateFormat || 'DD/MM/YYYY';
        formattedDate = formattedDate.replace('DD', day).replace('MM', month).replace('YYYY', String(year));

        return { currency: formattedCurrency, date: formattedDate, number: formattedNumber };
    }, [settings.regional]);

    const handleSaveChanges = () => {
        toast({
            title: 'تم الحفظ بنجاح!',
            description: 'تم تحديث الإعدادات الإقليمية.',
        });
    };

    // تحديث رمز العملة تلقائياً عند تغيير العملة
    const handleCurrencyChange = (code: string) => {
        updateRegionalSetting('currency', code);
        const currency = currencies.find(c => c.code === code);
        if (currency) {
            updateRegionalSetting('currencySymbol', currency.symbol);
        }
    };

    return (
        <div className="space-y-6">
            <SettingsHeader
                icon="Globe"
                title="الإعدادات الإقليمية"
                description="تخصيص العملة واللغة والتوقيت ليناسب منطقتك"
                color="blue"
                backHref="/dashboard/settings/company"
                breadcrumbs={[
                    { label: 'إعدادات الشركة', href: '/dashboard/settings/company' }
                ]}
            />

            {/* Live Preview Card */}
            <Card className="bg-gradient-to-l from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/20">
                                <Icon name="Eye" className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">معاينة حية</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">العملة:</span>
                                <Badge variant="secondary" className="font-mono">{preview.currency}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">التاريخ:</span>
                                <Badge variant="secondary" className="font-mono">{preview.date}</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Currency & Numbers Card */}
                <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                    <CardHeader className="border-b bg-emerald-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg">
                                <Icon name="DollarSign" className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>العملة والأرقام</CardTitle>
                                <CardDescription>تنسيق المبالغ والأرقام</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Icon name="Banknote" className="h-4 w-4 text-emerald-500" />
                                العملة الافتراضية
                            </Label>
                            <Select value={settings.regional.currency} onValueChange={handleCurrencyChange}>
                                <SelectTrigger className="bg-white dark:bg-slate-800">
                                    <SelectValue placeholder="اختر العملة..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map(c => (
                                        <SelectItem key={c.code} value={c.code}>
                                            <span className="flex items-center gap-2">
                                                <span>{c.flag}</span>
                                                <span>{c.name}</span>
                                                <span className="text-muted-foreground">({c.code})</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">رمز العملة</Label>
                                <Input 
                                    value={settings.regional.currencySymbol} 
                                    onChange={(e) => updateRegionalSetting('currencySymbol', e.target.value)} 
                                    placeholder="د.أ"
                                    className="bg-white dark:bg-slate-800 text-center font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">موضع الرمز</Label>
                                <Select 
                                    value={settings.regional.currencySymbolPosition} 
                                    onValueChange={(v) => updateRegionalSetting('currencySymbolPosition', v as 'before' | 'after')}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="after">بعد الرقم (1.00 د.أ)</SelectItem>
                                        <SelectItem value="before">قبل الرقم (د.أ 1.00)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">فاصل الآلاف</Label>
                                <RadioGroup 
                                    value={settings.regional.thousandsSeparator} 
                                    onValueChange={(v) => updateRegionalSetting('thousandsSeparator', v)}
                                    className="flex gap-2"
                                >
                                    {[
                                        { value: ',', label: 'فاصلة' },
                                        { value: '.', label: 'نقطة' },
                                        { value: ' ', label: 'فراغ' },
                                    ].map(opt => (
                                        <Label 
                                            key={opt.value}
                                            className={`flex-1 flex items-center justify-center gap-1 p-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                                                settings.regional.thousandsSeparator === opt.value 
                                                    ? 'border-primary bg-primary/5' 
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <RadioGroupItem value={opt.value} className="sr-only" />
                                            <span className="font-mono text-lg">{opt.value === ' ' ? '␣' : opt.value}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">الفاصل العشري</Label>
                                <RadioGroup 
                                    value={settings.regional.decimalSeparator} 
                                    onValueChange={(v) => updateRegionalSetting('decimalSeparator', v)}
                                    className="flex gap-2"
                                >
                                    {[
                                        { value: '.', label: 'نقطة' },
                                        { value: ',', label: 'فاصلة' },
                                    ].map(opt => (
                                        <Label 
                                            key={opt.value}
                                            className={`flex-1 flex items-center justify-center gap-1 p-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                                                settings.regional.decimalSeparator === opt.value 
                                                    ? 'border-primary bg-primary/5' 
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <RadioGroupItem value={opt.value} className="sr-only" />
                                            <span className="font-mono text-lg">{opt.value}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Time & Language Card */}
                <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                    <CardHeader className="border-b bg-blue-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-lg">
                                <Icon name="Clock" className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>الوقت واللغة</CardTitle>
                                <CardDescription>المنطقة الزمنية وتنسيق التاريخ</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Icon name="MapPin" className="h-4 w-4 text-blue-500" />
                                المنطقة الزمنية
                            </Label>
                            <Select value={settings.regional.timezone} onValueChange={(v) => updateRegionalSetting('timezone', v)}>
                                <SelectTrigger className="bg-white dark:bg-slate-800">
                                    <SelectValue placeholder="اختر المنطقة الزمنية..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {timezones.map(tz => (
                                        <SelectItem key={tz.value} value={tz.value}>
                                            <span className="flex items-center justify-between w-full gap-4">
                                                <span>{tz.label}</span>
                                                <span className="text-muted-foreground text-xs font-mono">UTC{tz.offset}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Icon name="Calendar" className="h-4 w-4 text-blue-500" />
                                تنسيق التاريخ
                            </Label>
                            <RadioGroup 
                                value={settings.regional.dateFormat} 
                                onValueChange={(v) => updateRegionalSetting('dateFormat', v)}
                                className="space-y-2"
                            >
                                {dateFormats.map(df => (
                                    <Label 
                                        key={df.value}
                                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                            settings.regional.dateFormat === df.value 
                                                ? 'border-primary bg-primary/5' 
                                                : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value={df.value} className="sr-only" />
                                            <span>{df.label}</span>
                                        </div>
                                        <Badge variant="outline" className="font-mono">{df.example}</Badge>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm">
                                    <Icon name="CalendarDays" className="h-4 w-4 text-blue-500" />
                                    بداية الأسبوع
                                </Label>
                                <Select value={settings.regional.firstDayOfWeek} onValueChange={(v) => updateRegionalSetting('firstDayOfWeek', v)}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {weekStartDays.map(d => (
                                            <SelectItem key={d.value} value={d.value}>
                                                <span className="flex items-center gap-2">
                                                    <span>{d.icon}</span>
                                                    <span>{d.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm">
                                    <Icon name="Languages" className="h-4 w-4 text-blue-500" />
                                    لغة الواجهة
                                </Label>
                                <Select value={settings.regional.language} onValueChange={(v) => updateRegionalSetting('language', v)}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map(l => (
                                            <SelectItem key={l.code} value={l.code}>
                                                <span className="flex items-center gap-2">
                                                    <span>{l.flag}</span>
                                                    <span>{l.name}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm">
                                <Icon name="Ruler" className="h-4 w-4 text-blue-500" />
                                نظام الوحدات
                            </Label>
                            <RadioGroup 
                                value={settings.regional.unitsSystem} 
                                onValueChange={(v) => updateRegionalSetting('unitsSystem', v as 'metric' | 'imperial')}
                                className="flex gap-3"
                            >
                                <Label 
                                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        settings.regional.unitsSystem === 'metric' 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-800'
                                    }`}
                                >
                                    <RadioGroupItem value="metric" className="sr-only" />
                                    <span className="text-2xl">📏</span>
                                    <span className="font-medium">النظام المتري</span>
                                    <span className="text-xs text-muted-foreground">كيلوجرام، متر</span>
                                </Label>
                                <Label 
                                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        settings.regional.unitsSystem === 'imperial' 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-800'
                                    }`}
                                >
                                    <RadioGroupItem value="imperial" className="sr-only" />
                                    <span className="text-2xl">📐</span>
                                    <span className="font-medium">النظام الإمبراطوري</span>
                                    <span className="text-xs text-muted-foreground">رطل، قدم</span>
                                </Label>
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-start pt-4">
                <Button size="lg" onClick={handleSaveChanges} className="gap-2">
                    <Icon name="Save" className="h-4 w-4" />
                    حفظ التغييرات
                </Button>
            </div>
        </div>
    );
}
