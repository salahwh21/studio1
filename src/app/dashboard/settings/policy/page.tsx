
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

const MM_TO_PX = 3.7795;

const paperSizes = {
  a4: { width: 210 * MM_TO_PX, height: 297 * MM_TO_PX, label: 'A4 (210x297mm)' },
  a5: { width: 148 * MM_TO_PX, height: 210 * MM_TO_PX, label: 'A5 (148x210mm)' },
  label_4x6: { width: 101.6 * MM_TO_PX, height: 152.4 * MM_TO_PX, label: 'Label (4x6 inch)' },
  label_4x4: { width: 101.6 * MM_TO_PX, height: 101.6 * MM_TO_PX, label: 'Label (4x4 inch)' },
  custom: { width: 210 * MM_TO_PX, height: 297 * MM_TO_PX, label: 'حجم مخصص' },
};

type PaperSizeKey = keyof typeof paperSizes;
const GRID_SIZE = 1;

// ----------------- Draggable & Resizable Item -----------------
const DraggableItem = React.forwardRef<HTMLElement, { element: PolicyElement; isSelected: boolean; onSelect: (id: string) => void; onResizeStop: (id: string, width: number, height: number) => void; isDragging: boolean }>(
  ({ element, isSelected, onSelect, onResizeStop, isDragging }, ref) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: element.id, data: { element } });

    const style = {
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        visibility: isDragging ? 'hidden' : 'visible' as React.CSSProperties['visibility'],
    };
    
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
            className={cn('absolute p-1 bg-transparent group/item', isSelected ? 'border-2 border-blue-500 z-20' : 'border border-transparent hover:border-blue-300 z-10')}
            style={style}
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
const PolicyCanvas = ({ width, height, margins, elements, selectedElementId, onSelectElement, onElementResize, activeDragId }: { width: number, height: number, margins: {top: number, right: number, bottom: number, left: number}, elements: PolicyElement[]; selectedElementId: string | null; onSelectElement: (id: string | null) => void; onElementResize: (id: string, width: number, height: number) => void; activeDragId: string | null; }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div
      ref={setNodeRef}
      data-droppable-id="canvas"
      className={cn('relative bg-white rounded-lg shadow-inner overflow-hidden mx-auto transition-all', isOver ? 'outline outline-2 outline-offset-2 outline-primary' : '')}
      style={{ width, height }}
      onClick={() => onSelectElement(null)}
    >
      <div 
        className="absolute inset-0 pointer-events-none border-2 border-dashed border-gray-300" 
        style={{
            top: margins.top,
            right: margins.right,
            bottom: margins.bottom,
            left: margins.left
        }}
      />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-lg lg:col-span-1">
            <CardHeader><CardTitle className="text-base">الأدوات</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-4 gap-3">
                <ToolboxItem type="text" icon="Type" label="نص" />
                <ToolboxItem type="image" icon="Image" label="صورة/شعار" />
                <ToolboxItem type="barcode" icon="Barcode" label="باركود" />
                <ToolboxItem type="rect" icon="Square" label="مربع" />
            </CardContent>
        </Card>
        <Card className="shadow-lg lg:col-span-2">
            <CardHeader><CardTitle className="text-base">خصائص العنصر</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {!selectedElement ? (
                    <p className="text-sm text-muted-foreground text-center py-8">حدد عنصراً لتعديل خصائصه</p>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end'>
                         {selectedElement.type === 'text' && (
                            <>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="text-content">المحتوى</Label>
                                    <Input id="text-content" value={selectedElement.content} onChange={(e) => onElementUpdate(selectedElement.id, { content: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="font-size">حجم الخط</Label>
                                    <Input id="font-size" type="number" value={selectedElement.fontSize} onChange={(e) => onElementUpdate(selectedElement.id, { fontSize: parseInt(e.target.value) })} />
                                </div>
                            </>
                         )}
                        <div className="space-y-2">
                            <Label htmlFor="pos-x">X</Label>
                            <Input id="pos-x" type="number" value={Math.round(selectedElement.x)} onChange={(e) => onElementUpdate(selectedElement.id, { x: parseInt(e.target.value) })} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="pos-y">Y</Label>
                            <Input id="pos-y" type="number" value={Math.round(selectedElement.y)} onChange={(e) => onElementUpdate(selectedElement.id, { y: parseInt(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="width">العرض</Label>
                            <Input id="width" type="number" value={selectedElement.width} onChange={(e) => onElementUpdate(selectedElement.id, { width: parseInt(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">الارتفاع</Label>
                            <Input id="height" type="number" value={selectedElement.height} onChange={(e) => onElementUpdate(selectedElement.id, { height: parseInt(e.target.value) })} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => {}}>تكرار</Button>
                            <Button variant="destructive" size="sm" onClick={() => onElementDelete(selectedElement.id)}>حذف</Button>
                        </div>
                    </div>
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
  const [paperSizeKey, setPaperSizeKey] = useState<PaperSizeKey>('a4');
  
  const [customDimensions, setCustomDimensions] = useState({
      width: 210, height: 297, marginTop: 10, marginRight: 10, marginBottom: 10, marginLeft: 10
  });

  const sensors = useSensors(useSensor(PointerSensor));
  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;
  
  const paperDimensions = useMemo(() => {
    if (paperSizeKey === 'custom') {
        return {
            width: customDimensions.width * MM_TO_PX,
            height: customDimensions.height * MM_TO_PX,
        }
    }
    return paperSizes[paperSizeKey];
  }, [paperSizeKey, customDimensions]);

  const paperMargins = useMemo(() => ({
    top: customDimensions.marginTop * MM_TO_PX,
    right: customDimensions.marginRight * MM_TO_PX,
    bottom: customDimensions.marginBottom * MM_TO_PX,
    left: customDimensions.marginLeft * MM_TO_PX,
  }), [customDimensions]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragItem(event.active);
    const isToolboxItem = String(event.active.id).startsWith('toolbox-');
    if (!isToolboxItem) {
        setSelectedElementId(event.active.id as string);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveDragItem(null);
    if (!over) return;
    
    // Dropping a toolbox item onto the canvas
    if (String(active.id).startsWith('toolbox-') && over.id === 'canvas') {
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
    } 
    // Moving an existing item on the canvas
    else if (!String(active.id).startsWith('toolbox-')) {
         setElements(prev => prev.map(el => {
            if (el.id === active.id) {
                return { ...el, x: snapToGrid(el.x + delta.x), y: snapToGrid(el.y + delta.y) };
            }
            return el;
        }));
    }
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
    <div className="space-y-6 flex flex-col h-[calc(100vh-10rem)]" dir="rtl">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
            <div className="flex-none space-y-4">
                 <div className="flex flex-wrap items-center gap-4 bg-card border p-3 rounded-lg shadow-md">
                    <Select value={paperSizeKey} onValueChange={(val) => setPaperSizeKey(val as PaperSizeKey)}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                        {Object.entries(paperSizes).map(([key, val]) => (
                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>

                     {paperSizeKey === 'custom' && (
                        <div className="flex flex-wrap items-center gap-2 border-l pl-4">
                            <h4 className="font-bold text-sm ml-2">الأبعاد (mm):</h4>
                            <Input type="number" value={customDimensions.width} onChange={e => setCustomDimensions(d => ({...d, width: Number(e.target.value)}))} className="w-20 h-9" placeholder="العرض" />
                            <Input type="number" value={customDimensions.height} onChange={e => setCustomDimensions(d => ({...d, height: Number(e.target.value)}))} className="w-20 h-9" placeholder="الارتفاع" />
                             <h4 className="font-bold text-sm ml-2 mr-4">الهوامش (mm):</h4>
                            <Input type="number" value={customDimensions.marginTop} onChange={e => setCustomDimensions(d => ({...d, marginTop: Number(e.target.value)}))} className="w-20 h-9" placeholder="أعلى" />
                            <Input type="number" value={customDimensions.marginLeft} onChange={e => setCustomDimensions(d => ({...d, marginLeft: Number(e.target.value)}))} className="w-20 h-9" placeholder="يسار" />
                        </div>
                    )}

                    <div className="flex-grow"></div>
                    <Button variant="outline" onClick={() => setElements([])}>مسح الكل</Button>
                    <Button>حفظ</Button>
                    <Button variant="secondary">معاينة</Button>
                </div>
                <EditorControls selectedElement={selectedElement} onElementUpdate={handleElementUpdate} onElementDelete={handleElementDelete} />
            </div>
            <main className="flex-grow bg-muted p-4 rounded-lg overflow-auto">
                 <PolicyCanvas 
                    width={paperDimensions.width} 
                    height={paperDimensions.height} 
                    margins={paperMargins}
                    elements={elements} 
                    selectedElementId={selectedElementId} 
                    onSelectElement={setSelectedElementId} 
                    onElementResize={handleElementResize} 
                    activeDragId={activeDragItem?.id as string | null}
                />
            </main>
            <DragOverlay>
                {activeDragItem && activeDragItem.data.current?.element && (
                    <div className="p-1 text-xs rounded-sm border bg-card shadow-lg opacity-75">
                       {activeDragItem.data.current.element.content || `أداة: ${activeDragItem.data.current.element.type}` || '...'}
                    </div>
                )}
                 {activeDragItem && activeDragItem.data.current?.type && (
                     <div className="p-2 text-xs rounded-lg border bg-card shadow-lg opacity-75">
                         أداة: {activeDragItem.data.current?.type}
                     </div>
                 )}
            </DragOverlay>
        </DndContext>
    </div>
  );
}
