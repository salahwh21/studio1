'use client';

import React, { useState, useCallback } from 'react';
import { PolicyElement } from '@/contexts/SettingsContext';
import Barcode from 'react-barcode';

interface ElementRendererProps {
  element: PolicyElement;
  mockData: any;
  zoom?: number;
  selectedElement?: PolicyElement | null;
  onMouseDown?: (e: React.MouseEvent, element: PolicyElement) => void;
  onClick?: (element: PolicyElement) => void;
  onElementUpdate?: (elementId: string, updates: Partial<PolicyElement>) => void;
}

// مقابض التكبير والتصغير
const ResizeHandles = ({ 
  element, 
  zoom = 100, 
  onElementUpdate 
}: { 
  element: PolicyElement; 
  zoom: number; 
  onElementUpdate?: (elementId: string, updates: Partial<PolicyElement>) => void;
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState<string>('');

  const handleMouseDown = useCallback((e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;
    const startX_pos = element.x;
    const startY_pos = element.y;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / (3.7795 * (zoom / 100)); // Convert pixels to mm
      const deltaY = (e.clientY - startY) / (3.7795 * (zoom / 100)); // Convert pixels to mm

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startX_pos;
      let newY = startY_pos;

      switch (type) {
        case 'se': // جنوب شرق
          newWidth = Math.max(1, startWidth + deltaX);  // Minimum 1mm only
          newHeight = Math.max(1, startHeight + deltaY); // Minimum 1mm only
          break;
        case 'sw': // جنوب غرب
          newWidth = Math.max(1, startWidth - deltaX);
          newHeight = Math.max(1, startHeight + deltaY);
          newX = startX_pos + (startWidth - newWidth);
          break;
        case 'ne': // شمال شرق
          newWidth = Math.max(1, startWidth + deltaX);
          newHeight = Math.max(1, startHeight - deltaY);
          newY = startY_pos + (startHeight - newHeight);
          break;
        case 'nw': // شمال غرب
          newWidth = Math.max(1, startWidth - deltaX);
          newHeight = Math.max(1, startHeight - deltaY);
          newX = startX_pos + (startWidth - newWidth);
          newY = startY_pos + (startHeight - newHeight);
          break;
        case 'n': // شمال
          newHeight = Math.max(1, startHeight - deltaY);
          newY = startY_pos + (startHeight - newHeight);
          break;
        case 's': // جنوب
          newHeight = Math.max(1, startHeight + deltaY);
          break;
        case 'e': // شرق
          newWidth = Math.max(1, startWidth + deltaX);
          break;
        case 'w': // غرب
          newWidth = Math.max(1, startWidth - deltaX);
          newX = startX_pos + (startWidth - newWidth);
          break;
      }

      if (onElementUpdate) {
        onElementUpdate(element.id, {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeType('');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [element, zoom, onElementUpdate]);

  const handleStyle = {
    position: 'absolute' as const,
    width: `${Math.max(8, 8 * (zoom / 100))}px`,
    height: `${Math.max(8, 8 * (zoom / 100))}px`,
    backgroundColor: '#3b82f6',
    border: `${Math.max(1, 1 * (zoom / 100))}px solid #ffffff`,
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  const handleOffset = 4 * (zoom / 100);
  const handles = [
    { type: 'nw', style: { ...handleStyle, top: `${-handleOffset}px`, left: `${-handleOffset}px`, cursor: 'nw-resize' } },
    { type: 'n', style: { ...handleStyle, top: `${-handleOffset}px`, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { type: 'ne', style: { ...handleStyle, top: `${-handleOffset}px`, right: `${-handleOffset}px`, cursor: 'ne-resize' } },
    { type: 'e', style: { ...handleStyle, top: '50%', right: `${-handleOffset}px`, transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { type: 'se', style: { ...handleStyle, bottom: `${-handleOffset}px`, right: `${-handleOffset}px`, cursor: 'se-resize' } },
    { type: 's', style: { ...handleStyle, bottom: `${-handleOffset}px`, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { type: 'sw', style: { ...handleStyle, bottom: `${-handleOffset}px`, left: `${-handleOffset}px`, cursor: 'sw-resize' } },
    { type: 'w', style: { ...handleStyle, top: '50%', left: `${-handleOffset}px`, transform: 'translateY(-50%)', cursor: 'w-resize' } },
  ];

  return (
    <>
      {handles.map((handle) => (
        <div
          key={handle.type}
          style={handle.style}
          onMouseDown={(e) => handleMouseDown(e, handle.type)}
        />
      ))}
    </>
  );
};

export function ElementRenderer({
  element,
  mockData,
  zoom = 100,
  selectedElement,
  onMouseDown,
  onClick,
  onElementUpdate,
  isDragging,
  dragElement
}: ElementRendererProps & { isDragging?: boolean; dragElement?: PolicyElement | null }) {
  const processContent = (content: string) => {
    return content
      .replace(/\{\{orderId\}\}/g, mockData.id)
      .replace(/\{\{recipient\}\}/g, mockData.recipient)
      .replace(/\{\{phone\}\}/g, mockData.phone)
      .replace(/\{\{address\}\}/g, mockData.address)
      .replace(/\{\{city\}\}/g, mockData.city)
      .replace(/\{\{region\}\}/g, mockData.region)
      .replace(/\{\{cod\}\}/g, mockData.cod.toString())
      .replace(/\{\{currency\}\}/g, mockData.company_name ? 'ريال' : 'ريال') // Default currency
      .replace(/\{\{merchant\}\}/g, mockData.merchant)
      .replace(/\{\{date\}\}/g, mockData.date)
      .replace(/\{\{source\}\}/g, mockData.source || 'Manual')
      .replace(/\{\{notes\}\}/g, mockData.notes || '');
  };

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x * 3.7795 * (zoom / 100)}px`, // Convert mm to pixels properly
    top: `${element.y * 3.7795 * (zoom / 100)}px`,   // Convert mm to pixels properly
    width: `${element.width * 3.7795 * (zoom / 100)}px`,  // Convert mm to pixels properly
    height: `${element.height * 3.7795 * (zoom / 100)}px`, // Convert mm to pixels properly
    fontSize: `${element.fontSize * (zoom / 100)}px`,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textDecoration: element.textDecoration,
    color: element.color,
    backgroundColor: element.backgroundColor,
    border: `${Math.max(1, element.borderWidth * (zoom / 100))}px solid ${element.borderColor}`,
    borderRadius: `${element.borderRadius * (zoom / 100)}px`,
    opacity: element.opacity,
    textAlign: element.textAlign as any,
    zIndex: element.zIndex,
    cursor: isDragging && dragElement?.id === element.id ? 'grabbing' : selectedElement?.id === element.id ? 'move' : 'grab',
    transform: isDragging && dragElement?.id === element.id ? 'scale(1.05)' : 'scale(1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: `${Math.max(2, 4 * (zoom / 100))}px`,
    boxSizing: 'border-box',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    // حدود أوضح للعناصر
    boxShadow: selectedElement?.id === element.id 
      ? `0 0 0 ${Math.max(2, 3 * (zoom / 100))}px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.3)`
      : `0 0 0 ${Math.max(1, 1 * (zoom / 100))}px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)`,
  };

  // تحسين الرؤية للعناصر الصغيرة
  const elementWidthPx = element.width * 3.7795 * (zoom / 100);
  const elementHeightPx = element.height * 3.7795 * (zoom / 100);
  const isSmallElement = elementWidthPx < 60 || elementHeightPx < 30;
  
  if (isSmallElement) {
    baseStyle.minWidth = `${Math.max(elementWidthPx, 40)}px`;
    baseStyle.minHeight = `${Math.max(elementHeightPx, 20)}px`;
    baseStyle.fontSize = `${Math.max(element.fontSize * (zoom / 100), 10)}px`;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onMouseDown) {
      onMouseDown(e, element);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(element);
    }
  };

  switch (element.type) {
    case 'text':
      return (
        <div
          style={{
            ...baseStyle,
            position: 'relative',
          }}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          {processContent(element.content)}
          {selectedElement?.id === element.id && (
            <ResizeHandles element={element} zoom={zoom} onElementUpdate={onElementUpdate} />
          )}
        </div>
      );
    
    case 'barcode':
      return (
        <div
          style={{
            ...baseStyle,
            padding: `${Math.max(1, 2 * (zoom / 100))}px`,
            position: 'relative',
          }}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          <Barcode
            value={processContent(element.content)}
            width={Math.max(1, 1.5 * (zoom / 100))}
            height={Math.max(20, (element.height * 3.7795 - 10) * (zoom / 100))} // Convert mm to pixels
            fontSize={Math.max(8, element.fontSize * (zoom / 100))}
            margin={0}
          />
          {selectedElement?.id === element.id && (
            <ResizeHandles element={element} zoom={zoom} onElementUpdate={onElementUpdate} />
          )}
        </div>
      );
    
    case 'shape':
      return (
        <div
          style={{
            ...baseStyle,
            position: 'relative',
          }}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          {selectedElement?.id === element.id && (
            <ResizeHandles element={element} zoom={zoom} onElementUpdate={onElementUpdate} />
          )}
        </div>
      );
    
    case 'image':
      return (
        <div
          style={{
            ...baseStyle,
            backgroundImage: element.content ? `url(${element.content})` : undefined,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            position: 'relative',
          }}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          {!element.content && (
            <div className="w-full h-full flex items-center justify-center text-gray-400" 
                 style={{ fontSize: `${Math.max(10, 12 * (zoom / 100))}px` }}>
              صورة
            </div>
          )}
          {selectedElement?.id === element.id && (
            <ResizeHandles element={element} zoom={zoom} onElementUpdate={onElementUpdate} />
          )}
        </div>
      );
    
    default:
      return null;
  }
}