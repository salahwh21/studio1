
'use client';

import React, { useContext } from 'react';
import type { Order } from '@/store/orders-store';
import { Logo } from '@/components/logo';
import { useSettings, type PolicySettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

const BarcodeIcon = () => (
  <svg viewBox="0 0 120 30" className="h-10 w-24">
    <rect x="0" y="0" width="2" height="30" fill="black" />
    <rect x="4" y="0" width="1" height="30" fill="black" />
    <rect x="7" y="0" width="3" height="30" fill="black" />
    <rect x="12" y="0" width="1" height="30" fill="black" />
    <rect x="15" y="0" width="2" height="30" fill="black" />
    <rect x="19" y="0" width="2" height="30" fill="black" />
    <rect x="23" y="0" width="1" height="30" fill="black" />
    <rect x="26" y="0" width="3" height="30" fill="black" />
    <rect x="31" y="0" width="1" height="30" fill="black" />
    <rect x="34" y="0" width="3" height="30" fill="black" />
    <rect x="39" y="0" width="2" height="30" fill="black" />
    <rect x="43" y="0" width="1" height="30" fill="black" />
    <rect x="46" y="0" width="1" height="30" fill="black" />
    <rect x="49" y="0" width="3" height="30" fill="black" />
    <rect x="54" y="0" width="2" height="30" fill="black" />
    <rect x="58" y="0" width="1" height="30" fill="black" />
    <rect x="61" y="0" width="3" height="30" fill="black" />
    <rect x="66" y="0" width="1" height="30" fill="black" />
    <rect x="69" y="0" width="2" height="30" fill="black" />
    <rect x="73" y="0" width="2" height="30" fill="black" />
    <rect x="77" y="0" width="1" height="30" fill="black" />
    <rect x="80" y="0" width="3" height="30" fill="black" />
    <rect x="85" y="0" width="1" height="30" fill="black" />
    <rect x="88" y="0" width="3" height="30" fill="black" />
    <rect x="93" y="0" width="2" height="30" fill="black" />
    <rect x="97" y="0" width="1" height="30" fill="black" />
    <rect x="100" y="0" width="1" height="30" fill="black" />
    <rect x="103" y="0" width="3" height="30" fill="black" />
    <rect x="108" y="0" width="2" height="30" fill="black" />
    <rect x="112" y="0" width="1" height="30" fill="black" />
    <rect x="115" y="0" width="3" height="30" fill="black" />
  </svg>
);


const paperSizeClasses = {
  a4: 'w-[210mm] h-[297mm] p-8',
  a5: 'w-[148mm] h-[210mm] p-6',
  label_4x6: 'w-[101.6mm] h-[152.4mm] p-4 text-sm',
  label_4x4: 'w-[101.6mm] h-[101.6mm] p-3 text-[10px] leading-tight',
  label_4x2: 'w-[101.6mm] h-[50.8mm] p-2 text-[9px] leading-tight',
  label_3x2: 'w-[76.2mm] h-[50.8mm] p-2 text-[8px] leading-tight',
  label_2x3: 'w-[50.8mm] h-[76.2mm] p-2 text-[8px] leading-tight',
};

const renderCustomFields = (customFields: {label: string, value: string}[], isSmallLabel: boolean) => (
    <div className={cn("mt-2 space-y-1", isSmallLabel ? "text-[7px]" : "text-xs")}>
        {customFields.filter(f => f.label).map((field, index) => (
            <div key={index} className="flex justify-between border-t border-dashed pt-1">
                <span className="font-bold">{field.label}:</span>
                <span>{field.value}</span>
            </div>
        ))}
    </div>
);

const DefaultLayout = ({ settings, order, isSmallLabel }: { settings: PolicySettings, order: Order, isSmallLabel: boolean }) => (
    <>
        <header className="flex justify-between items-start border-b-2 border-black pb-2">
        <div className="text-right">
            {settings.showCompanyLogo && <div className="h-12"><Logo /></div>}
            {settings.showCompanyName && <h1 className="font-bold text-lg mt-1">شركة الوميض للتوصيل</h1>}
            {settings.showCompanyAddress && <p className="text-xs">عمان, الأردن - 0790123456</p>}
        </div>
        <div className="text-left">
            <h2 className="font-bold">بوليصة شحن</h2>
            <p className="text-xs font-mono">{order.id}</p>
            <p className="text-xs">{new Date(order.date).toLocaleDateString('ar-JO')}</p>
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
                <tbody><tr><td className="border border-black p-1">منتج 1</td><td className="border border-black p-1 text-center">2</td><td className="border border-black p-1 text-center">15.00</td></tr><tr><td className="border border-black p-1">منتج 2</td><td className="border border-black p-1 text-center">1</td><td className="border border-black p-1 text-center">20.50</td></tr></tbody>
            </table>
        </div>
        )}
        {renderCustomFields(settings.customFields, isSmallLabel)}

        <footer className="mt-auto pt-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    {settings.showRefNumber && <p className="text-xs">الرقم المرجعي: <span className="font-bold">{order.referenceNumber || 'N/A'}</span></p>}
                    {settings.showPrice && <div className="border-2 border-black rounded-lg p-2 mt-2 text-center"><p className="font-bold text-sm">المبلغ المطلوب</p><p className="font-bold text-xl">{order.cod.toFixed(2)} د.أ</p></div>}
                </div>
                {settings.showBarcode && <div className="flex flex-col items-center justify-center"><BarcodeIcon /><p className="text-xs font-mono tracking-widest mt-1">{order.id}</p></div>}
            </div>
            {settings.footerNotes && <p className="text-xs text-center border-t-2 border-black pt-2">{settings.footerNotes}</p>}
        </footer>
    </>
);

