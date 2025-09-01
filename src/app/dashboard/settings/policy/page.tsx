// PolicyEditorPage.tsx
'use client';

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  Active,
} from '@dnd-kit/core';
import { createSnapModifier } from '@dnd-kit/modifiers';
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
import { 
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    AlignHorizontalDistributeCenter,
    AlignVerticalDistributeCenter,
    Save
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';


// ---------- Types ----------
type ElementType = 'text' | 'image' | 'barcode' | 'rect' | 'line';
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
  backgroundColor?: string;
};

type SavedTemplate = {
  id: string;
  name: string;
  elements: PolicyElement[];
  paperSizeKey: PaperSizeKey;
  customDimensions: { width: number; height: number };
  margins: { top: number; right: number; bottom: number; left: number };
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

const toolboxItems = [
    { type: 'image', label: 'شعار الشركة', icon: 'Building', content: '{company_logo}', defaultWidth: 120, defaultHeight: 40 },
    { type: 'text', label: 'اسم الشركة', icon: 'Building', content: '{company_name}', defaultWidth: 150, defaultHeight: 24 },
    { type: 'text', label: 'اسم المتجر', icon: 'Store', content: '{merchant_name}', defaultWidth: 150, defaultHeight: 24 },
    { type: 'image', label: 'شعار المتجر', icon: 'Store', content: '{merchant_logo}', defaultWidth: 100, defaultHeight: 40 },
    { type: 'text', label: 'معلومات المستلم', icon: 'User', content: '{recipient_info}', defaultWidth: 200, defaultHeight: 60 },
    { type: 'text', label: 'معلومات الطلب', icon: 'Package', content: '{order_items}', defaultWidth: 200, defaultHeight: 60 },
    { type: 'text', label: 'قيمة التحصيل', icon: 'HandCoins', content: '{cod_amount}', defaultWidth: 100, defaultHeight: 32 },
    { type: 'barcode', label: 'باركود', icon: 'Barcode', content: '{order_id}', defaultWidth: 150, defaultHeight: 50 },
    { type: 'text', label: 'رقم الطلب', icon: 'ClipboardList', content: '{order_id}', defaultWidth: 150, defaultHeight: 24 },
    { type: 'text', label: 'الرقم المرجعي', icon: 'ClipboardCheck', content: '{reference_id}', defaultWidth: 150, defaultHeight: 24 },
    { type: 'text', label: 'نص', icon: 'Type', content: 'نص جديد', defaultWidth: 120, defaultHeight: 24 },
    { type: 'rect', label: 'مستطيل', icon: 'RectangleHorizontal', content: '', defaultWidth: 160, defaultHeight: 80 },
    { type: 'rect', label: 'مربع', icon: 'Square', content: '', defaultWidth: 80, defaultHeight: 80 },
    { type: 'line', label: 'خط', icon: 'Minus', content: '', defaultWidth: 150, defaultHeight: 2 },
];


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
    borderWidth: el.borderWidth ?? 0,
    borderColor: el.borderColor ?? 'transparent',
    borderStyle: 'solid',
    opacity: el.opacity ?? 1,
    backgroundColor: el.backgroundColor,
    textAlign: 'center',
    padding: 4,
    wordBreak: 'break-word',
  };

  if (el.type === 'text') return <div style={baseStyle}>{el.content || 'نص جديد'}</div>;
  if (el.type === 'barcode') return <div style={baseStyle}><Icon name="Barcode" className="h-8 w-8" /></div>;
  if (el.type === 'image') return <div style={baseStyle}><Icon name="Image" className="h-8 w-8 text-muted-foreground" /></div>;
  if (el.type === 'rect') return <div style={baseStyle}></div>;
  if (el.type === 'line') return <div style={{ ...baseStyle, backgroundColor: el.color ?? '#000000' }}></div>;
  
  return null;
}

// ---------- Canvas item ----------
const DraggableItem = ({ element, selected, onSelect, onResizeStop, onResize }: {
  element: PolicyElement;
  selected: boolean;
  onSelect: (e: React.MouseEvent, id: string) => void;
  onResizeStop: (id: string, w: number, h: number) => void;
  onResize: (id: string, w: number, h: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: element.id, data: { element } });

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
      enable={{ top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true }}
      style={style}
      ref={(node) => setNodeRef(node?.resizable as HTMLElement | null)}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); onSelect(e, element.id); }}
    >
      <div style={{ width: '100%', height: '100%' }}>
        <ElementContent el={element} />
      </div>
    </Resizable>
  );
};

