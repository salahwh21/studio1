'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import type { Order } from '@/store/orders-store';
import { Logo } from '@/components/logo';
import { useSettings, type PolicySettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import Barcode from 'react-barcode';
import Icon from './icon';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from './ui/button';


const paperSizeClasses = {
  a4: 'w-[210mm] min-h-[297mm] p-8',
  a5: 'w-[148mm] min-h-[210mm] p-6',
  label_4x6: 'w-[101.6mm] min-h-[152.4mm] p-4 text-sm',
  label_4x4: 'w-[101.6mm] min-h-[101.6mm] p-3 text-[10px] leading-tight',
};

const renderCustomFields = (customFields: {label: string, value: string}[], isSmallLabel: boolean) => (
    <div className={cn("mt-2 space-y-1", isSmallLabel ? "text-[8px]" : "text-xs")}>
        {customFields.filter(f => f.label).map((field, index) => (
            <div key={index} className="flex justify-between border-t border-dashed pt-1">
                <span className="font-bold">{field.label}:</span>
                <span>{field.value}</span>
            </div>
        ))}
    </div>
);

const PolicyLogo = ({ loginSettings }: { loginSettings: any }) => {
    if (loginSettings.policyLogo) {
      return <Image src={loginSettings.policyLogo} alt={loginSettings.companyName || "Company Logo"} width={100} height={35} style={{objectFit: 'contain'}} />
    }
    return <Logo />;
};

const formatDate = (dateString: string, format: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
        case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
        case 'DD/MM/YYYY': default: return `${day}/${month}/${year}`;
    }
};

const DefaultLayout = ({ settings, loginSettings, order, isSmallLabel }: { settings: PolicySettings, loginSettings: any, order: Order, isSmallLabel: boolean }) => {
    const { formatCurrency } = useSettings();
    return (
        <>
            <header className="flex justify-between items-start border-b-2 border-black pb-2">
            <div className="text-right">
                {settings.showCompanyLogo && <div className="h-12"><PolicyLogo loginSettings={loginSettings} /></div>}
                {settings.showCompanyName && <h1 className="font-bold text-lg mt-1">{loginSettings.companyName || 'شركة الوميض للتوصيل'}</h1>}
                {settings.showCompanyAddress && <p className="text-xs">عمان, الأردن - 0790123456</p>}
            </div>
            <div className="text-left">
                <h2 className="font-bold">بوليصة شحن</h2>
                <p className="text-xs font-mono">{order.id}</p>
                <p className="text-xs">{formatDate(order.date, useSettings().settings.regional.dateFormat)}</p>
            </div>
            </header>

            <main className="flex-grow my-4 grid grid-cols-2 gap-4">
            <div className="border border-black rounded p-2">
                <h3 className="font-bold border-b border-black mb-2">من (المرسل)</h3>
                <p>{order.merchant}</p>
                <p>0780123456</p>
                <p>مخزن الصويفية</p>
            </div>
            <div className="border border-black rounded p-2">
                <h3 className="font-bold border-b border-black mb-2">إلى (المستلم)</h3>
                <p>{order.recipient}</p>
                <p>{order.phone}</p>
                <p>{order.address}</p>
            </div>
            </main>

            {settings.showItems && (
            <div className="mb-4">
                <table className="w-full text-xs border-collapse border border-black">
                    <thead><tr className="bg-gray-200"><th className="border border-black p-1">المنتج</th><th className="border border-black p-1">الكمية</th><th className="border border-black p-1">السعر</th></tr></thead>
                    <tbody><tr><td className="border border-black p-1">منتج 1</td><td className="border border-black p-1 text-center">2</td><td className="border border-black p-1 text-center">{formatCurrency(15.00)}</td></tr><tr><td className="border border-black p-1">منتج 2</td><td className="border border-black p-1 text-center">1</td><td className="border border-black p-1 text-center">{formatCurrency(20.50)}</td></tr></tbody>
                </table>
            </div>
            )}
            {renderCustomFields(settings.customFields, isSmallLabel)}

            <footer className="mt-auto pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        {settings.showRefNumber && <p className="text-xs">الرقم المرجعي: <span className="font-bold">{order.referenceNumber || 'N/A'}</span></p>}
                        {settings.showPrice && <div className="border-2 border-black rounded-lg p-2 mt-2 text-center"><p className="font-bold text-sm">المبلغ المطلوب</p><p className="font-bold text-xl">{formatCurrency(order.cod)}</p></div>}
                    </div>
                    {settings.showBarcode && <div className="flex flex-col items-center justify-center"><Barcode value={order.id} height={30} width={1} displayValue={false} margin={0} /><p className="text-xs font-mono tracking-widest mt-1">{order.id}</p></div>}
                </div>
                {settings.footerNotes && <p className="text-xs text-center border-t-2 border-black pt-2">{settings.footerNotes}</p>}
            </footer>
        </>
    );
}