const CompactLayout = ({ settings, order, isSmallLabel }: { settings: PolicySettings, order: Order, isSmallLabel: boolean }) => (
    <>
        <div className={cn("grid grid-cols-2 gap-x-2 border-b-2 border-black", isSmallLabel ? 'pb-1' : 'pb-2')}>
            <div className="text-right space-y-1">
                {settings.showCompanyLogo && <div className={cn(isSmallLabel ? "h-6" : "h-8")}><Logo /></div>}
                {settings.showCompanyName && <h1 className={cn("font-bold", isSmallLabel ? "text-[8px]" : "text-base")}>شركة الوميض للتوصيل</h1>}
            </div>
            <div className="text-left space-y-1">
                <div className="flex flex-col items-end">
                  {settings.showBarcode && <div className={cn("flex flex-col items-center justify-center origin-right", isSmallLabel ? "scale-50 -mr-4" : "scale-75")}><BarcodeIcon /><p className={cn("font-mono tracking-wider mt-1", isSmallLabel ? "text-[6px]" : "text-[8px]")}>{order.id}</p></div>}
                </div>
            </div>
        </div>
        <main className={cn("flex-grow space-y-1", isSmallLabel ? 'my-1' : 'my-2')}>
            <div className={cn("grid grid-cols-2 gap-1", isSmallLabel ? 'text-[7px]' : 'text-xs')}><div className='space-y-0.5'><p className='font-bold'>المرسل:</p><p>{order.merchant} (0780123456)</p></div><div className='space-y-0.5'><p className='font-bold'>الرقم المرجعي:</p><p>{order.referenceNumber || 'N/A'}</p></div><div className='space-y-0.5'><p className='font-bold'>تاريخ الطلب:</p><p>{new Date(order.date).toLocaleDateString('ar-JO')}</p></div></div>
            <div className={cn("border border-black rounded p-1 space-y-0.5", isSmallLabel ? 'text-[7px]' : 'text-xs')}><p className="font-bold">المستلم: {order.recipient}</p><p>الهاتف: {order.phone}</p><p className="font-bold">العنوان: {order.address}</p></div>
        </main>
        {settings.showItems && (<div className={cn(isSmallLabel ? 'text-[7px] my-1' : 'text-[10px] my-2')}><p>المحتويات: منتج 1 (x2), منتج 2 (x1)</p></div>)}
        {renderCustomFields(settings.customFields, isSmallLabel)}
        <footer className="mt-auto pt-1 space-y-1 border-t-2 border-black">
            {settings.showPrice && <div className="text-center"><p className={cn("font-bold", isSmallLabel ? "text-[9px]" : "text-sm")}>المبلغ المطلوب</p><p className={cn("font-bold", isSmallLabel ? "text-base" : "text-xl")}>{order.cod.toFixed(2)} د.أ</p></div>}
            {settings.footerNotes && <p className={cn("text-center", isSmallLabel ? "text-[6px]" : "text-[10px]")}>{settings.footerNotes}</p>}
        </footer>
    </>
);

