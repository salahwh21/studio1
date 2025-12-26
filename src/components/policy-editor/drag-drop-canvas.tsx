'use client';

import React, { useRef, useState, useCallback } from 'react';
import { PolicyElement } from '@/contexts/SettingsContext';

interface DragDropCanvasProps {
  elements: PolicyElement[];
  selectedElement: PolicyElement | null;
  onElementSelect: (element: PolicyElement | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<PolicyElement>) => void;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  showGrid: boolean;
  children: React.ReactNode;
  isDragging?: boolean;
  setIsDragging?: (dragging: boolean) => void;
  dragElement?: PolicyElement | null;
  setDragElement?: (element: PolicyElement | null) => void;
}

export function DragDropCanvas({
  elements,
  selectedElement,
  onElementSelect,
  onElementUpdate,
  canvasWidth,
  canvasHeight,
  zoom,
  showGrid,
  children,
  isDragging: externalIsDragging,
  setIsDragging: externalSetIsDragging,
  dragElement: externalDragElement,
  setDragElement: externalSetDragElement
}: DragDropCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [localIsDragging, setLocalIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [localDragElement, setLocalDragElement] = useState<PolicyElement | null>(null);

  // Use external state if provided, otherwise use local state
  const isDragging = externalIsDragging !== undefined ? externalIsDragging : localIsDragging;
  const setIsDragging = externalSetIsDragging || setLocalIsDragging;
  const dragElement = externalDragElement !== undefined ? externalDragElement : localDragElement;
  const setDragElement = externalSetDragElement || setLocalDragElement;

  const handleMouseDown = useCallback((e: React.MouseEvent, element: PolicyElement) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate offset in pixels, then convert to mm
    const offsetXPx = e.clientX - rect.left - (element.x * 3.7795 * (zoom / 100));
    const offsetYPx = e.clientY - rect.top - (element.y * 3.7795 * (zoom / 100));
    
    setDragOffset({ x: offsetXPx, y: offsetYPx });
    setDragElement(element);
    setIsDragging(true);
    onElementSelect(element);
  }, [zoom, onElementSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragElement) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate mouse position relative to canvas in pixels
    const mouseXPx = e.clientX - rect.left - dragOffset.x;
    const mouseYPx = e.clientY - rect.top - dragOffset.y;
    
    // Convert to mm (since elements use mm coordinates)
    const mouseXMm = mouseXPx / (3.7795 * (zoom / 100));
    const mouseYMm = mouseYPx / (3.7795 * (zoom / 100));
    
    // NO BOUNDS CHECKING - COMPLETE FREEDOM
    const newX = mouseXMm;
    const newY = mouseYMm;
    
    onElementUpdate(dragElement.id, { x: Math.round(newX), y: Math.round(newY) });
  }, [isDragging, dragElement, dragOffset, zoom, onElementUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragElement(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onElementSelect(null);
    }
  }, [onElementSelect]);

  return (
    <div
      ref={canvasRef}
      className="relative bg-white shadow-lg select-none border-2 border-gray-200 rounded-lg overflow-visible"
      style={{
        width: `${Math.max(800, canvasWidth * 3.7795 * (zoom / 100))}px`, // Minimum 800px width
        height: `${Math.max(600, canvasHeight * 3.7795 * (zoom / 100))}px`, // Minimum 600px height
        backgroundImage: showGrid 
          ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
          : undefined,
        backgroundSize: showGrid ? `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px` : undefined,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Canvas boundary indicator */}
      <div 
        className="absolute border-2 border-dashed border-blue-300 bg-blue-50 bg-opacity-20"
        style={{
          width: `${canvasWidth * 3.7795 * (zoom / 100)}px`,
          height: `${canvasHeight * 3.7795 * (zoom / 100)}px`,
          top: 0,
          left: 0,
        }}
      />
      
      {/* Canvas info overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
        منطقة الطباعة: {Math.round(canvasWidth)}×{Math.round(canvasHeight)} مم | {zoom}%
      </div>
      
      {/* Selection info */}
      {selectedElement && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
          محدد: {selectedElement.type === 'text' ? 'نص' : selectedElement.type === 'barcode' ? 'باركود' : selectedElement.type === 'image' ? 'صورة' : 'شكل'} | 
          {Math.round(selectedElement.width)}×{Math.round(selectedElement.height)} مم | 
          ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)}) مم
        </div>
      )}
      
      {/* Dragging info */}
      {isDragging && dragElement && (
        <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
          سحب: ({Math.round(dragElement.x)}, {Math.round(dragElement.y)}) مم - حرية كاملة!
        </div>
      )}
      
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onMouseDown: handleMouseDown,
            zoom,
            selectedElement,
          });
        }
        return child;
      })}
      
      {/* Canvas guidelines when dragging */}
      {isDragging && dragElement && (
        <>
          {/* Vertical guideline */}
          <div 
            className="absolute top-0 h-full w-px bg-blue-400 pointer-events-none opacity-60 z-40"
            style={{ left: `${dragElement.x * 3.7795 * (zoom / 100)}px` }}
          />
          {/* Horizontal guideline */}
          <div 
            className="absolute left-0 w-full h-px bg-blue-400 pointer-events-none opacity-60 z-40"
            style={{ top: `${dragElement.y * 3.7795 * (zoom / 100)}px` }}
          />
        </>
      )}
    </div>
  );
}