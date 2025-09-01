// PolicyEditorPage.tsx
'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  Active,
  Modifier,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { nanoid } from 'nanoid';
import { Resizable } from 're-resizable';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ---------- Types ----------
type ElementType = 'text' | 'image' | 'barcode' | 'rect';
type FontWeight = 'normal' | 'bold';

type PolicyElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
};

const GRID_SIZE = 8;
const DPI = 96; // 96 pixels per inch

type PaperSize = { width: number; height: number; label: string };
const paperSizes: Record<string, PaperSize> = {
  a4: { width: 210, height: 297, label: 'A4 (210×297mm)' },
  a5: { width: 148, height: 210, label: 'A5 (148×210mm)' },
  label_4x6: { width: 4 * 25.4, height: 6 * 25.4, label: 'Label 4×6 in' },
  label_4x4: { width: 4 * 25.4, height: 4 * 25.4, label: 'Label 4×4 in' },
  custom: { width: 100, height: 100, label: 'حجم مخصص' },
};
type PaperSizeKey = keyof typeof paperSizes;

const mmToPx = (mm: number) => (mm / 25.4) * DPI;
const snapToGrid = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;

// ---------- Element content ----------
function ElementContent({ el }: { el: PolicyElement }) {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontSize: el.fontSize ?? 14,
    fontWeight: el.fontWeight ?? 'normal',
    color: el.color ?? '#111827',
    opacity: el.opacity ?? 1,
    textAlign: 'center',
    padding: 4,
    wordBreak: 'break-word',
  };

  if (el.type === 'text') return <div style={baseStyle}>{el.content || 'نص جديد'}</div>;
  if (el.type === 'barcode') return <div style={baseStyle}><Icon name="Barcode" className="h-8 w-8" /></div>;
  if (el.type === 'image') return <div style={baseStyle}><Icon name="Image" className="h-8 w-8 text-muted-foreground" /></div>;
  if (el.type === 'rect') return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderStyle: 'solid',
        borderColor: el.borderColor ?? '#6b7280',
        borderWidth: el.borderWidth ?? 2,
        opacity: el.opacity ?? 1,
      }}
    />
  );
  return null;
}

// ---------- Canvas item ----------
const DraggableItem = ({ element, selected, onSelect, onResizeStop, onResize, multiSelect }: {
  element: PolicyElement;
  selected: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onResizeStop: (id: string, w: number, h: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  multiSelect: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: element.id, data: { element } });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    cursor: 'grab',
    zIndex: selected ? 50 : 20,
    outline: selected ? '2px solid hsl(var(--primary))' : 'none',
    outlineOffset: '2px',
    visibility: isDragging ? 'hidden' : 'visible',
  };

  return (
    <Resizable
      size={{ width: element.width, height: element.height }}
      onResize={(_e, _dir, ref) => onResize(element.id, ref.offsetWidth, ref.offsetHeight)}
      onResizeStop={(_e, _dir, ref) => onResizeStop(element.id, snapToGrid(ref.offsetWidth), snapToGrid(ref.offsetHeight))}
      minWidth={GRID_SIZE * 2}
      minHeight={GRID_SIZE * 2}
      grid={[GRID_SIZE, GRID_SIZE]}
      enable={{ top: false, right: true, bottom: true, left: false, bottomRight: true }}
      style={style}
      ref={(node) => setNodeRef(node?.resizable as HTMLElement | null)}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); onSelect(element.id, multiSelect); }}
    >
      <div style={{ width: '100%', height: '100%' }}>
        <ElementContent el={element} />
      </div>
    </Resizable>
  );
};

// ---------- Toolbox item ----------
const ToolboxItem = ({ type, label, icon }: { type: ElementType; label: string; icon: any; }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `toolbox-${type}`, data: { type } });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border bg-card cursor-grab hover:shadow-lg hover:border-primary transition-all text-center h-24">
      <Icon name={icon} className="w-6 h-6 text-primary" />
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
};