const DetailedLayout = ({ settings, order, isSmallLabel }: { settings: PolicySettings, order: Order, isSmallLabel: boolean }) => (
    <>
        <header className={cn("grid grid-cols-3 gap-2 border-b-2 border-black items-center", isSmallLabel ? 'pb-1' : 'pb-2')}>
            <div className="col-span-1">{settings.showCompanyLogo && <div className={cn(isSmallLabel ? "h-6" : "h-10")}><Logo /></div>}</div>
            <div className="col-span-2 text-left">
                <h2 className={cn("font-bold", isSmallLabel ? "text-sm" : "text-lg")}>بوليصة شحن</h2>
                {settings.showBarcode && <div className="flex flex-col items-end"><div className={cn("origin-right", isSmallLabel ? "scale-50" : "scale-75")}><BarcodeIcon /></div><p className={cn("font-mono tracking-wider -mt-2", isSmallLabel ? "text-[7px]" : "text-[9px]")}>{order.id}</p></div>}
            </div>
        </header>
        <main className={cn("flex-grow space-y-1", isSmallLabel ? 'my-1' : 'my-2', isSmallLabel ? 'text-[7px]' : 'text-xs')}>
            <div className="grid grid-cols-2 gap-2"><p><span className="font-bold">تاريخ الطلب:</span> {new Date(order.date).toLocaleDateString('ar-JO')}</p>{settings.showRefNumber && <p><span className="font-bold">الرقم المرجعي:</span> {order.referenceNumber || 'N/A'}</p>}</div>
            <div className="grid grid-cols-2 gap-2">
                <div className="border border-black rounded p-1"><h3 className="font-bold border-b border-black mb-1">المرسل</h3><p>{order.merchant}</p><p>0780123456</p></div>
                <div className="border border-black rounded p-1"><h3 className="font-bold border-b border-black mb-1">المستلم</h3><p>{order.recipient}</p><p>{order.phone}</p></div>
            </div>
            <div className="border border-black rounded p-1"><p><span className="font-bold">العنوان:</span> {order.address}</p></div>
            {settings.showItems && <div className="border border-black rounded p-1"><p><span className="font-bold">المحتويات:</span> منتج 1 (x2), منتج 2 (x1)</p></div>}
        </main>
        {renderCustomFields(settings.customFields, isSmallLabel)}
        <footer className={cn("mt-auto space-y-1 border-t-2 border-black", isSmallLabel ? 'pt-1' : 'pt-2')}>
            {settings.showPrice && <div className="border-2 border-black rounded-lg p-1 text-center"><p className={cn("font-bold", isSmallLabel ? "text-xs" : "text-sm")}>المبلغ المطلوب</p><p className={cn("font-bold", isSmallLabel ? "text-sm" : "text-lg")}>{order.cod.toFixed(2)} د.أ</p></div>}
            {settings.footerNotes && <p className={cn("text-center pt-1", isSmallLabel ? "text-[7px]" : "text-[9px]")}>{settings.footerNotes}</p>}
        </footer>
    </>
);


const Policy: React.FC<{ order: Order; settings: PolicySettings }> = ({ order, settings }) => {
    const isSmallLabel = settings.paperSize.startsWith('label_');

    const renderLayout = () => {
        switch(settings.layout) {
            case 'compact': return <CompactLayout settings={settings} order={order} isSmallLabel={isSmallLabel}/>;
            case 'detailed': return <DetailedLayout settings={settings} order={order} isSmallLabel={isSmallLabel}/>;
            case 'default': default: return <DefaultLayout settings={settings} order={order} isSmallLabel={isSmallLabel}/>;
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

export const PrintablePolicy = React.forwardRef<HTMLDivElement, { orders: Order[], previewSettings?: PolicySettings }>(({ orders, previewSettings }, ref) => {
    const context = useSettings();
    const settings = previewSettings || context?.settings.policy;

    if (!settings) {
        return <div ref={ref}>Loading settings...</div>;
    }
    
    // Create a dummy order for preview if no orders are passed
    const displayOrders = orders.length > 0 ? orders : [{
        id: 'ORD-1719810001', recipient: 'محمد جاسم', merchant: 'تاجر أ', date: new Date().toISOString(),
        phone: '07701112233', address: 'الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3',
        cod: 35.5, referenceNumber: 'REF-00101',
        city: 'عمان', driver: 'علي', itemPrice: 33, deliveryFee: 2.5, notes: '', orderNumber: 1, region: 'الصويفية', source: 'Manual', status: 'جاري التوصيل', whatsapp: ''
    }];

    return (
        <div ref={ref} className="bg-muted p-4 sm:p-8 flex items-start justify-center flex-wrap gap-4">
            {displayOrders.map((order) => (
                <div key={order.id} className="page-break">
                   <Policy order={order} settings={settings} />
                </div>
            ))}
        </div>
    );
});

PrintablePolicy.displayName = 'PrintablePolicy';
