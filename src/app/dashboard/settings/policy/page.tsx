'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, 
    FileText, 
    Palette, 
    Tag, 
    Settings, 
    Eye, 
    Printer, 
    Download,
    Sliders,
    Zap,
    Wand2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOrdersStore } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

// Import the existing policy components
import { PrintablePolicy } from '@/components/printable-policy';
import { ModernPolicyV2 } from '@/components/modern-policy-v2';
import { ThermalLabelOptimized } from '@/components/thermal-label-optimized';
import { SimplePolicyEditor } from '@/components/policy-editor/SimplePolicyEditor';

type PolicyType = 'standard' | 'colored' | 'thermal' | 'simple';

export default function PolicySettingsPage() {
    const { orders } = useOrdersStore();
    const { settings } = useSettings();
    const { toast } = useToast();
    
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyType | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    
    // Refs for policy components to access their methods
    const printablePolicyRef = useRef<{ handleExport: () => Promise<void>; handleDirectPrint: (order: any, type: 'zpl' | 'escpos') => Promise<void> }>(null);
    const modernPolicyRef = useRef<{ handlePrint: () => void; handleExportPDF: () => Promise<void> }>(null);
    const thermalLabelRef = useRef<{ handlePrint: () => void; handleExportPDF: () => Promise<void> }>(null);

    const sampleOrders = orders.length > 0 ? orders.slice(0, 3) : [{
        id: '12345',
        orderNumber: 12345,
        recipient: 'أحمد محمد علي',
        phone: '0501234567',
        address: 'شارع الملك فهد، حي النزهة، مبنى رقم 123، الطابق الثاني',
        city: 'الرياض',
        region: 'منطقة الرياض',
        cod: 150,
        merchant: 'متجر الإلكترونيات الحديثة',
        date: new Date().toISOString().split('T')[0],
        notes: 'يرجى التسليم في المساء بعد الساعة 6',
        source: 'Manual' as const,
        referenceNumber: 'REF-001',
        whatsapp: '',
        status: 'Pending',
        previousStatus: '',
        driver: 'سائق التوصيل',
        itemPrice: 145,
        deliveryFee: 5,
        additionalCost: 0,
        driverFee: 10,
        driverAdditionalFare: 0,
    }];

    const policyTypes = [
        {
            id: 'simple' as PolicyType,
            title: 'المحرر البسيط',
            description: 'محرر سهل وسريع للبوالص والملصقات الحرارية بالقياسات الصحيحة',
            icon: Wand2,
            color: 'emerald',
            gradient: 'from-emerald-500 to-green-600',
            bgGradient: 'from-emerald-50 to-green-50',
            borderColor: 'border-emerald-500',
            features: ['القياسات الصحيحة المستخدمة', 'محرر بسيط وسريع', '100×150، 100×100، 75×50، 60×40، 50×30', 'تصدير وطباعة مباشرة']
        },
        {
            id: 'standard' as PolicyType,
            title: 'البوالص القياسية',
            description: 'بوليصة شحن تقليدية بتصميم بسيط وواضح مع شعار الشركة',
            icon: FileText,
            color: 'blue',
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-indigo-50',
            borderColor: 'border-blue-500',
            features: ['تصميم كلاسيكي', 'شعار الشركة تلقائياً', 'مناسب لجميع الطابعات', 'تصدير PDF + طباعة مباشرة']
        },
        {
            id: 'colored' as PolicyType,
            title: 'البوالص الملونة',
            description: 'بوليصة حديثة بألوان جذابة وتصميم عصري مع معاينة مباشرة',
            icon: Palette,
            color: 'purple',
            gradient: 'from-purple-500 to-pink-600',
            bgGradient: 'from-purple-50 to-pink-50',
            borderColor: 'border-purple-500',
            features: ['تصميم ملون حديث', 'تخصيص الألوان', 'معاينة مباشرة', 'جذاب بصرياً']
        },
        {
            id: 'thermal' as PolicyType,
            title: 'الملصقات الحرارية',
            description: 'ملصقات محسّنة للطابعات الحرارية بأحجام متعددة ومعاينة فورية',
            icon: Tag,
            color: 'orange',
            gradient: 'from-orange-500 to-red-600',
            bgGradient: 'from-orange-50 to-red-50',
            borderColor: 'border-orange-500',
            features: ['محسن للطابعات الحرارية', '5 أحجام مختلفة', 'طباعة سريعة', 'معاينة فورية']
        }
    ];

    const handleOpenEditor = (type: PolicyType) => {
        setSelectedPolicy(type);
        setIsEditorOpen(true);
    };

    const handlePrint = async () => {
        try {
            switch (selectedPolicy) {
                case 'standard':
                    await printablePolicyRef.current?.handleExport();
                    break;
                case 'colored':
                    await modernPolicyRef.current?.handlePrint();
                    break;
                case 'thermal':
                    await thermalLabelRef.current?.handlePrint();
                    break;
            }
            toast({ title: "تم إرسال للطباعة", description: "تم إرسال البوليصة للطابعة بنجاح" });
        } catch (error) {
            toast({ variant: 'destructive', title: "فشل الطباعة", description: "حدث خطأ أثناء الطباعة" });
        }
    };

    const handleExportPDF = async () => {
        try {
            switch (selectedPolicy) {
                case 'standard':
                    await printablePolicyRef.current?.handleExport();
                    break;
                case 'colored':
                    await modernPolicyRef.current?.handleExportPDF();
                    break;
                case 'thermal':
                    await thermalLabelRef.current?.handleExportPDF();
                    break;
            }
            toast({ title: "تم التصدير", description: "تم تصدير البوليصة كملف PDF بنجاح" });
        } catch (error) {
            toast({ variant: 'destructive', title: "فشل التصدير", description: "حدث خطأ أثناء تصدير PDF" });
        }
    };

    const renderPolicyEditor = () => {
        if (!selectedPolicy || !isEditorOpen) return null;

        const companyInfo = {
            name: settings.login?.companyName || 'شركة التوصيل',
            logo: settings.login?.reportsLogo || settings.login?.headerLogo
        };

        switch (selectedPolicy) {
            case 'simple':
                return (
                    <SimplePolicyEditor
                        onClose={() => setIsEditorOpen(false)}
                    />
                );
            case 'standard':
                return (
                    <PrintablePolicy 
                        ref={printablePolicyRef}
                        orders={sampleOrders} 
                        template={null}
                    />
                );
            case 'colored':
                return (
                    <ModernPolicyV2 
                        ref={modernPolicyRef}
                        orders={sampleOrders}
                        hideControls={false}
                    />
                );
            case 'thermal':
                return (
                    <ThermalLabelOptimized 
                        ref={thermalLabelRef}
                        orders={sampleOrders}
                        hideControls={false}
                    />
                );
            default:
                return null;
        }
    };

    const selectedPolicyConfig = policyTypes.find(p => p.id === selectedPolicy);

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Settings className="h-6 w-6 text-primary" />
                            محرر البوالص المتقدم
                        </CardTitle>
                        <CardDescription>
                            اختر نوع البوليصة وقم بتخصيصها مع معاينة مباشرة وشعار الشركة
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

            {/* Company Info Display */}
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">معلومات الشركة المطبقة</h3>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">الاسم:</span> {settings.login?.companyName || 'غير محدد'} | 
                                    <span className="font-medium"> الشعار:</span> {settings.login?.reportsLogo || settings.login?.headerLogo ? 'موجود' : 'غير محدد'}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/settings/policy/test-pdfmake">
                                اختبار pdfmake الجديد
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Policy Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {policyTypes.map((policy) => {
                    const Icon = policy.icon;
                    return (
                        <Card 
                            key={policy.id}
                            className={cn(
                                "group relative overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                                policy.borderColor,
                                `bg-gradient-to-br ${policy.bgGradient}`,
                                policy.id === 'simple' ? 'md:col-span-2' : ''
                            )}
                            onClick={() => handleOpenEditor(policy.id)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                                        `bg-gradient-to-br ${policy.gradient}`
                                    )}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex gap-2">
                                        {policy.id === 'simple' && (
                                            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs">
                                                الأفضل
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="text-xs">
                                            محرر تفاعلي
                                        </Badge>
                                    </div>
                                </div>
                                <CardTitle className={cn(
                                    "font-bold text-gray-900",
                                    policy.id === 'simple' ? 'text-xl' : 'text-lg'
                                )}>
                                    {policy.title}
                                </CardTitle>
                                <CardDescription className={cn(
                                    "text-gray-600",
                                    policy.id === 'simple' ? 'text-base' : 'text-sm'
                                )}>
                                    {policy.description}
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    <div className={cn(
                                        "space-y-2",
                                        policy.id === 'simple' ? 'grid grid-cols-2 gap-2 space-y-0' : ''
                                    )}>
                                        {policy.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    `bg-gradient-to-r ${policy.gradient}`
                                                )} />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Button 
                                        className={cn(
                                            "w-full gap-2 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl",
                                            `bg-gradient-to-r ${policy.gradient} hover:opacity-90`,
                                            policy.id === 'simple' ? 'h-12 text-base' : ''
                                        )}
                                        size={policy.id === 'simple' ? 'lg' : 'sm'}
                                    >
                                        <Eye className="h-4 w-4" />
                                        {policy.id === 'simple' ? 'فتح المحرر البسيط' : 'فتح المحرر'}
                                    </Button>
                                </div>
                            </CardContent>

                            {/* Decorative gradient overlay */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                                `bg-gradient-to-br ${policy.gradient}`
                            )} />
                        </Card>
                    );
                })}
            </div>

            {/* Policy Editor Dialog */}
            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogContent className={cn(
                    "flex flex-col p-0 bg-gray-50",
                    selectedPolicy === 'simple' ? "max-w-[100vw] h-[100vh] w-[100vw]" : "max-w-7xl h-[90vh]"
                )}>
                    {selectedPolicy === 'simple' ? (
                        // Hidden title for accessibility
                        <DialogHeader className="sr-only">
                            <DialogTitle>محرر البوليصة البسيط</DialogTitle>
                        </DialogHeader>
                    ) : (
                        <DialogHeader className={cn(
                            "px-6 py-4 border-b shrink-0",
                            selectedPolicyConfig ? `bg-gradient-to-r ${selectedPolicyConfig.gradient}` : 'bg-gray-800'
                        )}>
                            <DialogTitle className="text-lg font-bold text-white flex items-center gap-3">
                                {selectedPolicyConfig && <selectedPolicyConfig.icon className="h-5 w-5" />}
                                محرر {selectedPolicyConfig?.title}
                                <Badge className="bg-white/20 text-white text-xs">
                                    معاينة مباشرة
                                </Badge>
                            </DialogTitle>
                        </DialogHeader>
                    )}
                    
                    <div className="flex-1 overflow-hidden">
                        {renderPolicyEditor()}
                    </div>

                    {/* Footer with action buttons - only for non-simple editors */}
                    {selectedPolicy !== 'simple' && (
                        <DialogFooter className="px-6 py-4 border-t bg-white shrink-0">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Sliders className="h-4 w-4" />
                                    <span>التعديلات تظهر مباشرة في المعاينة</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={handlePrint}
                                        className="gap-2"
                                    >
                                        <Printer className="h-4 w-4" />
                                        طباعة مباشرة
                                    </Button>
                                    <Button 
                                        onClick={handleExportPDF}
                                        className={cn(
                                            "gap-2 text-white",
                                            selectedPolicyConfig ? `bg-gradient-to-r ${selectedPolicyConfig.gradient}` : 'bg-primary'
                                        )}
                                    >
                                        <Download className="h-4 w-4" />
                                        تصدير PDF
                                    </Button>
                                </div>
                            </div>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}