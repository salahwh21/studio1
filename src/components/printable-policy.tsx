
'use client';

import React from 'react';
import type { Order } from '@/store/orders-store';
import { Logo } from '@/components/logo';

const BarcodeIcon = () => (
    <svg viewBox="0 0 120 30" className="h-8 w-24">
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

const Policy: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="policy-sheet flex flex-col p-4 border border-black font-sans text-black bg-white">
            {/* Header */}
            <header className="flex justify-between items-start border-b-2 border-black pb-2">
                <div className="text-right">
                    <Logo />
                    <p className="text-xs mt-1">عمان, الأردن - 0790123456</p>
                </div>
                <div className="text-left">
                    <h2 className="font-bold text-lg">بوليصة شحن</h2>
                    <p className="text-xs font-mono">{order.id}</p>
                    <p className="text-xs">{new Date(order.date).toLocaleDateString('ar-JO')}</p>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-grow my-4 grid grid-cols-2 gap-4 text-sm">
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

            {/* Footer */}
            <footer className="mt-auto pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs">الرقم المرجعي: <span className="font-bold">{order.referenceNumber || 'N/A'}</span></p>
                        <div className="border-2 border-black rounded-lg p-2 mt-2 text-center">
                            <p className="font-bold text-sm">المبلغ المطلوب</p>
                            <p className="font-bold text-xl">{order.cod.toFixed(2)} د.أ</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <BarcodeIcon />
                        <p className="text-xs font-mono tracking-widest mt-1">{order.id}</p>
                    </div>
                </div>
                <p className="text-xs text-center border-t-2 border-black pt-2">شكرًا لثقتكم بنا. يرجى التأكد من الشحنة قبل استلامها.</p>
            </footer>
        </div>
    );
};

export const PrintablePolicy = React.forwardRef<HTMLDivElement, { orders: Order[] }>(({ orders }, ref) => {
    // A4 dimensions in pixels at 96 DPI: 794px x 1123px. We'll use this for layout.
    // We can fit two policies per A4 page.
    return (
        <div ref={ref}>
            {orders.map((order, index) => (
                <div key={order.id} className="w-[210mm] h-[148.5mm] p-4 page-break">
                   <Policy order={order} />
                </div>
            ))}
        </div>
    );
});

PrintablePolicy.displayName = 'PrintablePolicy';