// ---------- Toolbox item ----------
const ToolboxItem = ({ tool, onClick }: { tool: typeof toolboxItems[0]; onClick: () => void; }) => {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="h-auto flex items-center justify-start gap-2 p-2 w-full text-right">
      <Icon name={tool.icon as any} className="w-4 h-4 text-primary" />
      <span className="text-xs font-semibold">{tool.label}</span>
    </Button>
  );
};

// ---------- Properties Panel ----------
const PropertiesPanel = ({ selectedElementId, elements, onUpdate, onDelete, onFocus }: { 
    selectedElementId: string | null;
    elements: PolicyElement[];
    onUpdate: (id: string, updates: Partial<PolicyElement>) => void; 
    onDelete: (id: string) => void;
    onFocus: (id: string) => void;
}) => {
  const selectedElement = useMemo(() => {
    return elements.find(el => el.id === selectedElementId) ?? null;
  }, [elements, selectedElementId]);

  if (!selectedElement) {
    return <div className="text-muted-foreground text-center p-4">حدد عنصر لتعديل خصائصه</div>;
  }

  const handleFocus = () => {
      onFocus(selectedElement.id);
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

  const isShape = ['rect', 'line'].includes(selectedElement.type);

  return (
    <div className="space-y-4" onFocus={handleFocus}>
      <h3 className="font-bold text-lg text-center">{selectedElement.type}</h3>
      
      {selectedElement.type === 'text' && (
        <div className="space-y-2">
          <Label>النص</Label>
          <Textarea value={selectedElement.content} onChange={(e) => handleChange('content', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
                <Label>حجم الخط</Label>
                <Input type="number" value={selectedElement.fontSize ?? 14} onChange={(e) => handleNumericChange('fontSize', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>وزن الخط</Label>
                <Select value={selectedElement.fontWeight ?? 'normal'} onValueChange={(val: FontWeight) => handleChange('fontWeight', val)}>
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
      </div>
       
      {(selectedElement.type === 'text' || selectedElement.type === 'line') && <div className="space-y-2"><Label>اللون</Label><Input type="color" value={selectedElement.color ?? '#000000'} onChange={(e) => handleChange('color', e.target.value)} className="h-10 w-full"/></div>}
      
      {(selectedElement.type === 'rect') && <div className="space-y-2"><Label>لون التعبئة</Label><Input type="color" value={selectedElement.backgroundColor ?? '#ffffff'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="h-10 w-full"/></div>}
      
      {(isShape) && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label>لون الحد</Label><Input type="color" value={selectedElement.borderColor ?? '#000000'} onChange={(e) => handleChange('borderColor', e.target.value)} className="h-10 w-full"/></div>
            <div className="space-y-2"><Label>عرض الحد</Label><Input type="number" value={selectedElement.borderWidth ?? 1} onChange={(e) => handleNumericChange('borderWidth', e.target.value)} /></div>
          </div>
      )}
      
      <div className="space-y-2"><Label>الشفافية</Label><Input type="number" step="0.1" min="0" max="1" value={selectedElement.opacity ?? 1} onChange={(e) => handleChange('opacity', parseFloat(e.target.value))} /></div>

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
  const canvasRef = useRef<HTMLDivElement>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const { toast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem('policyTemplates');
      if (storedTemplates) {
        setSavedTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error("Failed to load templates from localStorage", error);
    }
  }, []);

  const addElement = useCallback((tool: typeof toolboxItems[0]) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    const newElement: PolicyElement = {
        id: nanoid(),
        type: tool.type as ElementType,
        x: snapToGrid(canvasRect.width / 2 - tool.defaultWidth / 2),
        y: snapToGrid(canvasRect.height / 2 - tool.defaultHeight / 2),
        width: tool.defaultWidth,
        height: tool.defaultHeight,
        content: tool.content,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        borderColor: '#000000',
        borderWidth: 1,
        opacity: 1,
        backgroundColor: '#ffffff'
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedIds([newElement.id]);
  }, []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, delta } = e;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setElements((items) =>
        items.map((item) => {
            if (item.id === active.id) {
                // Ensure the element stays within the canvas boundaries
                const newX = Math.max(0, Math.min(item.x + delta.x, canvasRect.width - item.width));
                const newY = Math.max(0, Math.min(item.y + delta.y, canvasRect.height - item.height));

                return {
                    ...item,
                    x: snapToGrid(newX),
                    y: snapToGrid(newY),
                };
            }
            return item;
        })
    );
  }, []);

  const handleSelect = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.shiftKey) {
        setSelectedIds((prev) => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    } else {
        setSelectedIds([id]);
    }
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

  const handleAlignment = (type: 'left' | 'h-center' | 'right' | 'top' | 'v-center' | 'bottom' | 'dist-h' | 'dist-v') => {
      setElements(prev => {
          const newElements = [...prev];
          const selected = newElements.filter(el => selectedIds.includes(el.id));
          if (selected.length < 2) return prev;

          switch (type) {
              case 'left':
                  const minX = Math.min(...selected.map(el => el.x));
                  selected.forEach(el => { const original = newElements.find(o => o.id === el.id)!; original.x = minX; });
                  break;
              case 'h-center':
                  const centerX = selected[0].x + selected[0].width / 2;
                  selected.forEach(el => { const original = newElements.find(o => o.id === el.id)!; original.x = centerX - el.width / 2; });
                  break;
              case 'right':
                  const maxX = Math.max(...selected.map(el => el.x + el.width));
                  selected.forEach(el => { const original = newElements.find(o => o.id === el.id)!; original.x = maxX - el.width; });
                  break;
              case 'top':
                  const minY = Math.min(...selected.map(el => el.y));
                  selected.forEach(el => { const original = newElements.find(o => o.id === el.id)!; original.y = minY; });
                  break;
              case 'v-center':
                  const centerY = selected[0].y + selected[0].height / 2;
                  selected.forEach(el => { const original = newElements.find(o => o.id === el.id)!; original.y = centerY - el.height / 2; });
                  break;
              case 'bottom':
                  const maxY = Math.max(...selected.map(el => el.y + el.height));
                  selected.forEach(el => { const original = newElements.find(o => o.id === el.id)!; original.y = maxY - el.height; });
                  break;
              case 'dist-h':
                  if (selected.length < 3) return prev;
                  selected.sort((a,b) => a.x - b.x);
                  const totalWidth = selected.slice(1, -1).reduce((sum, el) => sum + el.width, 0);
                  const totalSpace = selected[selected.length - 1].x - (selected[0].x + selected[0].width);
                  const gap = (totalSpace - totalWidth) / (selected.length - 1);
                  let currentX = selected[0].x + selected[0].width;
                  for(let i=1; i<selected.length; i++) {
                       const original = newElements.find(o => o.id === selected[i].id)!;
                       original.x = currentX + gap;
                       currentX += original.width + gap;
                  }
                  break;
              case 'dist-v':
                  if (selected.length < 3) return prev;
                  selected.sort((a,b) => a.y - b.y);
                  const totalHeight = selected.slice(1,-1).reduce((sum, el) => sum + el.height, 0);
                  const totalYSpace = selected[selected.length - 1].y - (selected[0].y + selected[0].height);
                  const yGap = (totalYSpace - totalHeight) / (selected.length - 1);
                  let currentY = selected[0].y + selected[0].height;
                  for(let i=1; i<selected.length; i++) {
                      const original = newElements.find(o => o.id === selected[i].id)!;
                      original.y = currentY + yGap;
                      currentY += original.height + yGap;
                  }
                  break;
          }
          return newElements;
      });
  };

  const handleConfirmSave = () => {
    if (!templateName) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم للقالب.' });
      return;
    }
    const newTemplate: SavedTemplate = {
      id: nanoid(),
      name: templateName,
      elements,
      paperSizeKey,
      customDimensions,
      margins,
    };
    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('policyTemplates', JSON.stringify(updatedTemplates));
    toast({ title: 'تم الحفظ', description: `تم حفظ قالب "${templateName}" بنجاح.` });
    setIsSaveDialogOpen(false);
    setTemplateName('');
  };

  const loadTemplate = (template: SavedTemplate) => {
    setElements(template.elements);
    setPaperSizeKey(template.paperSizeKey);
    setCustomDimensions(template.customDimensions);
    setMargins(template.margins);
    toast({ title: 'تم التحميل', description: `تم تحميل قالب "${template.name}".` });
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('policyTemplates', JSON.stringify(updatedTemplates));
    toast({ title: 'تم الحذف', description: 'تم حذف القالب بنجاح.' });
  };
  
  const paperDimensions = useMemo(() => {
    if (paperSizeKey === 'custom') {
      return { width: mmToPx(customDimensions.width), height: mmToPx(customDimensions.height) };
    }
    const size = paperSizes[paperSizeKey];
    return { width: mmToPx(size.width), height: mmToPx(size.height) };
  }, [paperSizeKey, customDimensions]);

  return (
    <div className="space-y-6">
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>حفظ قالب البوليصة</DialogTitle>
                <DialogDescription>
                    أدخل اسمًا مميزًا لهذا القالب ليتم حفظه للاستخدام المستقبلي.
                </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="templateName">اسم القالب</Label>
                    <Input id="templateName" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                    <Button onClick={handleConfirmSave}>حفظ القالب</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


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
                 <div className="flex items-center gap-2">
                    <Button onClick={() => setIsSaveDialogOpen(true)}><Save className="ml-2 h-4 w-4" />حفظ القالب</Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings/general">
                            <Icon name="ArrowLeft" className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
        </Card>
        
        <Card>
            <CardContent className="p-2 flex flex-wrap items-center gap-2">
                 <Button variant="ghost" size="icon" disabled={selectedIds.length < 2} onClick={() => handleAlignment('left')}><AlignHorizontalJustifyStart /></Button>
                 <Button variant="ghost" size="icon" disabled={selectedIds.length < 2} onClick={() => handleAlignment('h-center')}><AlignHorizontalJustifyCenter /></Button>
                 <Button variant="ghost" size="icon" disabled={selectedIds.length < 2} onClick={() => handleAlignment('right')}><AlignHorizontalJustifyEnd /></Button>
                 <Button variant="ghost" size="icon" disabled={selectedIds.length < 2} onClick={() => handleAlignment('top')}><AlignVerticalJustifyStart /></Button>
                 <Button variant="ghost" size="icon" disabled={selectedIds.length < 2} onClick={() => handleAlignment('v-center')}><AlignVerticalJustifyCenter /></Button>
                 <Button variant="ghost" size="icon" disabled={selectedIds.length < 2} onClick={() => handleAlignment('bottom')}><AlignVerticalJustifyEnd /></Button>
                 <Button variant="ghost" size="icon" disabled={selectedIds.length < 3} onClick={() => handleAlignment('dist-h')}><AlignHorizontalDistributeCenter /></Button>
                 <Button variant="ghost" size="icon" disabled={selectedIds.length < 3} onClick={() => handleAlignment('dist-v')}><AlignVerticalDistributeCenter /></Button>
            </CardContent>
        </Card>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[createSnapModifier(GRID_SIZE)]}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                <div className="space-y-6 lg:col-span-1">
                     <Card>
                        <CardHeader><CardTitle>الأدوات</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            {toolboxItems.map(tool => (
                                <ToolboxItem key={tool.label} tool={tool} onClick={() => addElement(tool)} />
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>الخصائص</CardTitle></CardHeader>
                        <CardContent>
                            <PropertiesPanel 
                                selectedElementId={selectedIds.length === 1 ? selectedIds[0] : null}
                                elements={elements}
                                onUpdate={handleUpdateElement} 
                                onDelete={handleDeleteElement}
                                onFocus={(id) => setSelectedIds([id])}
                            />
                        </CardContent>
                    </Card>
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
                     <Card>
                        <CardHeader><CardTitle>القوالب المحفوظة</CardTitle></CardHeader>
                        <CardContent>
                            {savedTemplates.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center">لا توجد قوالب محفوظة.</p>
                            ) : (
                                <div className="space-y-2">
                                {savedTemplates.map(template => (
                                    <div key={template.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <Button variant="link" className="p-0 h-auto" onClick={() => loadTemplate(template)}>
                                        {template.name}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTemplate(template.id)}>
                                        <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                                    </Button>
                                    </div>
                                ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6 lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>لوحة التصميم</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow w-full bg-muted p-8 rounded-lg overflow-auto flex items-center justify-center min-h-[70vh]">
                            <div ref={canvasRef} className="relative bg-white rounded-md shadow-inner" style={{ ...paperDimensions }} onClick={() => setSelectedIds([])}>
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
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DndContext>
    </div>
  );
}
