
'use client';

import React from 'react';
import type { Order } from '@/store/orders-store';
import type { SavedTemplate, PolicyElement } from '@/contexts/SettingsContext';
import Icon from './icon';
import Barcode from 'react-barcode';

const replacePlaceholders = (text: string, order: Order): string => {
    return text
        .replace(/\{\{recipient\}\}/g, order.recipient)
        .replace(/\{\{phone\}\}/g, order.phone)
        .replace(/\{\{address\}\}/g, order.address)
        .replace(/\{\{city\}\}/g, order.city)
        .replace(/\{\{cod\}\}/g, String(order.cod))
        .replace(/\{\{merchant\}\}/g, order.merchant)
        .replace(/\{\{date\}\}/g, order.date)
        .replace(/\{\{orderId\}\}/g, order.id)
        .replace(/\{\{notes\}\}/g, order.notes || '');
};

const renderElement = (element: PolicyElement, order: Order) => {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zIndex,
        borderColor: element.borderColor,
        borderWidth: `${element.borderWidth}px`,
        borderStyle: 'solid',
        overflow: 'hidden',
    };

    switch (element.type) {
        case 'text':
            return (
                <div style={{ ...style, color: element.color, fontSize: `${element.fontSize}px`, fontWeight: element.fontWeight, whiteSpace: 'nowrap' }}>
                    {replacePlaceholders(element.content, order)}
                </div>
            );
        case 'barcode':
            const barcodeValue = replacePlaceholders(element.content, order);
            return (
                <div style={style} className="flex items-center justify-center">
                    {barcodeValue && (
                        <Barcode
                            value={barcodeValue}
                            width={2}
                            height={element.height - 10}
                            displayValue={true}
                            fontSize={12}
                        />
                    )}
                </div>
            );
        case 'image':
            return (
                <div style={style}>
                    <Icon name="Image" className="w-full h-full text-muted-foreground p-2" />
                </div>
            );
        case 'shape':
            return (
                <div style={{ ...style, backgroundColor: element.backgroundColor, opacity: element.opacity }} />
            );
        default:
            return null;
    }
};

export const PrintablePolicyContent = ({ order, template }: { order: Order; template: SavedTemplate }) => {
    const { elements } = template;
    return (
        <div className="relative w-full h-full bg-white text-black">
            {elements.sort((a, b) => a.zIndex - b.zIndex).map(el => (
                <React.Fragment key={el.id}>
                    {renderElement(el, order)}
                </React.Fragment>
            ))}
        </div>
    );
};
