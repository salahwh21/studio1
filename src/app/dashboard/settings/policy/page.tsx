'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  label_4x6: { width: 384, height: 576, label: 'Label (4x6 inch)' },
  label_4x4: { width: 384, height: 384, label: 'Label (4x4 inch)' },
};

type PaperSize = keyof typeof paperSizes;
const GRID_SIZE = 1;

// ----------------- Draggable & Resizable Item -----------------
const DraggableItem = React.forwardRef<HTMLElement, { element: PolicyElement; isSelected: boolean; onSelect: (id: string) => void; onResizeStop: (id: string, width: number, height: number) => void; isDragging: boolean }>(
  ({ element, isSelected, onSelect, onResizeStop, isDragging }, ref) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: element.id, data: { element } });

    const renderContent = () => {
      switch (element.type) {
        case 'text':
          return <div style={{ fontSize: element.fontSize, fontWeight: element.fontWeight }} className="w-full h-full overflow-hidden">{element.content || 'نص تجريبي'}</div>;
        case 'barcode':
          return <Icon name="Barcode" className="w-full h-full opacity-75" />;
        case 'image':
          return <Icon name="Image" className="w-full h-full opacity-75 text-muted-foreground" />;
        case 'rect':
          return <div className="w-full h-full border" style={{ borderColor: element.borderColor, borderWidth: element.borderWidth }} />;
      }
    };

    return (
      <Resizable
        size={{ width: element.width, height: element.height }}
        onResizeStop={(e, direction, ref, d) => onResizeStop(element.id, element.width + d.width, element.height + d.height)}
        grid={[GRID_SIZE, GRID_SIZE]}
        className={cn('absolute p-1 bg-transparent cursor-move', isSelected && !isDragging ? 'z-10 border-2 border-blue-600' : 'border border-transparent', isDragging && 'opacity-50')}
        style={{ left: element.x, top: element.y }}
        ref={setNodeRef as any}
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
const PolicyCanvas = ({ paperSize, elements, selectedElementId, onSelectElement, onElementResize, activeDragId }: { paperSize: PaperSize; elements: PolicyElement[]; selectedElementId: string | null; onSelectElement: (id: string | null) => void; onElementResize: (id: string, width: number, height: number) => void; activeDragId: string | null; }) => {
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
        <DraggableItem 
          key={el.id} 
          element={el} 
          isSelected={selectedElementId === el.id} 
          onSelect={onSelectElement} 
          onResizeStop={onElementResize}
          isDragging={activeDragId === el.id}
        />
      ))}
    </div>
  );
};


// ----------------- Toolbox & Properties -----------------
const ToolboxItem = ({ type, icon, label }: { type: ElementType; icon: any; label: string }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `toolbox-${type}`, data: { type } });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent hover:shadow-md cursor-grab transition-all">
      <Icon name={icon} className="h-6 w-6" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

