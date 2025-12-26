'use client';

import React from 'react';
import { SavedTemplate } from '@/contexts/SettingsContext';
import { ElementRenderer } from './element-renderer';

interface TemplatePreviewProps {
  template: SavedTemplate;
  mockData: any;
  scale?: number;
  className?: string;
}

export function TemplatePreview({ 
  template, 
  mockData, 
  scale = 0.3,
  className = '' 
}: TemplatePreviewProps) {
  const canvasWidth = template.paperSize === 'custom' 
    ? template.customDimensions?.width || 100 
    : template.paperSize === 'a4' ? 210 : 148;
  
  const canvasHeight = template.paperSize === 'custom' 
    ? template.customDimensions?.height || 150 
    : template.paperSize === 'a4' ? 297 : 210;

  // Convert mm to pixels and apply scale
  const canvasWidthPx = canvasWidth * 3.7795 * scale;
  const canvasHeightPx = canvasHeight * 3.7795 * scale;

  return (
    <div 
      className={`relative bg-white border border-gray-200 shadow-sm ${className}`}
      style={{
        width: `${canvasWidthPx}px`,
        height: `${canvasHeightPx}px`,
        backgroundImage: `radial-gradient(circle, #f3f4f6 1px, transparent 1px)`,
        backgroundSize: `${10 * scale}px ${10 * scale}px`,
      }}
    >
      {template.elements.map((element) => (
        <ElementRenderer
          key={element.id}
          element={element}
          mockData={mockData}
          zoom={scale * 100}
        />
      ))}
    </div>
  );
}