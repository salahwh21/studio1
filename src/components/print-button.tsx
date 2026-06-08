'use client';

import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { openPdfInNewTab } from '@/services/pdf-service';
import type { Order } from '@/store/orders-store';
import { cn } from '@/lib/utils';

interface SavedTemplate {
    id: string;
    name: string;
    settings: any;
    html?: string;
}

interface PrintButtonProps {
    orders: Order[];
    disabled?: boolean;
    variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showLabel?: boolean;
    label?: string;
}

export const PrintButton = ({
    orders,
    disabled = false,
    variant = 'ghost',
    size = 'sm',
    className = '',
    showLabel = true,
    label = 'طباعة',
}: PrintButtonProps) => {
    const { toast } = useToast();

    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // تحميل القوالب المحفوظة عند فتح الـ dialog
    useEffect(() => {
        if (showTemplateDialog) {
            loadTemplates();
        }
    }, [showTemplateDialog]);

    const loadTemplates = async () => {
        try {
            const response = await fetch('/api/saved-templates');
            if (response.ok) {
                const data = await response.json();
                setSavedTemplates(data.templates || []);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const handlePrintClick = () => {
        if (orders.length === 0) {
            toast({
                variant: 'destructive',
                title: 'لم يتم تحديد طلبات',
                description: 'الرجاء تحديد طلب واحد على الأقل للطباعة.',
            });
            return;
        }
        setShowTemplateDialog(true);
    };

    const handlePrintWithTemplate = async (template: SavedTemplate) => {
        if (!template.html) {
            toast({
                variant: 'destructive',
                title: 'قالب غير صالح',
                description: 'هذا القالب لا يحتوي على تصميم HTML.',
            });
            return;
        }

        setIsLoading(true);

        try {
            // إنشاء HTML لكل طلب باستخدام القالب المحفوظ
            const allPoliciesHtml = orders.map((order) => {
                let html = template.html!
                    .replace(/ORD-12345/g, String(order.orderNumber || order.id))
                    .replace(/أحمد العلي|أحمد محمد العلي/g, String(order.recipient || ''))
                    .replace(/0501234567/g, String(order.phone || ''))
                    .replace(/شارع الملك فهد 25|شارع الملك فهد، بناء 25/g, String(order.address || ''))
                    .replace(/عمان - خلدا|عمان، خلدا/g, String(order.city || ''))
                    .replace(/خلدا/g, String(order.region || ''))
                    .replace(/250\.00 د\.أ|250/g, String(order.cod || 0))
                    .replace(/متجر الإلكترونيات|متجر الإلكترونيات الذكية/g, String(order.merchant || ''))
                    .replace(/يرجى التواصل قبل التوصيل/g, String(order.notes || ''));
                return html;

            });

            const combinedHtml = allPoliciesHtml.join('');

            // استخراج الأبعاد من إعدادات القالب إن وجدت
            const width = template.settings?.width || 100;
            const height = template.settings?.height || 150;

            await openPdfInNewTab(combinedHtml, `policies_${Date.now()}.pdf`, { width, height });

            setShowTemplateDialog(false);
            toast({
                title: 'تمت الطباعة',
                description: `تم طباعة ${orders.length} بوليصة`,
            });
        } catch (error) {
            console.error('Print error:', error);
            toast({
                variant: 'destructive',
                title: 'خطأ في الطباعة',
                description: error instanceof Error ? error.message : 'حدث خطأ غير معروف',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isDisabled = disabled || orders.length === 0;

    return (
        <>
            {/* Print Button */}
            <Button
                variant={variant}
                size={size}
                disabled={isDisabled}
                className={`${className} ${isDisabled ? 'disabled:opacity-40' : ''} transition-all hover:scale-105`}
                onClick={handlePrintClick}
            >
                <Printer className={`h-4 w-4 ${showLabel ? 'ml-2' : ''}`} />
                {showLabel && <span className="font-bold">{label}</span>}
            </Button>

            {/* Template Selection Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogContent className="max-w-md" style={{ direction: 'rtl' }}>
                    <DialogTitle className="text-lg font-bold">اختر قالب للطباعة</DialogTitle>

                    <div className="py-4">
                        {savedTemplates.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Printer className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p className="font-bold mb-2">لا توجد قوالب محفوظة</p>
                                <p className="text-sm">
                                    لإنشاء قالب جديد، اذهب إلى:
                                    <br />
                                    <span className="text-blue-600">لوحة التحكم ← التقارير ← مصمم البوالص</span>
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 mb-3">
                                    سيتم طباعة {orders.length} بوليصة
                                </p>
                                {savedTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handlePrintWithTemplate(template)}
                                        disabled={isLoading}
                                        className={cn(
                                            "w-full p-4 rounded-lg border text-right transition-all",
                                            "hover:bg-blue-50 hover:border-blue-300",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            isLoading && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="font-bold">{template.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {template.settings?.size || 'حجم افتراضي'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PrintButton;
