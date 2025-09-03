
'use client';

import React from 'react';
import type { Order } from '@/store/orders-store';
import type { SavedTemplate, PolicyElement } from '@/contexts/SettingsContext';
import Icon from './icon';
import Barcode from 'react-barcode';

// Helper function to replace placeholders like {recipient_name}
const replacePlaceholders = (text: string, order: Order, companyName: string): string => {
    if (!text) return '';
    return text
        .replace(/{order_id}/g, order.id)
        .replace(/{recipient_info}/g, `${order.recipient}\n${order.phone}\n${order.address}`)
        .replace(/{recipient_name}/g, order.recipient)
        .replace(/{recipient_phone}/g, order.phone)
        .replace(/{recipient_address}/g, order.address)
        .replace(/{cod_amount}/g, `${order.cod} JOD`)
        .replace(/{order_notes}/g, order.notes || 'لا توجد ملاحظات')
        .replace(/{reference_id}/g, order.referenceNumber || '')
        .replace(/{merchant_name}/g, order.merchant)
        .replace(/{company_name}/g, companyName);
};

const ElementRenderer = ({ el, order, settings }: { el: PolicyElement; order: Order; settings: any }) => {
    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${el.x}px`,
        top: `${el.y}px`,
        width: `${el.width}px`,
        height: `${el.height}px`,
        zIndex: el.zIndex,
        fontSize: el.fontSize ? `${el.fontSize}px` : '14px',
        fontWeight: el.fontWeight ?? 'normal',
        color: el.color ?? '#000000',
        borderColor: el.borderColor ?? '#000000',
        borderWidth: el.borderWidth ? `${el.borderWidth}px` : '0',
        borderStyle: 'solid',
        opacity: el.opacity ?? 1,
        backgroundColor: el.type === 'line' ? el.color : (el.backgroundColor ?? 'transparent'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4px',
        overflow: 'hidden',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    };

    switch (el.type) {
        case 'text':
            return <div style={baseStyle}>{replacePlaceholders(el.content, order, settings.login.companyName)}</div>;
        
        case 'image':
            let src = '';
            if (el.content === '{company_logo}') src = settings.login.policyLogo || settings.login.headerLogo || '';
            // Add logic for merchant logo if available
            
            if (!src) {
                // Return a placeholder div instead of an Icon to prevent SVG issues with html2canvas
                return <div style={{...baseStyle, borderStyle: 'dashed'}}>{/* Placeholder for image */}</div>;
            }
            return <div style={baseStyle}><img src={src} alt="logo" style={{ objectFit: 'contain', width: '100%', height: '100%' }} /></div>;

        case 'barcode':
            const barcodeValue = replacePlaceholders(el.content, order, settings.login.companyName);
            // Fallback to simple text rendering to avoid canvas/svg issues in PDF generation
            return <div style={{...baseStyle, fontSize: '10px'}}>{barcodeValue}</div>;
        
        case 'rect':
            return <div style={baseStyle}></div>;

        case 'line':
            return <div style={{ ...baseStyle, padding: 0 }}></div>;
            
        case 'table':
            const { headers = [], tableData = [], borderColor = '#000000', fontSize = 12, fontWeight = 'bold' } = el;
            return (
                <div style={{ ...baseStyle, display: 'block', padding: 0, alignItems: 'stretch', justifyContent: 'stretch' }}>
                    <table className="w-full h-full border-collapse" style={{fontSize: `${fontSize}px`}}>
                        <thead>
                            <tr style={{fontWeight: fontWeight}}>
                                {headers.map((header, i) => (
                                    <th key={i} className="border p-1 overflow-hidden" style={{borderColor}}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row) => (
                                <tr key={row.id}>
                                    {row.cells.map((cell) => (
                                        <td key={cell.id} className="border p-1" style={{borderColor}}>{cell.content}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )

        default:
            return null;
    }
};


const Policy = ({ order, template, settings }: { order: Order; template: SavedTemplate; settings: any }) => {
  if (!template) {
    return <div className="p-4 text-red-500">خطأ: لم يتم توفير قالب.</div>;
  }

  const { paperSize, customDimensions, margins, elements } = template;
  const dimensions = paperSize === 'custom' ? customDimensions : (paperSizeClasses[paperSize] || paperSizeClasses.custom);
  
  const mmToPx = (mm: number) => (mm / 25.4) * 96;

  const containerStyle: React.CSSProperties = {
    width: `${mmToPx(dimensions.width)}px`,
    height: `${mmToPx(dimensions.height)}px`,
    position: 'relative',
    backgroundColor: 'white',
    boxSizing: 'content-box',
    margin: 'auto',
  };

  const printableAreaStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${mmToPx(margins.top)}px`,
    left: `${mmToPx(margins.left)}px`,
    width: `${mmToPx(dimensions.width - margins.left - margins.right)}px`,
    height: `${mmToPx(dimensions.height - margins.top - margins.bottom)}px`,
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      <div style={printableAreaStyle}>
        {elements.sort((a,b) => a.zIndex - b.zIndex).map(el => (
          <ElementRenderer key={el.id} el={el} order={order} settings={settings} />
        ))}
      </div>
    </div>
  );
};

// Define paper sizes directly in this component as well to avoid circular dependencies
const paperSizeClasses: Record<string, { width: number; height: number; }> = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  label_4x6: { width: 101.6, height: 152.4 },
  label_4x4: { width: 101.6, height: 101.6 },
  custom: { width: 75, height: 45 },
};


export default Policy;