const CompactLayout = ({ settings, loginSettings, order, isSmallLabel }: { settings: PolicySettings, loginSettings: any, order: Order, isSmallLabel: boolean }) => {
    const { formatCurrency } = useSettings();
    return (
        <>
            <div className={cn("grid grid-cols-2 gap-x-2 border-b-2 border-black", isSmallLabel ? 'pb-1' : 'pb-2')}>
                <div className="text-right space-y-1">
                    {settings.showCompanyLogo && <div className={cn(isSmallLabel ? "h-6" : "h-8")}><PolicyLogo loginSettings={loginSettings} /></div>}
                    {settings.showCompanyName && <h1 className={cn("font-bold", isSmallLabel ? "text-xs" : "text-base")}>{loginSettings.companyName || 'شركة الوميض للتوصيل'}</h1>}
                </div>
                <div className="text-left space-y-1">
                    <div className="flex flex-col items-end">
                      {settings.showBarcode && <div className={cn("flex flex-col items-center justify-center origin-right", isSmallLabel ? "scale-75 -mr-4" : "scale-100")}><Barcode value={order.id} height={30} width={1} displayValue={false} margin={0} /><p className={cn("font-mono tracking-wider mt-1", isSmallLabel ? "text-[8px]" : "text-[10px]")}>{order.id}</p></div>}
                    </div>
                </div>
            </div>
            <main className={cn("flex-grow space-y-1", isSmallLabel ? 'my-1' : 'my-2')}>
                <div className={cn("grid grid-cols-2 gap-1", isSmallLabel ? 'text-xs' : 'text-sm')}><div className='space-y-0.5'><p className='font-bold'>المرسل:</p><p>{order.merchant} (0780123456)</p></div><div className='space-y-0.5'><p className='font-bold'>الرقم المرجعي:</p><p>{order.referenceNumber || 'N/A'}</p></div><div className='space-y-0.5'><p className='font-bold'>تاريخ الطلب:</p><p>{formatDate(order.date, useSettings().settings.regional.dateFormat)}</p></div></div>
                <div className={cn("border border-black rounded p-1 space-y-0.5", isSmallLabel ? 'text-xs' : 'text-sm')}><p className="font-bold">المستلم: {order.recipient}</p><p>الهاتف: {order.phone}</p><p className="font-bold">العنوان: {order.address}</p></div>
            </main>
            {settings.showItems && (<div className={cn(isSmallLabel ? 'text-xs my-1' : 'text-sm my-2')}><p>المحتويات: منتج 1 (x2), منتج 2 (x1)</p></div>)}
            {renderCustomFields(settings.customFields, isSmallLabel)}
            <footer className="mt-auto pt-1 space-y-1 border-t-2 border-black">
                {settings.showPrice && <div className="text-center"><p className={cn("font-bold", isSmallLabel ? "text-sm" : "text-base")}>المبلغ المطلوب</p><p className={cn("font-bold", isSmallLabel ? "text-lg" : "text-2xl")}>{formatCurrency(order.cod)}</p></div>}
                {settings.footerNotes && <p className={cn("text-center", isSmallLabel ? "text-[9px]" : "text-[10px]")}>{settings.footerNotes}</p>}
            </footer>
        </>
    );
}

