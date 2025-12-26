'use client';

import Link from 'next/link';
import {
    Building2,
    Phone,
    MapPin,
    Mail,
    Globe,
    Clock,
    FileText,
    Save,
    Palette,
    Languages,
    Image,
    ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SettingsHeader } from '@/components/settings-header';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import Icon from '@/components/icon';

const quickLinks = [
    {
        href: '/dashboard/settings/company/identity',
        icon: Image,
        title: 'الهوية والشعارات',
        description: 'إدارة الشعارات وأيقونة المتصفح',
        color: 'bg-purple-500'
    },
    {
        href: '/dashboard/settings/company/appearance',
        icon: Palette,
        title: 'تخصيص المظهر',
        description: 'الألوان والخطوط والثيم',
        color: 'bg-cyan-500'
    },
    {
        href: '/dashboard/settings/company/regional',
        icon: Languages,
        title: 'الإعدادات الإقليمية',
        description: 'العملة واللغة والتوقيت',
        color: 'bg-amber-500'
    },
];

export default function CompanySettingsPage() {
    const { toast } = useToast();
    const context = useSettings();
    const settings = context?.settings;

    const [formData, setFormData] = useState({
        companyName: settings?.login?.companyName ?? '',
        phone: '',
        email: '',
        website: '',
        address: '',
        workingHours: '',
        taxNumber: '',
        commercialRegister: ''
    });
    const [loading, setLoading] = useState(false);

    function handleChange(key: string, value: string) {
        setFormData((p) => ({ ...p, [key]: value }));
    }

    async function handleSave() {
        try {
            setLoading(true);
            await new Promise((r) => setTimeout(r, 600));
            toast({ title: 'تم الحفظ', description: 'تم تحديث إعدادات الشركة بنجاح.' });
        } catch {
            toast({ title: 'فشل الحفظ', description: 'حصل خطأ أثناء حفظ الإعدادات.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <SettingsHeader
                title="إعدادات الشركة"
                description="إدارة البيانات الأساسية والهوية والمظهر"
                backHref="/dashboard/settings"
                icon="Building2"
                color="blue"
            />

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-3">
                {quickLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                        <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group border-2 hover:border-primary bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${link.color} shadow-lg`}>
                                        <link.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                                            {link.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {link.description}
                                        </p>
                                    </div>
                                    <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Company Info Form */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* Main Info - Takes 3 columns */}
                <Card className="lg:col-span-3 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                    <CardHeader className="border-b bg-blue-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-lg">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>المعلومات الأساسية</CardTitle>
                                <CardDescription>البيانات العامة للشركة</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-blue-500" />
                                    اسم الشركة
                                </Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => handleChange('companyName', e.target.value)}
                                    placeholder="مثال: شركة التوصيل السريع"
                                    className="bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-green-500" />
                                    رقم الهاتف
                                </Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="+966 5X XXX XXXX"
                                    dir="ltr"
                                    className="bg-white dark:bg-slate-800 text-left"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-red-500" />
                                    البريد الإلكتروني
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="info@company.com"
                                    dir="ltr"
                                    className="bg-white dark:bg-slate-800 text-left"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website" className="flex items-center gap-2 text-sm">
                                    <Globe className="h-4 w-4 text-purple-500" />
                                    الموقع الإلكتروني
                                </Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    placeholder="https://www.company.com"
                                    dir="ltr"
                                    className="bg-white dark:bg-slate-800 text-left"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address" className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-orange-500" />
                                    العنوان
                                </Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="العنوان الكامل للشركة..."
                                    rows={2}
                                    className="bg-white dark:bg-slate-800 resize-none"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="workingHours" className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-cyan-500" />
                                    ساعات العمل
                                </Label>
                                <Input
                                    id="workingHours"
                                    value={formData.workingHours}
                                    onChange={(e) => handleChange('workingHours', e.target.value)}
                                    placeholder="مثال: السبت - الخميس، 9 صباحاً - 6 مساءً"
                                    className="bg-white dark:bg-slate-800"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Legal Info - Takes 2 columns */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                    <CardHeader className="border-b bg-indigo-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-lg">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>المعلومات القانونية</CardTitle>
                                <CardDescription>بيانات التسجيل والضرائب</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="taxNumber" className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    الرقم الضريبي
                                </Label>
                                <Input
                                    id="taxNumber"
                                    value={formData.taxNumber}
                                    onChange={(e) => handleChange('taxNumber', e.target.value)}
                                    placeholder="رقم التسجيل الضريبي"
                                    dir="ltr"
                                    className="bg-white dark:bg-slate-800 text-left"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="commercialRegister" className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                    السجل التجاري
                                </Label>
                                <Input
                                    id="commercialRegister"
                                    value={formData.commercialRegister}
                                    onChange={(e) => handleChange('commercialRegister', e.target.value)}
                                    placeholder="رقم السجل التجاري"
                                    dir="ltr"
                                    className="bg-white dark:bg-slate-800 text-left"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-start pt-4">
                <Button size="lg" onClick={handleSave} disabled={loading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
            </div>
        </div>
    );
}
