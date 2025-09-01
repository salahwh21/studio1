
'use client';

import React, { useState, useCallback } from 'react';
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
  DragStartEvent,
  Active,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { nanoid } from 'nanoid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/icon';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


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

// --------------- Canvas Components ---------------

const DraggableItem = React.forwardRef<HTMLDivElement, { element: PolicyElement, isSelected: boolean, onSelect: (id: string) => void }>(
  ({ element, isSelected, onSelect, ...props }, ref) => {
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


const PolicyCanvas = ({ elements, onElementsChange, selectedElement, onSelectElement }: {
    elements: PolicyElement[],
    onElementsChange: React.Dispatch<React.SetStateAction<PolicyElement[]>>,
    selectedElement: string | null,
    onSelectElement: (id: string | null) => void,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative w-full h-[80vh] bg-white rounded-lg shadow-inner overflow-hidden',
        isOver ? 'bg-green-50' : 'bg-gray-50'
      )}
      onClick={() => onSelectElement(null)}
    >
      {elements.map(el => (
        <DraggableItem key={el.id} element={el} isSelected={selectedElement === el.id} onSelect={onSelectElement} />
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
const PropertiesPanel = ({ selectedElement, onElementUpdate }: { selectedElement: PolicyElement | null, onElementUpdate: (id: string, updates: Partial<PolicyElement>) => void }) => {
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
            <CardHeader><CardTitle className="text-base">خصائص العنصر</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {selectedElement.type === 'text' && (
                    <>
                        <div className="space-y-1">
                            <Label htmlFor="content">المحتوى</Label>
                            <Textarea id="content" value={selectedElement.content} onChange={(e) => handleChange('content', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="fontSize">حجم الخط (px)</Label>
                            <Input id="fontSize" type="number" value={selectedElement.fontSize} onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10))} />
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
  
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active);
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveDragItem(null);

    if (!over || over.id !== 'canvas') {
      return; // Dropped outside the canvas
    }
    
    // If it's a new item from the toolbox
    if (String(active.id).startsWith('toolbox-')) {
        const type = active.data.current?.type as ElementType;
        const newElement: PolicyElement = {
            id: nanoid(),
            type,
            x: 100, // Position should be calculated based on drop point
            y: 100,
            width: type === 'text' ? 150 : 100,
            height: type === 'text' ? 20 : 100,
            content: type === 'text' ? 'نص جديد' : '',
            fontSize: 14,
            fontWeight: 'normal',
        };
        setElements(prev => [...prev, newElement]);
        return;
    }

    // If it's an existing item being moved
    setElements(prev =>
      prev.map(el =>
        el.id === active.id
          ? { ...el, x: el.x + delta.x, y: el.y + delta.y }
          : el
      )
    );
  }, []);

  const handleElementUpdate = (id: string, updates: Partial<PolicyElement>) => {
      setElements(prev => prev.map(el => el.id === id ? {...el, ...updates} : el));
  }
  
  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  return (
    <div className="space-y-6" dir="rtl">
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Icon name="Brush" /> محرر البوليصة المرئي
                    </CardTitle>
                    <CardDescription>قم بتصميم بوليصة الشحن الخاصة بك عبر سحب وإفلات العناصر.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">حفظ كقالب</Button>
                    <Button><Icon name="Printer" className="ml-2"/> طباعة</Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings/general"><Icon name="ArrowLeft" /></Link>
                    </Button>
                </div>
            </CardHeader>
        </Card>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6 items-start">
                {/* Toolbox */}
                <div className="lg:sticky lg:top-24">
                    <Toolbox />
                </div>

                {/* Canvas */}
                <div className="w-full">
                   <PolicyCanvas elements={elements} onElementsChange={setElements} selectedElement={selectedElementId} onSelectElement={setSelectedElementId} />
                </div>

                {/* Properties Panel */}
                <div className="lg:sticky lg:top-24">
                   <PropertiesPanel selectedElement={selectedElement} onElementUpdate={handleElementUpdate} />
                </div>
            </div>

            <DragOverlay>
                {activeDragItem && activeDragItem.id.toString().startsWith('toolbox-') ? (
                    <div className="p-3 rounded-lg border bg-card shadow-lg flex flex-col items-center gap-2">
                         <Icon name="Type" className="h-6 w-6" />
                         <span className="text-xs font-medium">نص</span>
                    </div>
                ) : null}
            </DragOverlay>

        </DndContext>
    </div>
  );
}