// ---------- Properties Panel ----------
const PropertiesPanel = ({ selectedElement, onUpdate, onDelete }: { selectedElement: PolicyElement | null; onUpdate: (id: string, updates: Partial<PolicyElement>) => void; onDelete: (id: string) => void; }) => {
  if (!selectedElement) {
    return <div className="text-muted-foreground text-center p-4">حدد عنصر لتعديل خصائصه</div>;
  }

  const handleChange = (field: keyof PolicyElement, value: any) => {
    onUpdate(selectedElement.id, { [field]: value });
  };
  
  const handleNumericChange = (field: keyof PolicyElement, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      handleChange(field, num);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-center">{selectedElement.type}</h3>
      {selectedElement.type === 'text' && (
        <div className="space-y-2">
          <Label>النص</Label>
          <Textarea value={selectedElement.content} onChange={(e) => handleChange('content', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
                <Label>حجم الخط</Label>
                <Input type="number" value={selectedElement.fontSize} onChange={(e) => handleNumericChange('fontSize', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>وزن الخط</Label>
                <Select value={selectedElement.fontWeight} onValueChange={(val: FontWeight) => handleChange('fontWeight', val)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="normal">عادي</SelectItem>
                        <SelectItem value="bold">عريض</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
         <div className="space-y-2"><Label>X</Label><Input type="number" value={selectedElement.x} onChange={(e) => handleNumericChange('x', e.target.value)} /></div>
        <div className="space-y-2"><Label>Y</Label><Input type="number" value={selectedElement.y} onChange={(e) => handleNumericChange('y', e.target.value)} /></div>
        <div className="space-y-2"><Label>العرض</Label><Input type="number" value={selectedElement.width} onChange={(e) => handleNumericChange('width', e.target.value)} /></div>
        <div className="space-y-2"><Label>الارتفاع</Label><Input type="number" value={selectedElement.height} onChange={(e) => handleNumericChange('height', e.target.value)} /></div>
        <div className="space-y-2"><Label>لون الخط</Label><Input type="color" value={selectedElement.color} onChange={(e) => handleChange('color', e.target.value)} className="h-10"/></div>
      </div>
      <Button variant="destructive" onClick={() => onDelete(selectedElement.id)} className="w-full"><Icon name="Trash2" className="ml-2" /> حذف العنصر</Button>
    </div>
  );
};


// ---------- Main component ----------
export default function PolicyEditorPage() {
  const [paperSizeKey, setPaperSizeKey] = useState<PaperSizeKey>('a4');
  const [customDimensions, setCustomDimensions] = useState({ width: 100, height: 150 });
  const [margins, setMargins] = useState({ top: 10, right: 10, bottom: 10, left: 10 });
  const [elements, setElements] = useState<PolicyElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrag, setActiveDrag] = useState<Active | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const addElementAt = useCallback((type: ElementType, x: number, y: number) => {
    const el: PolicyElement = {
      id: nanoid(), type, x: snapToGrid(x), y: snapToGrid(y),
      width: type === 'text' ? 160 : 100, height: type === 'text' ? 32 : 100,
      content: type === 'text' ? 'نص جديد' : '', fontSize: 14, fontWeight: 'normal',
      color: '#000000', borderColor: '#000000', borderWidth: 2, opacity: 1,
    };
    setElements((p) => [...p, el]);
    setSelectedIds([el.id]);
  }, []);

  const handleDragStart = useCallback((e: DragStartEvent) => setActiveDrag(e.active), []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over, delta } = e;
    setActiveDrag(null);
    if (!over) return;
  
    const isTool = String(active.id).startsWith('toolbox-');
    const canvasEl = document.querySelector('[data-droppable-id="canvas"]') as HTMLElement | null;
    if (!canvasEl) return;
    const canvasRect = canvasEl.getBoundingClientRect();
  
    if (isTool) {
      const toolType = active.data.current?.type as ElementType;
      // This uses a fixed drop position for simplicity, can be refined with pointer position
      const dropX = snapToGrid((e.activatorEvent as MouseEvent).clientX - canvasRect.left);
      const dropY = snapToGrid((e.activatorEvent as MouseEvent).clientY - canvasRect.top);
      addElementAt(toolType, dropX, dropY);
    } else {
      const id = String(active.id);
      setElements((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            return {
              ...el,
              x: snapToGrid(el.x + delta.x),
              y: snapToGrid(el.y + delta.y),
            };
          }
          return el;
        })
      );
    }
  }, [addElementAt]);

  const handleSelect = useCallback((id: string, multi?: boolean) => {
    if (multi) setSelectedIds((p) => (p.includes(id) ? p.filter(i => i !== id) : [...p, id]));
    else setSelectedIds([id]);
  }, []);

  const handleResizeStop = useCallback((id: string, w: number, h: number) => {
    setElements((p) => p.map((el) => (el.id === id ? { ...el, width: snapToGrid(w), height: snapToGrid(h) } : el)));
  }, []);

  const handleUpdateElement = (id: string, updates: Partial<PolicyElement>) => {
    setElements(p => p.map(el => el.id === id ? {...el, ...updates} : el));
  };
  
  const handleDeleteElement = (id: string) => {
      setElements(p => p.filter(el => el.id !== id));
      setSelectedIds([]);
  };

  const selectedElement = useMemo(() => elements.find((el) => el.id === selectedIds[0]) ?? null, [elements, selectedIds]);
  
  const paperDimensions = useMemo(() => {
    if (paperSizeKey === 'custom') {
      return { width: mmToPx(customDimensions.width), height: mmToPx(customDimensions.height) };
    }
    const size = paperSizes[paperSizeKey];
    return { width: mmToPx(size.width), height: mmToPx(size.height) };
  }, [paperSizeKey, customDimensions]);

  const snapToGridModifier: Modifier = ({transform}) => {
    return {
      ...transform,
      x: Math.round(transform.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(transform.y / GRID_SIZE) * GRID_SIZE,
    };
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Icon name="ReceiptText" /> إعدادات البوليصة
                    </CardTitle>
                    <CardDescription className="mt-1">
                        تخصيص محتوى وتصميم بوليصة الشحن.
                    </CardDescription>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/settings/general">
                        <Icon name="ArrowLeft" className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
        </Card>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges, snapToGridModifier]}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>لوحة التصميم</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow w-full bg-muted p-8 rounded-lg overflow-auto flex items-center justify-center min-h-[70vh]">
                            <div data-droppable-id="canvas" className="relative bg-white rounded-md shadow-inner" style={{ ...paperDimensions }} onClick={() => setSelectedIds([])}>
                                <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
                                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`,
                                    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                                    backgroundRepeat: 'repeat',
                                }} />
                                <div className="absolute border-2 border-dashed border-red-400/50 pointer-events-none" style={{
                                    top: `${mmToPx(margins.top)}px`, right: `${mmToPx(margins.right)}px`,
                                    bottom: `${mmToPx(margins.bottom)}px`, left: `${mmToPx(margins.left)}px`,
                                }}/>
                                {elements.map((el) => (
                                    <DraggableItem key={el.id} element={el} selected={selectedIds.includes(el.id)} onSelect={handleSelect}
                                        onResizeStop={handleResizeStop}
                                        onResize={(id, w, h) => handleUpdateElement(id, { width: w, height: h })}
                                        multiSelect={false}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6 lg:sticky lg:top-24">
                     <Card>
                        <CardHeader><CardTitle>إعدادات البوليصة</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>حجم الورق</Label>
                                <Select value={paperSizeKey} onValueChange={(val) => setPaperSizeKey(val as PaperSizeKey)}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>{Object.entries(paperSizes).map(([key, { label }]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             {paperSizeKey === 'custom' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2"><Label>العرض (مم)</Label><Input type="number" value={customDimensions.width} onChange={e => setCustomDimensions(p => ({...p, width: parseInt(e.target.value, 10) || 0}))} /></div>
                                    <div className="space-y-2"><Label>الارتفاع (مم)</Label><Input type="number" value={customDimensions.height} onChange={e => setCustomDimensions(p => ({...p, height: parseInt(e.target.value, 10) || 0}))} /></div>
                                </div>
                            )}
                             <div className="space-y-2">
                                <Label>الهوامش (مم)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                     <div className="space-y-2"><Label className="text-xs">الأعلى</Label><Input type="number" placeholder="أعلى" value={margins.top} onChange={e => setMargins(p => ({...p, top: parseInt(e.target.value, 10) || 0}))}/></div>
                                     <div className="space-y-2"><Label className="text-xs">الأسفل</Label><Input type="number" placeholder="أسفل" value={margins.bottom} onChange={e => setMargins(p => ({...p, bottom: parseInt(e.target.value, 10) || 0}))}/></div>
                                     <div className="space-y-2"><Label className="text-xs">اليمين</Label><Input type="number" placeholder="يمين" value={margins.right} onChange={e => setMargins(p => ({...p, right: parseInt(e.target.value, 10) || 0}))}/></div>
                                     <div className="space-y-2"><Label className="text-xs">اليسار</Label><Input type="number" placeholder="يسار" value={margins.left} onChange={e => setMargins(p => ({...p, left: parseInt(e.target.value, 10) || 0}))}/></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle>الأدوات</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3"><ToolboxItem type="text" label="نص" icon="Type" /><ToolboxItem type="image" label="صورة" icon="Image" /><ToolboxItem type="barcode" label="باركود" icon="Barcode" /><ToolboxItem type="rect" label="مربع" icon="Square" /></CardContent></Card>
                    <Card><CardHeader><CardTitle>الخصائص</CardTitle></CardHeader><CardContent><PropertiesPanel selectedElement={selectedElement} onUpdate={handleUpdateElement} onDelete={handleDeleteElement} /></CardContent></Card>
                </div>
            </div>
            
            <DragOverlay>
            {activeDrag && String(activeDrag.id).startsWith('toolbox-') && (
                <div className="p-3 rounded-lg border bg-card opacity-70 flex flex-col items-center gap-2" style={{width: 100, height: 100}}>
                    <Icon name={activeDrag.data.current?.type === 'text' ? 'Type' : activeDrag.data.current?.type === 'image' ? 'Image' : activeDrag.data.current?.type === 'barcode' ? 'Barcode' : 'Square'} className="w-6 h-6" />
                    <span className="text-xs">{activeDrag.data.current?.type}</span>
                </div>
            )}
            {activeDrag && !String(activeDrag.id).startsWith('toolbox-') && activeDrag.data.current?.element && (
                <div style={{ width: activeDrag.rect.current.initial?.width, height: activeDrag.rect.current.initial?.height }}>
                    <ElementContent el={activeDrag.data.current?.element} />
                </div>
            )}
            </DragOverlay>
        </DndContext>
    </div>
  );
}