const DetailedLayout = ({ settings, loginSettings, order, isSmallLabel }: { settings: PolicySettings, loginSettings: any, order: Order, isSmallLabel: boolean }) => {
    const { formatCurrency } = useSettings();
    return (
        <>
            <header className={cn("grid grid-cols-3 gap-2 border-b-2 border-black items-center", isSmallLabel ? 'pb-1' : 'pb-2')}>
                <div className="col-span-1">{settings.showCompanyLogo && <div className={cn(isSmallLabel ? "h-8" : "h-10")}><PolicyLogo loginSettings={loginSettings} /></div>}</div>
                <div className="col-span-2 text-left">
                    <h2 className={cn("font-bold", isSmallLabel ? "text-base" : "text-lg")}>بوليصة شحن</h2>
                    {settings.showBarcode && <div className="flex flex-col items-end"><div className={cn("origin-right", isSmallLabel ? "scale-75" : "scale-100")}><Barcode value={order.id} height={30} width={1} displayValue={false} margin={0} /></div><p className={cn("font-mono tracking-wider -mt-2", isSmallLabel ? "text-[8px]" : "text-[10px]")}>{order.id}</p></div>}
                </div>
            </header>
            <main className={cn("flex-grow space-y-1", isSmallLabel ? 'my-1' : 'my-2', isSmallLabel ? 'text-xs' : 'text-sm')}>
                <div className="grid grid-cols-2 gap-2"><p><span className="font-bold">تاريخ الطلب:</span> {formatDate(order.date, useSettings().settings.regional.dateFormat)}</p>{settings.showRefNumber && <p><span className="font-bold">الرقم المرجعي:</span> {order.referenceNumber || 'N/A'}</p>}</div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="border border-black rounded p-1"><h3 className="font-bold border-b border-black mb-1">المرسل</h3><p>{order.merchant}</p><p>0780123456</p></div>
                    <div className="border border-black rounded p-1"><h3 className="font-bold border-b border-black mb-1">المستلم</h3><p>{order.recipient}</p><p>{order.phone}</p></div>
                </div>
                <div className="border border-black rounded p-1"><p><span className="font-bold">العنوان:</span> {order.address}</p></div>
                {settings.showItems && <div className="border border-black rounded p-1"><p><span className="font-bold">المحتويات:</span> منتج 1 (x2), منتج 2 (x1)</p></div>}
            </main>
            {renderCustomFields(settings.customFields, isSmallLabel)}
            <footer className={cn("mt-auto space-y-1 border-t-2 border-black", isSmallLabel ? 'pt-1' : 'pt-2')}>
                {settings.showPrice && <div className="border-2 border-black rounded-lg p-1 text-center"><p className={cn("font-bold", isSmallLabel ? "text-base" : "text-lg")}>المبلغ المطلوب</p><p className={cn("font-bold", isSmallLabel ? "text-lg" : "text-xl")}>{formatCurrency(order.cod)}</p></div>}
                {settings.footerNotes && <p className={cn("text-center pt-1", isSmallLabel ? "text-[8px]" : "text-[9px]")}>{settings.footerNotes}</p>}
            </footer>
        </>
    );
};


const Policy: React.FC<{ order: Order; settings: PolicySettings; loginSettings: any }> = ({ order, settings, loginSettings }) => {
    const isSmallLabel = settings.paperSize.startsWith('label_');

    const renderLayout = () => {
        switch(settings.layout) {
            case 'compact': return <CompactLayout settings={settings} loginSettings={loginSettings} order={order} isSmallLabel={isSmallLabel}/>;
            case 'detailed': return <DetailedLayout settings={settings} loginSettings={loginSettings} order={order} isSmallLabel={isSmallLabel}/>;
            case 'default': default: return <DefaultLayout settings={settings} loginSettings={loginSettings} order={order} isSmallLabel={isSmallLabel}/>;
        }
    }
    
    return (
        <div className={cn(
            "policy-sheet flex flex-col font-sans text-black bg-white shadow-lg mx-auto",
            paperSizeClasses[settings.paperSize as keyof typeof paperSizeClasses]
        )}>
            {renderLayout()}
        </div>
    );
};

