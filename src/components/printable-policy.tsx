
'use client';

import React, { useRef, useImperativeHandle, forwardRef, useContext } from 'react';
import type { Order } from '@/store/orders-store';
import { useSettings, type PolicySettings, type PolicyElement, SettingsContext, SavedTemplate } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import Barcode from 'react-barcode';
import Icon from './icon';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

// -------------------------------
// Paper Size Definitions
// -------------------------------
const paperSizeClasses = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  label_4x6: { width: 101.6, height: 152.4 },
  label_4x4: { width: 101.6, height: 101.6 },
  custom: { width: 75, height: 45 },
};

// -------------------------------
// General Helper Functions
// -------------------------------
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const mmToDots = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);

const canvasToMonoBitmap = (canvas: HTMLCanvasElement, useDither = false) => {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;

  const rowBytes = Math.ceil(width / 8);
  const out = new Uint8Array(rowBytes * height);
  const errBuf = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const val = clamp(lum + errBuf[y * width + x], 0, 255);
      const newVal = (useDither ? (val < 128 ? 0 : 255) : (lum < 200 ? 0 : 255));
      const err = val - newVal;

      if (useDither) {
        if (x + 1 < width) errBuf[y * width + (x + 1)] += err * (7 / 16);
        if (y + 1 < height) {
          if (x > 0) errBuf[(y + 1) * width + (x - 1)] += err * (3 / 16);
          errBuf[(y + 1) * width + x] += err * (5 / 16);
          if (x + 1 < width) errBuf[(y + 1) * width + (x + 1)] += err * (1 / 16);
        }
      }

      const byteIndex = y * rowBytes + (x >> 3);
      const bit = 7 - (x & 7);
      if (newVal === 0) {
        out[byteIndex] |= (1 << bit);
      }
    }
  }

  return { data: out, width, height, rowBytes };
};

// -------------------------------
// ZPL (Zebra) Generation
// -------------------------------
const monoToZPL_GFA = (mono: { data: Uint8Array; width: number; height: number; rowBytes: number }) => {
  const { data, width, height, rowBytes } = mono;
  const totalBytes = data.length;
  const tttt = totalBytes.toString();
  const rrrr = height.toString();
  const bbbb = rowBytes.toString();

  let hex = '';
  const hexChars = '0123456789ABCDEF';
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    hex += hexChars[v >> 4] + hexChars[v & 0x0f];
  }

  const zpl = `^XA
^PW${width}
^LH0,0
^FO0,0
^GFA,${tttt},${tttt},${rowBytes},${hex}
^XZ`;
  return zpl;
};

// -------------------------------
// ESC/POS (Epson) Generation
// -------------------------------
const monoToESCPOS_Raster = (mono: { data: Uint8Array; width: number; height: number; rowBytes: number }) => {
  const { data, width, height, rowBytes } = mono;

  const header = [0x1D, 0x76, 0x30, 0x00];
  const xL = rowBytes & 0xFF;
  const xH = (rowBytes >> 8) & 0xFF;
  const yL = height & 0xFF;
  const yH = (height >> 8) & 0xFF;

  const out = new Uint8Array(header.length + 4 + data.length + 2);
  out.set(header, 0);
  out[4] = xL; out[5] = xH; out[6] = yL; out[7] = yH;
  out.set(data, 8);
  out[out.length - 2] = 0x1D; 
  out[out.length - 1] = 0x56; 
  return out;
};


// -------------------------------
// Helper to download a file
// -------------------------------
const downloadFile = (data: BlobPart, filename: string, mime = 'application/octet-stream') => {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
};


