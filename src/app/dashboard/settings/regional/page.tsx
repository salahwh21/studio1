
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RegionalSettingsContext } from '@/context/RegionalSettingsContext';
import Icon from '@/components/icon';


const currencies = [
    { code: 'JOD', name: 'دينار أردني' },
    { code: 'USD', name: 'دولار أمريكي' },
    { code: 'EUR', name: 'يورو' },
    { code: 'SAR', name: 'ريال سعودي' },
    { code: 'AED', name: 'درهم إماراتي' },
];

const languages = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
];

const timezones = [
    'Asia/Amman',
    'Asia/Dubai',
    'Asia/Riyadh',
    'Africa/Cairo',
    'Europe/Istanbul',
];

const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'يوم/شهر/سنة (31/12/2023)' },
    { value: 'MM/DD/YYYY', label: 'شهر/يوم/سنة (12/31/2023)' },
    { value: 'YYYY-MM-DD', label: 'سنة-شهر-يوم (2023-12-31)' },
];

const weekStartDays = [
    { value: 'saturday', label: 'السبت' },
    { value: 'sunday', label: 'الأحد' },
    { value: 'monday', label: 'الإثنين' },
];

const numberSeparators = [
    { value: ',', label: 'فاصلة (,)' },
    { value: '.', label: 'نقطة (.)' },
    { value: ' ', label: 'فراغ ( )' },
];


export default function RegionalSettingsPage() {
    const { toast } = useToast();
    const context = useContext(RegionalSettingsContext);

    if (!context) {
        return <div>جاري تحميل الإعدادات الإقليمية...</div>;
    }

    const { settings, setSetting } = context;

    const handleSaveChanges = () => {
        // The context already saves to localStorage on change,
        // so this is just for user feedback.
        toast({
            title: 'تم الحفظ بنجاح!',
            description: 'تم تحديث الإعدادات الإقليمية.',
        });
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2"><Icon name="Languages" /> الإعدادات الإقليمية</CardTitle>
                    <CardDescription className="mt-1">إدارة العملة، اللغة، والمنطقة الزمنية لتكييف النظام مع احتياجاتك.</CardDescription>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/settings/general">
                    <Icon name="ArrowLeft" className="h-4 w-4" />
                    </Link>
                </Button>
                </CardHeader>
            </Card>

            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Icon name="DollarSign" /> إعدادات العملة والأرقام</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="currency">العملة الافتراضية</Label>
                            <Select value={settings.currency} onValueChange={(value) => setSetting('currency', value)}>
                                <SelectTrigger id="currency"><SelectValue placeholder="اختر العملة..." /></SelectTrigger>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currencySymbol">رمز العملة</Label>
                            <Input id="currencySymbol" value={settings.currencySymbol} onChange={(e) => setSetting('currencySymbol', e.target.value)} placeholder="مثال: د.أ"/>
                        </div>
                        <div className="space-y-2">
                            <Label>موضع رمز العملة</Label>
                            <RadioGroup value={settings.currencySymbolPosition} onValueChange={(value) => setSetting('currencySymbolPosition', value as 'before' | 'after')} className="flex gap-4 pt-2">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="after" id="pos-after" />
                                    <Label htmlFor="pos-after" className="font-normal">بعد الرقم (1.00 د.أ)</Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="before" id="pos-before" />
                                    <Label htmlFor="pos-before" className="font-normal">قبل الرقم (د.أ 1.00)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="thousandsSeparator">فاصل الآلاف</Label>
                             <Select value={settings.thousandsSeparator} onValueChange={(value) => setSetting('thousandsSeparator', value)}>
                                <SelectTrigger id="thousandsSeparator"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {numberSeparators.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="decimalSeparator">الفاصل العشري</Label>
                            <Select value={settings.decimalSeparator} onValueChange={(value) => setSetting('decimalSeparator', value)}>
                                <SelectTrigger id="decimalSeparator"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {numberSeparators.filter(s => s.value !== ' ').map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Icon name="Languages" /> إعدادات اللغة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-sm space-y-2">
                            <Label htmlFor="language">لغة الواجهة</Label>
                            <Select value={settings.language} onValueChange={(value) => setSetting('language', value)}>
                                <SelectTrigger id="language"><SelectValue placeholder="اختر اللغة..." /></SelectTrigger>
                                <SelectContent>
                                     {languages.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Icon name="Package" /> نظام الوحدات</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <RadioGroup value={settings.unitsSystem} onValueChange={(value) => setSetting('unitsSystem', value as 'metric' | 'imperial')} className="flex gap-6 pt-2">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="metric" id="unit-metric" />
                                    <Label htmlFor="unit-metric" className="font-normal">النظام المتري (كيلوجرام، سنتيمتر)</Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="imperial" id="unit-imperial" />
                                    <Label htmlFor="unit-imperial" className="font-normal">النظام الإمبراطوري (رطل، بوصة)</Label>
                                </div>
                            </RadioGroup>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Icon name="Clock" /> إعدادات الوقت والتاريخ</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                             <Label htmlFor="timezone">المنطقة الزمنية</Label>
                            <Select value={settings.timezone} onValueChange={(value) => setSetting('timezone', value)}>
                                <SelectTrigger id="timezone"><SelectValue placeholder="اختر المنطقة الزمنية..." /></SelectTrigger>
                                <SelectContent>
                                    {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>تنسيق التاريخ</Label>
                            <RadioGroup value={settings.dateFormat} onValueChange={(value) => setSetting('dateFormat', value)} className="space-y-2">
                                {dateFormats.map(df => (
                                    <div key={df.value} className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value={df.value} id={df.value} />
                                        <Label htmlFor={df.value} className="font-normal">{df.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="weekStartDay">بداية الأسبوع</Label>
                             <Select value={settings.firstDayOfWeek} onValueChange={(value) => setSetting('firstDayOfWeek', value)}>
                                <SelectTrigger id="weekStartDay"><SelectValue placeholder="اختر اليوم..." /></SelectTrigger>
                                <SelectContent>
                                    {weekStartDays.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-start pt-6 mt-6 border-t">
                <Button size="lg" onClick={handleSaveChanges}>
                    <Icon name="Save" className="ml-2 h-4 w-4" /> حفظ التغييرات
                </Button>
            </div>
        </div>
    );
}