export const PrintablePolicy = forwardRef<
    { handleExportPDF: (overrideSettings?: Partial<PolicySettings>) => void },
    { orders: Order[], previewSettings?: PolicySettings }
>(({ orders, previewSettings }, ref) => {
    const context = useSettings();
    const { toast } = useToast();
    const printAreaRef = useRef<HTMLDivElement>(null);

    const activeSettings = previewSettings || context?.settings.policy;
    const loginSettings = context?.settings.login;
    
    const handleExportPDF = async (overrideSettings?: Partial<PolicySettings>) => {
        const printArea = printAreaRef.current;
        if (!printArea) {
            toast({ variant: 'destructive', title: 'خطأ في الطباعة', description: 'لا يمكن العثور على المحتوى للطباعة.' });
            return;
        }

        const policyElements = Array.from(printArea.querySelectorAll('.policy-sheet'));
        if (policyElements.length === 0) {
            toast({ variant: 'destructive', title: 'لا طلبات محددة', description: 'الرجاء تحديد طلب واحد على الأقل لطباعة البوليصة.' });
            return;
        }

        try {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

            for (let i = 0; i < policyElements.length; i++) {
                const element = policyElements[i] as HTMLElement;
                
                const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                
                if (i > 0) {
                    pdf.addPage();
                }

                const pdfPageWidth = pdf.internal.pageSize.getWidth();
                const pdfPageHeight = pdf.internal.pageSize.getHeight();
                
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;

                let finalWidth = pdfPageWidth;
                let finalHeight = finalWidth / ratio;

                if (finalHeight > pdfPageHeight) {
                    finalHeight = pdfPageHeight;
                    finalWidth = finalHeight * ratio;
                }
                
                const x = (pdfPageWidth - finalWidth) / 2;
                const y = (pdfPageHeight - finalHeight) / 2;
                
                 if (isNaN(finalWidth) || isNaN(finalHeight) || isNaN(x) || isNaN(y)) {
                    throw new Error("فشلت عملية حساب أبعاد الصورة للـ PDF. قد تكون البيانات غير صالحة.");
                }
                
                pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
            }
            pdf.autoPrint();
            window.open(pdf.output('bloburl'), '_blank');
        } catch (err: any) {
            console.error("Error generating PDF: ", err);
            toast({
                variant: 'destructive',
                title: 'خطأ أثناء توليد الـ PDF',
                description: err.message || 'حدث خطأ غير متوقع أثناء تحويل البوليصة إلى صورة.'
            });
        }
    };
    
    useImperativeHandle(ref, () => ({
        handleExportPDF,
    }));
    
    if (!context?.isHydrated || !activeSettings || !loginSettings) {
        return <div><Skeleton className="h-[297mm] w-[210mm]" /></div>;
    }
    
    // Create a dummy order for preview if no orders are passed
    const displayOrders = orders.length > 0 ? orders : [{
        id: 'ORD-1719810001', recipient: 'محمد جاسم', merchant: 'تاجر أ', date: new Date().toISOString(),
        phone: '07701112233', address: 'الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3',
        cod: 35.5, referenceNumber: 'REF-00101',
        city: 'عمان', driver: 'علي', itemPrice: 33, deliveryFee: 2.5, notes: '', orderNumber: 1, region: 'الصويفية', source: 'Manual', status: 'جاري التوصيل', whatsapp: ''
    }];

    return (
        <div>
             <div ref={printAreaRef} id="printable-area" className="bg-muted p-4 sm:p-8 flex items-start justify-center flex-wrap gap-4">
                {displayOrders.map((order) => (
                    <React.Fragment key={order.id}>
                       <Policy order={order} settings={activeSettings} loginSettings={loginSettings}/>
                    </React.Fragment>
                ))}
            </div>
             {orders.length === 0 && (
                <div className="text-center mt-4">
                     <Button onClick={() => handleExportPDF()}>
                        <Icon name="Printer" className="ml-2 h-4 w-4" />
                        طباعة معاينة
                    </Button>
                </div>
            )}
        </div>
    );
});

PrintablePolicy.displayName = 'PrintablePolicy';