// -------------------------------
// Variable replacement in content
// -------------------------------
const resolveContent = (content: string, order: Order, settings: any): string => {
  if (!content) return '';
  const { formatCurrency, settings: appSettings } = settings;
  const loginSettings = appSettings.login;

  return content
    .replace(/{order_id}/g, order.id)
    .replace(/{reference_id}/g, order.referenceNumber || '')
    .replace(/{recipient_name}/g, order.recipient)
    .replace(/{recipient_phone}/g, order.phone)
    .replace(/{recipient_address}/g, `${order.address}, ${order.city}`)
    .replace(/{recipient_info}/g, `${order.recipient}\n${order.phone}\n${order.address}, ${order.city}`)
    .replace(/{cod_amount}/g, formatCurrency(order.cod))
    .replace(/{order_notes}/g, order.notes || '')
    .replace(/{order_items}/g, 'Item 1, Item 2')
    .replace(/{items_count}/g, '3')
    .replace(/{merchant_name}/g, order.merchant)
    .replace(/{merchant_phone}/g, '0780123456')
    .replace(/{merchant_address}/g, 'Amman, Jordan')
    .replace(/{company_name}/g, loginSettings.companyName || '');
};

// -------------------------------
// Element rendering component
// -------------------------------
const RenderedElement = ({ el, order, settings }: { el: any, order: Order, settings: any }) => {
  const loginSettings = settings.settings.login;
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${el.x}px`,
    top: `${el.y}px`,
    width: `${el.width}px`,
    height: `${el.height}px`,
    zIndex: el.zIndex,
    fontSize: `${el.fontSize ?? 14}px`,
    fontWeight: el.fontWeight ?? 'normal',
    color: el.type === 'line' ? 'transparent' : (el.color ?? '#000000'),
    borderWidth: el.borderWidth ? `${el.borderWidth}px` : 0,
    borderColor: el.borderColor ?? 'transparent',
    borderStyle: 'solid',
    opacity: el.opacity ?? 1,
    backgroundColor: el.type === 'line' ? (el.color ?? '#000000') : (el.backgroundColor ?? 'transparent'),
    textAlign: 'center',
    padding: '4px',
    wordBreak: 'break-word',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
  };

  const content = resolveContent(el.content, order, settings);

  if (el.type === 'text') return <div style={baseStyle}>{content}</div>;
  if (el.type === 'line') return <div style={{ ...baseStyle, padding: 0 }}></div>;
  if (el.type === 'rect') return <div style={baseStyle}></div>;
  if (el.type === 'image') {
    let imageUrl: string | null = null;
    if (el.content.includes('{company_logo}')) imageUrl = loginSettings.policyLogo;
    if (el.content.includes('{merchant_logo}')) imageUrl = null;

    return (
      <div style={baseStyle}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Logo"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-xs" />
        )}
      </div>
    );
  }
  if (el.type === 'barcode') {
    const barcodeValue = resolveContent(el.content, order, settings);
    return (
      <div style={{ ...baseStyle, backgroundColor: '#ffffff' }}>
        <Barcode renderer="canvas" value={barcodeValue} height={el.height - 10} width={1.5} displayValue={false} margin={0} />
      </div>
    );
  }
  if (el.type === 'table') {
    const { headers = [], tableData = [], borderColor = '#000000', fontSize = 12, fontWeight = 'bold' } = el;
    return (
      <div style={{ ...baseStyle, display: 'block', padding: 0, alignItems: 'stretch', justifyContent: 'stretch' }}>
        <table className="w-full h-full border-collapse" style={{ fontSize: `${fontSize}px`, tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ fontWeight: fontWeight }}>
              {headers.map((header: string, i: number) => (
                <th key={i} className="border p-1 overflow-hidden" style={{ borderColor, wordBreak: 'break-word' }}>
                  {resolveContent(header, order, settings)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row: any) => (
              <tr key={row.id}>
                {row.cells.map((cell: any) => (
                  <td key={cell.id} className="border p-1" style={{ borderColor, wordBreak: 'break-word' }}>
                    {resolveContent(cell.content, order, settings)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};

// -------------------------------
// Policy page rendering component
// -------------------------------
const Policy: React.FC<{ order: Order; template: SavedTemplate; }> = ({ order, template }) => {
  const context = useContext(SettingsContext);
  if (!context) return null;

  const paperSizeKey = template.paperSize || 'custom';
  const customDimensions = template.customDimensions || { width: 75, height: 45 };

  const paperDimensions = {
    width: paperSizeKey === 'custom' ? customDimensions.width : paperSizeClasses[paperSizeKey].width,
    height: paperSizeKey === 'custom' ? customDimensions.height : paperSizeClasses[paperSizeKey].height,
  };

  const style = {
    width: `${paperDimensions.width}mm`,
    height: `${paperDimensions.height}mm`,
    padding: 0,
  };

  return (
    <div className="policy-sheet relative font-sans text-black bg-white shadow-lg mx-auto" style={style}>
      {(template.elements || []).sort((a, b) => a.zIndex - b.zIndex).map((el: any) => (
        <RenderedElement key={el.id} el={el} order={order} settings={context} />
      ))}
    </div>
  );
};

// -------------------------------
// Main PrintablePolicy Component with Direct Print Logic
// -------------------------------
export const PrintablePolicy = forwardRef<
  { handleExportPDF: () => void },
  { orders: Order[], template: SavedTemplate | null, onExport?: () => void }
>(({ orders, template, onExport }, ref) => {
  const context = useSettings();
  const { toast } = useToast();

  const handleExportPDF = async () => {
    try {
      if (!template) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار قالب للطباعة أولاً.' });
        return;
      }

      const printerDPI = (template as any)?.dpi || 203;

      const displayOrders = orders.length > 0 ? orders : [{
        id: 'ORD-1719810001', recipient: 'محمد جاسم', merchant: 'تاجر أ', date: new Date().toISOString(),
        phone: '07701112233', address: 'الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3',
        cod: 35.5, referenceNumber: 'REF-00101',
        city: 'عمان', driver: 'علي', itemPrice: 33, deliveryFee: 2.5, notes: 'ملاحظة تجريبية للطباعة.', orderNumber: 1, region: 'الصويفية', source: 'Manual', status: 'جاري التوصيل', whatsapp: ''
      }];

      const paperSizeKey = template.paperSize || 'custom';
      const customDimensions = template.customDimensions || { width: 0, height: 0 };
      const paperDimensionsMM = {
        width: paperSizeKey === 'custom' ? customDimensions.width : paperSizeClasses[paperSizeKey].width,
        height: paperSizeKey === 'custom' ? customDimensions.height : paperSizeClasses[paperSizeKey].height,
      };

      let isZebra = true;

      const escposJobChunks: Uint8Array[] = [];
      const zplJobStrings: string[] = [];

      for (let i = 0; i < displayOrders.length; i++) {
        const order = displayOrders[i];
        const elId = `policy-sheet-${order.id}`;
        const policyHtmlElement = document.getElementById(elId) as HTMLElement | null;
        if (!policyHtmlElement) {
          console.error(`Could not find policy sheet for order ${order.id}`);
          continue;
        }

        const scale = paperDimensionsMM.width <= 110 ? 3 : 2;
        const canvas = await html2canvas(policyHtmlElement, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF'
        });

        const targetWidthDots = mmToDots(paperDimensionsMM.width, printerDPI);
        const targetHeightDots = mmToDots(paperDimensionsMM.height, printerDPI);

        const outCanvas = document.createElement('canvas');
        outCanvas.width = targetWidthDots;
        outCanvas.height = targetHeightDots;
        const outCtx = outCanvas.getContext('2d')!;
        outCtx.fillStyle = '#FFFFFF';
        outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
        outCtx.drawImage(canvas, 0, 0, outCanvas.width, outCanvas.height);

        const mono = canvasToMonoBitmap(outCanvas, true);

        zplJobStrings.push(monoToZPL_GFA(mono));
        escposJobChunks.push(monoToESCPOS_Raster(mono));
      }

      let sent = false;
      if ('usb' in navigator && typeof (navigator as any).usb.requestDevice === 'function') {
        try {
          const device = await (navigator as any).usb.requestDevice({
            filters: [{ classCode: 0x07 }, { vendorId: 0x0A5F }, { vendorId: 0x04B8 }]
          });
          const prodName = (device.productName || '').toLowerCase();
          if (prodName.includes('epson')) isZebra = false;
          else if (prodName.includes('zebra')) isZebra = true;
          
          await device.open();
          if (device.configuration == null) await device.selectConfiguration(1);

          let claimed = false;
          let outEndpoint = 1;
          for (const iface of device.configuration.interfaces) {
            for (const alt of iface.alternates) {
              const hasOut = alt.endpoints.some((ep: any) => ep.direction === 'out');
              if (hasOut) {
                await device.claimInterface(iface.interfaceNumber);
                outEndpoint = alt.endpoints.find((ep: any) => ep.direction === 'out').endpointNumber;
                claimed = true;
                break;
              }
            }
            if (claimed) break;
          }
          if (!claimed) throw new Error('لم يتم العثور على منفذ USB OUT للطابعة.');

          if (isZebra) {
            const encoder = new TextEncoder();
            for (const pageZPL of zplJobStrings) {
              const bytes = encoder.encode(pageZPL + '\n');
              await device.transferOut(outEndpoint, bytes);
            }
          } else {
            for (const chunk of escposJobChunks) {
              await device.transferOut(outEndpoint, chunk);
            }
          }
          sent = true;
          toast({ title: 'تمت الطباعة', description: isZebra ? 'طابعة Zebra (ZPL)' : 'طابعة Epson (ESC/POS)' });
        } catch (e: any) {
           if (e.name !== 'NotFoundError') {
             console.warn('USB print failed, fallback to Download', e);
             toast({ variant: 'destructive', title: 'فشل طباعة USB', description: e.message });
           }
        }
      }

      if (!sent) {
        if (isZebra) {
          const joined = zplJobStrings.join('\n');
          downloadFile(joined, 'labels.zpl', 'text/plain');
          toast({ title: 'تم التحضير', description: 'تم تنزيل ملف ZPL للطباعة اليدوية.' });
        } else {
          let total = 0;
          for (const c of escposJobChunks) total += c.length;
          const all = new Uint8Array(total);
          let off = 0;
          for (const c of escposJobChunks) { all.set(c, off); off += c.length; }
          downloadFile(all, 'labels.bin', 'application/octet-stream');
          toast({ title: 'تم التحضير', description: 'تم تنزيل ملف ESC/POS للطباعة اليدوية.' });
        }
      }

      if (onExport) onExport();
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'خطأ في الطباعة', description: e.message || 'تعذر تنفيذ الطباعة.' });
    }
  };


  useImperativeHandle(ref, () => ({
    handleExportPDF,
  }));

  if (!context?.isHydrated || !template) {
    return <div><Skeleton className="h-[297mm] w-[210mm]" /></div>;
  }

  const displayOrders = orders.length > 0 ? orders : [{
    id: 'ORD-1719810001', recipient: 'محمد جاسم', merchant: 'تاجر أ', date: new Date().toISOString(),
    phone: '07701112233', address: 'الصويفية, عمان, شارع الوكالات, بناية 15, الطابق 3',
    cod: 35.5, referenceNumber: 'REF-00101',
    city: 'عمان', driver: 'علي', itemPrice: 33, deliveryFee: 2.5, notes: 'ملاحظة تجريبية للطباعة.', orderNumber: 1, region: 'الصويفية', source: 'Manual', status: 'جاري التوصيل', whatsapp: ''
  }];

  return (
    <div>
      <div id="printable-area">
        {displayOrders.map((order, index) => (
          <React.Fragment key={order.id}>
            <div id={`policy-sheet-${order.id}`}>
              <Policy order={order} template={template} />
            </div>
            {index < displayOrders.length - 1 && <div className="page-break"></div>}
          </React.Fragment>
        ))}
      </div>
      {orders.length === 0 && (
        <div className="text-center mt-4 no-print flex gap-2 justify-center">
          <Button onClick={handleExportPDF}>
            <Icon name="Printer" className="ml-2 h-4 w-4 inline" />
            طباعة معاينة
          </Button>
        </div>
      )}
    </div>
  );
});

PrintablePolicy.displayName = 'PrintablePolicy';

