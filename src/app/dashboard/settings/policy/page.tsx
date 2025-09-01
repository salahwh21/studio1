'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  Active,
  DragStartEvent,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { nanoid } from 'nanoid';
import { Resizable } from 're-resizable';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';

// Types for Editor Elements
type ElementType = 'text' | 'image' | 'barcode' | 'rect';
export type PolicyElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
};

const paperSizes = {
  a4: { width: 794, height: 1123, label: 'A4 (210x297mm)' },
  a5: { width: 559, height: 794, label: 'A5 (148x210mm)' },
  a6: { width: 420, height: 594, label: 'A6 (105x148mm)' },
  label_4x6: { width: 384, height: 576, label: 'Label (4x6 inch)' },
  label_4x4: { width: 384, height: 384, label: 'Label (4x4 inch)' },
  label_2x4: { width: 192, height: 384, label: 'Label (2x4 inch)' },
};

type PaperSize = keyof typeof paperSizes;
const GRID_SIZE = 10; // Snap to grid

// ----------------- Draggable & Resizable Item -----------------
const DraggableItem = React.forwardRef<HTMLElement, { element: PolicyElement; isSelected: boolean; onSelect: (id: string) => void; onResize?: (id: string, width: number, height: number) => void }>(
  ({ element, isSelected, onSelect, onResize }, ref) => {
    const { attributes, listeners, setNodeToDrag } = useDraggable({ id: element.id, data: { element } });

    const renderContent = () => {
      switch (element.type) {
        case 'text':
          return <div style={{ fontSize: element.fontSize, fontWeight: element.fontWeight, color: element.borderColor, opacity: element.opacity }} className="w-full h-full overflow-hidden">{element.content || 'نص تجريبي'}</div>;
        case 'barcode':
          return <Icon name="Barcode" className="w-full h-full opacity-75" />;
        case 'image':
          return <Icon name="Image" className="w-full h-full opacity-75 text-muted-foreground" />;
        case 'rect':
          return <div className="w-full h-full border-dashed" style={{ borderColor: element.borderColor, borderWidth: element.borderWidth }} />;
      }
    };

    return (
      <Resizable
        size={{ width: element.width, height: element.height }}
        onResizeStop={(e, direction, ref) => onResize && onResize(element.id, ref.offsetWidth, ref.offsetHeight)}
        grid={[GRID_SIZE, GRID_SIZE]}
        className={cn('absolute p-1 bg-transparent cursor-move', isSelected ? 'z-10 border-2 border-blue-600' : 'border border-transparent')}
        style={{ left: element.x, top: element.y }}
        {...listeners}
        {...attributes}
        onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
      >
        {renderContent()}
      </Resizable>
    );
  }
);
DraggableItem.displayName = 'DraggableItem';

// ----------------- Canvas -----------------
const PolicyCanvas = ({ paperSize, elements, onSelectElement, selectedElementId, onElementResize }: { paperSize: PaperSize; elements: PolicyElement[]; onSelectElement: (id: string | null) => void; selectedElementId: string | null; onElementResize: (id: string, width: number, height: number) => void }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
  return (
    <div
      ref={setNodeRef}
      data-droppable-id="canvas"
      className={cn('relative bg-white rounded-lg shadow-inner overflow-hidden mx-auto transition-all', isOver ? 'outline outline-2 outline-offset-2 outline-primary' : '')}
      style={{ width: paperSizes[paperSize].width, height: paperSizes[paperSize].height }}
      onClick={() => onSelectElement(null)}
    >
      {elements.map(el => (
        <DraggableItem key={el.id} element={el} isSelected={selectedElementId === el.id} onSelect={onSelectElement} onResize={onElementResize} />
      ))}
    </div>
  );
};

// ----------------- Toolbox -----------------
const ToolboxItem = ({ type, icon, label }: { type: ElementType; icon: any; label: string }) => {
  const { attributes, listeners, setNodeToDrag } = useDraggable({ id: `toolbox-${type}`, data: { type } });
  return (
    <div ref={setNodeToDrag} {...listeners} {...attributes} className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent hover:shadow-md cursor-grab transition-all">
      <Icon name={icon} className="h-6 w-6" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

const Toolbox = () => (
  <Card className="shadow-lg">
    <CardHeader><CardTitle className="text-base">الأدوات</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-3">
      <ToolboxItem type="text" icon="Type" label="نص" />
      <ToolboxItem type="image" icon="Image" label="صورة/شعار" />
      <ToolboxItem type="barcode" icon="Barcode" label="باركود" />
      <ToolboxItem type="rect" icon="Square" label="مربع" />
    </CardContent>
  </Card>
);

// ----------------- Main Page -----------------
export default function PolicyEditorPage() {
  const { toast } = useToast();
  const [elements, setElements] = useState<PolicyElement[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<Active | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const { settings, updatePolicySetting } = useSettings();
  const paperSize = settings.policy.paperSize;

  const sensors = useSensors(useSensor(PointerSensor));
  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const handleDragStart = useCallback((event: DragStartEvent) => setActiveDragItem(event.active), []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveDragItem(null);
    if (!over || over.id !== 'canvas') return;

    const isToolboxItem = String(active.id).startsWith('toolbox-');
    const canvasRect = document.querySelector('[data-droppable-id="canvas"]')?.getBoundingClientRect();
    if (!canvasRect) return;

    if (isToolboxItem) {
      const type = active.data.current?.type as ElementType;
      const dropX = snapToGrid(active.rect.current.translated!.left - canvasRect.left);
      const dropY = snapToGrid(active.rect.current.translated!.top - canvasRect.top);

      const newElement: PolicyElement = {
        id: nanoid(), type, x: dropX, y: dropY,
        width: type === 'text' ? 150 : 100, height: type === 'text' ? 20 : 100,
        content: type === 'text' ? 'نص جديد' : '', fontSize: 14, fontWeight: 'normal',
        borderColor: type === 'rect' ? 'gray' : undefined, borderWidth: type === 'rect' ? 2 : undefined, opacity: 1
      };
      setElements(prev => [...prev, newElement]);
      setSelectedElementId(newElement.id);
      return;
    }

    const activeElementId = active.id.toString();
    setElements(prev => prev.map(el => el.id === activeElementId ? { ...el, x: snapToGrid(el.x + delta.x), y: snapToGrid(el.y + delta.y) } : el));
  }, []);

  const handleElementResize = (id: string, width: number, height: number) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, width: snapToGrid(width), height: snapToGrid(height) } : el));
  };

  const selectedElement = useMemo(() => elements.find(el => el.id === selectedElementId) || null, [elements, selectedElementId]);

  return (
    <div className="space-y-6" dir="rtl">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
          <Toolbox />
          <PolicyCanvas paperSize={paperSize} elements={elements} selectedElementId={selectedElementId} onSelectElement={setSelectedElementId} onElementResize={handleElementResize} />
        </div>
        <DragOverlay>{activeDragItem && String(activeDragItem.id).startsWith('toolbox-') && <div className="p-3 rounded-lg border bg-card shadow-lg flex flex-col items-center gap-2 opacity-75"><Icon name={activeDragItem.data.current?.type === 'text' ? 'Type' : (activeDragItem.data.current?.type === 'image' ? 'Image' : (activeDragItem.data.current?.type === 'barcode' ? 'Barcode' : 'Square'))} className="h-6 w-6" /><span className="text-xs font-medium">{activeDragItem.data.current?.type}</span></div>}</DragOverlay>
      </DndContext>
    </div>
  );
}