const EditorControls = ({ selectedElement, onElementUpdate, onElementDelete }: { selectedElement: PolicyElement | null; onElementUpdate: (id: string, updates: Partial<PolicyElement>) => void; onElementDelete: (id: string) => void; }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card className="shadow-lg">
      <CardHeader><CardTitle className="text-base">الأدوات</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-4 gap-3">
        <ToolboxItem type="text" icon="Type" label="نص" />
        <ToolboxItem type="image" icon="Image" label="صورة/شعار" />
        <ToolboxItem type="barcode" icon="Barcode" label="باركود" />
        <ToolboxItem type="rect" icon="Square" label="مربع" />
      </CardContent>
    </Card>
    <Card className="shadow-lg">
      <CardHeader><CardTitle className="text-base">خصائص العنصر</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {!selectedElement ? (
          <p className="text-sm text-muted-foreground text-center py-8">حدد عنصراً لتعديل خصائصه</p>
        ) : (
          <>
            {selectedElement.type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="text-content">المحتوى</Label>
                <Input id="text-content" value={selectedElement.content} onChange={(e) => onElementUpdate(selectedElement.id, { content: e.target.value })} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
                {selectedElement.type === 'text' && (
                <div className="space-y-2">
                    <Label htmlFor="font-size">حجم الخط</Label>
                    <Input id="font-size" type="number" value={selectedElement.fontSize} onChange={(e) => onElementUpdate(selectedElement.id, { fontSize: parseInt(e.target.value) })} />
                </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="width">العرض</Label>
                    <Input id="width" type="number" value={selectedElement.width} onChange={(e) => onElementUpdate(selectedElement.id, { width: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="height">الارتفاع</Label>
                    <Input id="height" type="number" value={selectedElement.height} onChange={(e) => onElementUpdate(selectedElement.id, { height: parseInt(e.target.value) })} />
                </div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => onElementDelete(selectedElement.id)}>حذف العنصر</Button>
          </>
        )}
      </CardContent>
    </Card>
  </div>
);


// ----------------- Main Page -----------------
export default function PolicyEditorPage() {
  const [elements, setElements] = useState<PolicyElement[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<Active | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');

  const sensors = useSensors(useSensor(PointerSensor));
  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragItem(event.active);
    const isToolboxItem = String(event.active.id).startsWith('toolbox-');
    if (!isToolboxItem) {
        setSelectedElementId(event.active.id as string);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    if (over && over.id === 'canvas') {
        const isToolboxItem = String(active.id).startsWith('toolbox-');

        if (isToolboxItem) {
            const type = active.data.current?.type as ElementType;
            const canvasRect = document.querySelector('[data-droppable-id="canvas"]')?.getBoundingClientRect();
            if (!canvasRect || !active.rect.current.translated) return;
            
            const dropX = snapToGrid(active.rect.current.translated.left - canvasRect.left);
            const dropY = snapToGrid(active.rect.current.translated.top - canvasRect.top);

            const newElement: PolicyElement = {
                id: nanoid(),
                type,
                x: dropX,
                y: dropY,
                width: type === 'text' ? 150 : 100,
                height: type === 'text' ? 20 : 100,
                content: type === 'text' ? 'نص جديد' : '',
                fontSize: 14,
                fontWeight: 'normal',
                borderColor: type === 'rect' ? '#000000' : undefined,
                borderWidth: type === 'rect' ? 1 : undefined,
                opacity: 1
            };
            setElements(prev => [...prev, newElement]);
            setSelectedElementId(newElement.id);
        } else {
             setElements(prev => prev.map(el => {
                if (el.id === active.id) {
                    return { ...el, x: snapToGrid(el.x + delta.x), y: snapToGrid(el.y + delta.y) };
                }
                return el;
            }));
        }
    }
    setActiveDragItem(null);
  }, []);

  const handleElementUpdate = (id: string, updates: Partial<PolicyElement>) => {
      setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };
  
  const handleElementDelete = (id: string) => {
      setElements(prev => prev.filter(el => el.id !== id));
      setSelectedElementId(null);
  }

  const handleElementResize = (id: string, width: number, height: number) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, width: snapToGrid(width), height: snapToGrid(height) } : el));
  };

  const selectedElement = useMemo(() => elements.find(el => el.id === selectedElementId) || null, [elements, selectedElementId]);

  return (
    <div className="space-y-6 flex flex-col h-full" dir="rtl">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
            <div className="flex-none">
                 <div className="flex items-center gap-4 bg-card border p-3 rounded-lg shadow-md mb-4">
                    <Select value={paperSize} onValueChange={(val) => setPaperSize(val as PaperSize)}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                        {Object.entries(paperSizes).map(([key, val]) => (
                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => setElements([])}>مسح الكل</Button>
                    <Button>حفظ</Button>
                    <Button variant="secondary">معاينة</Button>
                </div>
                <EditorControls selectedElement={selectedElement} onElementUpdate={handleElementUpdate} onElementDelete={handleElementDelete} />
            </div>
            <div className="flex-grow bg-muted p-4 rounded-lg overflow-auto">
                 <PolicyCanvas 
                    paperSize={paperSize} 
                    elements={elements} 
                    selectedElementId={selectedElementId} 
                    onSelectElement={setSelectedElementId} 
                    onElementResize={handleElementResize} 
                    activeDragId={activeDragItem?.id as string | null}
                />
            </div>
            <DragOverlay>
                {activeDragItem && (
                     <div className="p-1 text-xs rounded-sm border bg-card shadow-lg opacity-75">
                       {activeDragItem.data.current?.element?.content || activeDragItem.data.current?.type || '...'}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    </div>
  );
}
