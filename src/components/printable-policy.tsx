
'use client';

import React, { useImperativeHandle, forwardRef, useContext } from 'react';
import type { Order } from '@/store/orders-store';
import { useSettings, SettingsContext, SavedTemplate } from '@/contexts/SettingsContext';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import Icon from './icon';
import Policy from './Policy';

const paperSizeClasses = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  label_4x6: { width: 101.6, height: 152.4 },
  label_4x4: { width: 101.6, height: 101.6 },
  custom: { width: 75, height: 45 },
};

export const PrintablePolicy = forwardRef<
  { handleExportPDF: () => void },
  { orders: Order[]; template: SavedTemplate | null; onExport?: () => void }
>(({ orders, template, onExport }, ref) => {
  const context = useSettings();
  const { toast } = useToast();

  const mmToPt = (mm: number) => mm * (72 / 25.4);

  const handleExportPDF = async () => {
    if (!template || !context) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار قالب للطباعة أولاً.' });
      return;
    }

    const displayOrders = orders.length > 0 ? orders : [
      {
        id: 'ORD-1719810001', recipient: 'محمد جاسم', merchant: 'تاجر أ', date: new Date().toISOString(),
        phone: '07701112233', address: 'الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3',
        cod: 35.5, referenceNumber: 'REF-00101',
        city: 'عمان', driver: 'علي', itemPrice: 33, deliveryFee: 2.5,
        notes: 'ملاحظة تجريبية للطباعة.', orderNumber: 1,
        region: 'الصويفية', source: 'Manual', status: 'جاري التوصيل', whatsapp: ''
      }
    ];

    const paperSizeKey = template.paperSize || 'custom';
    const customDimensions = template.customDimensions || { width: 0, height: 0 };
    const paperDimensions = {
      width: paperSizeKey === 'custom' ? customDimensions.width : paperSizeClasses[paperSizeKey].width,
      height: paperSizeKey === 'custom' ? customDimensions.height : paperSizeClasses[paperSizeKey].height,
    };

    const pdf = new jsPDF({
      orientation: paperDimensions.width > paperDimensions.height ? 'l' : 'p',
      unit: 'pt',
      format: [mmToPt(paperDimensions.width), mmToPt(paperDimensions.height)]
    });

    for (let i = 0; i < displayOrders.length; i++) {
      const order = displayOrders[i];
      if (i > 0) {
        pdf.addPage(
          [mmToPt(paperDimensions.width), mmToPt(paperDimensions.height)],
          paperDimensions.width > paperDimensions.height ? 'l' : 'p'
        );
      }
      const policyHtmlElement = document.getElementById(`policy-sheet-${order.id}`);
      if (!policyHtmlElement) continue;

      try {
        const canvas = await html2canvas(policyHtmlElement, { scale: 2, useCORS: true, allowTaint: true });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, mmToPt(paperDimensions.width), mmToPt(paperDimensions.height));
      } catch (e) {
        console.error("Error generating PDF page:", e);
        toast({ variant: 'destructive', title: 'خطأ في الطباعة', description: 'حدث خطأ أثناء توليد ملف PDF.' });
        return;
      }
    }

    if (displayOrders.length > 0) {
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
    }

    if (onExport) onExport();
  };

  const handleDirectPrintEscPos = async (order: Order) => {
    const escposCommands = `
      \x1B\x40
      \x1B\x61\x01
      اسم المستلم: ${order.recipient}\n
      الهاتف: ${order.phone}\n
      العنوان: ${order.address}\n
      المبلغ: ${order.cod}\n
      ------------------------------\n
      رقم الطلب: ${order.id}\n
      \x1D\x56\x41
    `;

    try {
      const res = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: escposCommands }),
      });
      if (!res.ok) throw new Error("فشل الاتصال بخادم الطباعة");
      toast({ title: 'تم الإرسال', description: 'تم إرسال الطلب للطابعة بنجاح.' });
    } catch (err) {
      console.error("فشل إرسال أوامر الطابعة:", err);
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر إرسال أوامر الطابعة.' });
    }
  };

  useImperativeHandle(ref, () => ({ handleExportPDF }));

  if (!context?.isHydrated || !template) {
    return <div><Skeleton className="h-[297mm] w-[210mm]" /></div>;
  }

  const displayOrders = orders.length > 0 ? orders : [
    {
      id: 'ORD-1719810001', recipient: 'محمد جاسم', merchant: 'تاجر أ', date: new Date().toISOString(),
      phone: '07701112233', address: 'الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3',
      cod: 35.5, referenceNumber: 'REF-00101',
      city: 'عمان', driver: 'علي', itemPrice: 33, deliveryFee: 2.5,
      notes: 'ملاحظة تجريبية للطباعة.', orderNumber: 1,
      region: 'الصويفية', source: 'Manual', status: 'جاري التوصيل', whatsapp: ''
    }
  ];

  return (
    <div>
      <div id="printable-area">
        {displayOrders.map((order, index) => (
          <React.Fragment key={order.id}>
            <div id={`policy-sheet-${order.id}`}>
              <Policy order={order} template={template} settings={context.settings} />
            </div>
            {index < displayOrders.length - 1 && <div className="page-break"></div>}
          </React.Fragment>
        ))}
      </div>
      {orders.length === 0 && (
        <div className="text-center mt-4 no-print flex gap-2 justify-center">
          <Button onClick={handleExportPDF}>
            <Icon name="Printer" className="ml-2 h-4 w-4 inline" />
            طباعة PDF
          </Button>
          <Button onClick={() => handleDirectPrintEscPos(displayOrders[0])}>
            <Icon name="Printer" className="ml-2 h-4 w-4 inline" />
            طباعة مباشرة (ESC/POS)
          </Button>
        </div>
      )}
    </div>
  );
});

PrintablePolicy.displayName = 'PrintablePolicy';
