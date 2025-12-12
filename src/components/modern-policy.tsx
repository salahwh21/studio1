'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import type { Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import Barcode from 'react-barcode';

type ModernPolicyProps = {
    orders: Order[];
};

export const ModernPolicy = forwardRef(({ orders }: ModernPolicyProps, ref) => {
    const { toast } = useToast();

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        try {
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [101.6, 152.4], // 4x6 inch
            });

            const elements = document.querySelectorAll('.policy-page');

            for (let i = 0; i < elements.length; i++) {
                if (i > 0) pdf.addPage([101.6, 152.4], 'portrait');

                const canvas = await html2canvas(elements[i] as HTMLElement, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, 101.6, 152.4);
            }

            pdf.save(`policies_${new Date().toISOString().split('T')[0]}.pdf`);
            toast({ title: 'تم التصدير بنجاح', description: 'تم حفظ البوالص كملف PDF' });
        } catch (error) {
            console.error('Export error:', error);
            toast({
                variant: 'destructive',
                title: 'فشل التصدير',
                description: 'حدث خطأ أثناء تصدير البوالص',
            });
        }
    };

    useImperativeHandle(ref, () => ({
        handlePrint,
        handleExportPDF,
    }));

    if (orders.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8">
                لا توجد طلبات لطباعتها
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="policy-page bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
                    style={{
                        width: '384px', // 4 inch = 384px at 96dpi
                        height: '576px', // 6 inch = 576px at 96dpi
                        pageBreakAfter: 'always',
                    }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-center">
                        <h1 className="text-2xl font-bold mb-1">بوليصة شحن</h1>
                        <p className="text-sm opacity-90">Shipping Policy</p>
                    </div>

                    {/* Barcode Section */}
                    <div className="bg-gray-50 p-3 border-b-2 border-gray-200 flex justify-center">
                        <Barcode
                            value={order.id}
                            width={1.5}
                            height={50}
                            fontSize={14}
                            margin={0}
                        />
                    </div>

                    {/* Order Info */}
                    <div className="p-4 space-y-3">
                        {/* Recipient */}
                        <div className="bg-blue-50 border-r-4 border-blue-600 p-3 rounded">
                            <div className="text-xs text-gray-600 mb-1">المستلم</div>
                            <div className="text-lg font-bold text-gray-900">{order.recipient}</div>
                            <div className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                                <span>📱</span>
                                <span className="font-mono numeric" dir="ltr" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>{order.phone}</span>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="border-2 border-gray-200 p-3 rounded">
                            <div className="text-xs text-gray-600 mb-1">العنوان</div>
                            <div className="text-sm font-semibold text-gray-900 leading-relaxed">
                                {order.address}
                            </div>
                            <div className="flex gap-2 mt-2 text-xs">
                                <span className="bg-gray-100 px-2 py-1 rounded">📍 {order.city}</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">{order.region}</span>
                            </div>
                        </div>

                        {/* COD & Merchant */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-green-50 border-2 border-green-500 p-2 rounded text-center">
                                <div className="text-xs text-gray-600">المبلغ المطلوب</div>
                                <div className="text-xl font-bold text-green-700 numeric" dir="ltr" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>{order.cod} د.أ</div>
                            </div>
                            <div className="bg-purple-50 border-2 border-purple-500 p-2 rounded text-center">
                                <div className="text-xs text-gray-600">التاجر</div>
                                <div className="text-sm font-bold text-purple-700 truncate">{order.merchant}</div>
                            </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                            <div className="bg-yellow-50 border-r-4 border-yellow-500 p-2 rounded">
                                <div className="text-xs text-gray-600 mb-1">ملاحظات</div>
                                <div className="text-xs text-gray-800">{order.notes}</div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-100 p-2 text-center border-t-2 border-gray-300">
                        <div className="text-xs text-gray-600 numeric" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
                            التاريخ: <span dir="ltr">{order.date}</span> | الرقم: <span dir="ltr">{order.id}</span>
                        </div>
                    </div>
                </div>
            ))}

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .policy-page,
                    .policy-page * {
                        visibility: visible;
                    }
                    .policy-page {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 4in;
                        height: 6in;
                        page-break-after: always;
                    }
                    @page {
                        size: 4in 6in;
                        margin: 0;
                    }
                }
            `}</style>
        </div>
    );
});

ModernPolicy.displayName = 'ModernPolicy';
