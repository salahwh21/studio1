
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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types for Editor Elements
type ElementType = 'text' | 'image' | 'barcode' | 'rect';
type PolicyElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
};

const paperSizes = {
  a4: { width: 794, height: 1123, label: 'A4 (210x297mm)' },
  a5: { width: 559, height: 794, label: 'A5 (148x210mm)' },
  label_4x6: { width: 384, height: 576, label: 'Label (4x6 inch)' },
  label_4x4: { width: 384, height: 384, label: 'Label (4x4 inch)' },
};
type PaperSize = keyof typeof paperSizes;

// --------------- Canvas Components ---------------

const DraggableItem = React.forwardRef<HTMLDivElement, { element: PolicyElement, isSelected: boolean, onSelect: (id: string) => void }>(
  ({ element, isSelected, onSelect }, ref) => {
    const {attributes, listeners, setNodeToDrag} = useDraggable({
      id: element.id,
      data: { element },
    });

    const style = {
      transform: `translate3d(${element.x}px, ${element.y}px, 0)`,
      width: element.width,
      height: element.height,
    };
    
    const renderContent = () => {
        switch(element.type) {
            case 'text':
                return <div style={{fontSize: element.fontSize, fontWeight: element.fontWeight}} className="w-full h-full overflow-hidden">{element.content || 'نص تجريبي'}</div>
            case 'barcode':
                return <Icon name="Barcode" className="w-full h-full" />
            case 'image':
                return <Icon name="Image" className="w-full h-full text-muted-foreground" />
            case 'rect':
                return <div className="w-full h-full border-2 border-dashed border-gray-400"></div>
            default:
                return null;
        }
    }

    return (
      <div
        ref={setNodeToDrag}
        style={style}
        className={cn(
            "absolute p-1 cursor-move bg-transparent hover:border-blue-500",
            isSelected ? "border-2 border-blue-600 z-10" : "border border-transparent"
        )}
        {...listeners}
        {...attributes}
        onClick={(e) => {e.stopPropagation(); onSelect(element.id)}}
      >
        <div className="w-full h-full pointer-events-none">
            {renderContent()}
        </div>
      </div>
    );
  }
);
DraggableItem.displayName = 'DraggableItem';


const PolicyCanvas = ({ paperSize, elements, onSelectElement, selectedElementId }: {
    paperSize: PaperSize,
    elements: PolicyElement[],
    onSelectElement: (id: string | null) => void,
    selectedElementId: string | null,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative bg-white rounded-lg shadow-inner overflow-hidden mx-auto transition-all',
        isOver ? 'outline outline-2 outline-offset-2 outline-primary' : ''
      )}
      style={{
        width: paperSizes[paperSize].width,
        height: paperSizes[paperSize].height,
      }}
      onClick={() => onSelectElement(null)}
    >
      {elements.map(el => (
        <DraggableItem key={el.id} element={el} isSelected={selectedElementId === el.id} onSelect={onSelectElement} />
      ))}
    </div>
  );
};


// --------------- Toolbar Components ---------------

const ToolboxItem = ({ type, icon, label }: { type: ElementType, icon: any, label: string }) => {
    const {attributes, listeners, setNodeToDrag} = useDraggable({
        id: `toolbox-${type}`,
        data: { type }
    });

    return (
        <div 
            ref={setNodeToDrag}
            {...listeners}
            {...attributes}
            className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent hover:shadow-md cursor-grab transition-all"
        >
            <Icon name={icon} className="h-6 w-6" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    )
}

