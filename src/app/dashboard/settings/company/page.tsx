'use client';

import Link from 'next/link';
import {
    Building2,
    Image,
    Phone,
    MapPin,
    Mail,
    Globe,
    Clock,
    FileText,
    ChevronLeft,
    Save
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
import { Skeleton } from '@/components/ui/skeleton';

const quickLinks = [
    {
        href: '/dashboard/settings/company/identity',
        icon: Image,
        title: 'الهوية والشعارات',
        description: 'إدارة الشعارات وأيقونة المتصفح',
        color: 'bg-purple-500'
    }
];

export default function CompanySettingsPage() {
    const { toast } = useToast();
    const context = useSettings();

    const [formData, setFormData] = useState({
        companyName: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        workingHours: '',
        taxNumber: '',
        commercialRegister: ''
    });

    // Initialize from context once hydrated
    if (context?.isHydrated && !formData.companyName && context.settings.login.companyName) {
        setFormData(prev => ({
            ...prev,
            companyName: context.settings.login.companyName || ''
        }));
    }

    if (!context || !context.isHydrated) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Save company name to settings context
        if (formData.companyName) {
            context.updateLoginSetting('companyName', formData.companyName);
        }

        // In a real app, save other fields to backend
        toast({
            title: 'تم الحفظ بنجاح!',
            description: 'تم تحديث معلومات الشركة.',
        });
    };

    return (
        <div className="space-y-6">
            <SettingsHeader
                icon="Building2"
                title="معلومات الشركة"
                description="إدارة معلومات الشركة الأساسية والتواصل"
                color="blue"
            />

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                        <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group border-2 hover:border-blue-500">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${link.color} text-white`}>
                                        <link.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                                            {link.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {link.description}
                                        </p>
                                    </div>
                                    <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Company Info Card */}
            <Card className="border-2 border-blue-500/20">
                <CardHeader className="bg-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500 text-white">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>المعلومات الأساسية</CardTitle>
                            <CardDescription>البيانات العامة للشركة</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-blue-500" />
                                اسم الشركة
                            </Label>
                            <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                                placeholder="مثال: شركة التوصيل السريع"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-500" />
                                رقم الهاتف
                            </Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="+966 5X XXX XXXX"
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
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
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website" className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-purple-500" />
                                الموقع الإلكتروني
                            </Label>
                            <Input
                                id="website"
                                value={formData.website}
                                onChange={(e) => handleChange('website', e.target.value)}
                                placeholder="https://www.company.com"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-orange-500" />
                            العنوان
                        </Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            placeholder="العنوان الكامل للشركة..."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="workingHours" className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-cyan-500" />
                            ساعات العمل
                        </Label>
                        <Input
                            id="workingHours"
                            value={formData.workingHours}
                            onChange={(e) => handleChange('workingHours', e.target.value)}
                            placeholder="مثال: السبت - الخميس، 9 صباحاً - 6 مساءً"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Legal Info Card */}
            <Card className="border-2 border-blue-500/20">
                <CardHeader className="bg-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500 text-white">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>المعلومات القانونية</CardTitle>
                            <CardDescription>بيانات التسجيل والضرائب</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="taxNumber" className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                الرقم الضريبي
                            </Label>
                            <Input
                                id="taxNumber"
                                value={formData.taxNumber}
                                onChange={(e) => handleChange('taxNumber', e.target.value)}
                                placeholder="رقم التسجيل الضريبي"
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="commercialRegister" className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                السجل التجاري
                            </Label>
                            <Input
                                id="commercialRegister"
                                value={formData.commercialRegister}
                                onChange={(e) => handleChange('commercialRegister', e.target.value)}
                                placeholder="رقم السجل التجاري"
                                dir="ltr"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-start pt-6 border-t">
                <Button size="lg" onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                </Button>
            </div>
        </div>
    );
}