const Toolbox = () => {
    return (
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
};


// --------------- Properties Panel Components ---------------
const PropertiesPanel = ({ selectedElement, onElementUpdate, onElementDelete }: { selectedElement: PolicyElement | null, onElementUpdate: (id: string, updates: Partial<PolicyElement>) => void, onElementDelete: (id: string) => void }) => {
    if (!selectedElement) {
        return (
            <Card className="shadow-lg h-full">
                <CardHeader><CardTitle className="text-base">الخصائص</CardTitle></CardHeader>
                <CardContent className="text-center text-muted-foreground pt-10">
                    <p>حدد عنصراً لتعديل خصائصه.</p>
                </CardContent>
            </Card>
        )
    }

    const handleChange = (field: keyof PolicyElement, value: any) => {
        onElementUpdate(selectedElement.id, { [field]: value });
    }

    return (
        <Card className="shadow-lg h-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base">خصائص العنصر</CardTitle>
                    <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => onElementDelete(selectedElement.id)}>
                        <Icon name="Trash2" className="w-4 h-4"/>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {selectedElement.type === 'text' && (
                    <>
                        <div className="space-y-1">
                            <Label htmlFor="content">المحتوى</Label>
                            <Textarea id="content" value={selectedElement.content} onChange={(e) => handleChange('content', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="fontSize">حجم الخط (px)</Label>
                            <Input id="fontSize" type="number" value={selectedElement.fontSize || 14} onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10) || 14)} />
                        </div>
                    </>
                )}
                 <div className="space-y-1">
                    <Label htmlFor="width">العرض (px)</Label>
                    <Input id="width" type="number" value={selectedElement.width} onChange={(e) => handleChange('width', parseInt(e.target.value, 10))} />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="height">الارتفاع (px)</Label>
                    <Input id="height" type="number" value={selectedElement.height} onChange={(e) => handleChange('height', parseInt(e.target.value, 10))} />
                </div>
                 <div className="space-y-1">
                    <Label>الموضع</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input aria-label="X position" type="number" value={Math.round(selectedElement.x)} onChange={(e) => handleChange('x', parseInt(e.target.value, 10))} />
                        <Input aria-label="Y position" type="number" value={Math.round(selectedElement.y)} onChange={(e) => handleChange('y', parseInt(e.target.value, 10))} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// --------------- Main Page Component ---------------
export default function PolicyEditorPage() {
  const { toast } = useToast();
  const [elements, setElements] = useState<PolicyElement[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<Active | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragItem(event.active);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveDragItem(null);

    if (!over || over.id !== 'canvas') {
        return; 
    }
    
    const isToolboxItem = String(active.id).startsWith('toolbox-');
    
    if (isToolboxItem) {
        const canvasRect = (document.querySelector('[data-droppable-id="canvas"]') as HTMLElement)?.getBoundingClientRect();
        if (!canvasRect) return;

        const type = active.data.current?.type as ElementType;
        // Adjust drop position relative to the canvas
        const dropX = active.rect.current.translated!.left - canvasRect.left;
        const dropY = active.rect.current.translated!.top - canvasRect.top;

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
        };
        setElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
        return;
    }

    const activeElementId = active.id.toString();
    const elementExists = elements.some(el => el.id === activeElementId);
    if (elementExists) {
        setElements(prev =>
            prev.map(el =>
                el.id === active.id
                ? { ...el, x: el.x + delta.x, y: el.y + delta.y }
                : el
            )
        );
    }
  }, [elements]);

  const handleElementUpdate = (id: string, updates: Partial<PolicyElement>) => {
      setElements(prev => prev.map(el => el.id === id ? {...el, ...updates} : el));
  }

  const handleElementDelete = (id: string) => {
      setElements(prev => prev.filter(el => el.id !== id));
      setSelectedElementId(null);
  }
  
  const selectedElement = useMemo(() => elements.find(el => el.id === selectedElementId) || null, [elements, selectedElementId]);

  return (
    <div className="space-y-6" dir="rtl">
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Icon name="Brush" /> محرر البوليصة المرئي
                    </CardTitle>
                    <CardDescription>قم بتصميم بوليصة الشحن الخاصة بك عبر سحب وإفلات العناصر.</CardDescription>
                </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                     <Select value={paperSize} onValueChange={(value) => setPaperSize(value as PaperSize)}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="اختر حجم الورق" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(paperSizes).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings/general"><Icon name="ArrowLeft" /></Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="flex justify-start gap-2">
                    <Button><Icon name="Save" className="ml-2"/> حفظ كقالب</Button>
                    <Button variant="secondary"><Icon name="Printer" className="ml-2"/> طباعة معاينة</Button>
                </div>
            </CardContent>
        </Card>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6 items-start">
                {/* Toolbox */}
                <div className="lg:sticky lg:top-24">
                    <Toolbox />
                </div>

                {/* Canvas */}
                <div className="w-full bg-muted p-8 rounded-lg overflow-auto">
                   <PolicyCanvas 
                     paperSize={paperSize}
                     elements={elements} 
                     selectedElementId={selectedElementId} 
                     onSelectElement={setSelectedElementId} 
                    />
                </div>

                {/* Properties Panel */}
                <div className="lg:sticky lg:top-24">
                   <PropertiesPanel 
                        selectedElement={selectedElement} 
                        onElementUpdate={handleElementUpdate} 
                        onElementDelete={handleElementDelete}
                    />
                </div>
            </div>

            <DragOverlay>
                {activeDragItem && String(activeDragItem.id).startsWith('toolbox-') ? (
                    <div className="p-3 rounded-lg border bg-card shadow-lg flex flex-col items-center gap-2 opacity-75">
                         <Icon name={activeDragItem.data.current?.type === 'text' ? 'Type' : (activeDragItem.data.current?.type === 'image' ? 'Image' : (activeDragItem.data.current?.type === 'barcode' ? 'Barcode' : 'Square'))} className="h-6 w-6" />
                         <span className="text-xs font-medium">{activeDragItem.data.current?.type}</span>
                    </div>
                ) : activeDragItem ? (
                     <div style={{
                         width: activeDragItem.data.current?.element.width,
                         height: activeDragItem.data.current?.element.height,
                     }} className="bg-primary/20 border-2 border-primary rounded-md"></div>
                ) : null}
            </DragOverlay>

        </DndContext>
    </div>
  );
}
