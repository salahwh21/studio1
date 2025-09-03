
'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Copy,
  Download,
  Image as ImageIcon,
  MoreVertical,
  PlusCircle,
  Redo,
  Save,
  ScanBarcode,
  Shapes,
  Trash2,
  Type,
  Undo,
  Upload,
  ZoomIn,
  ZoomOut,
  Palette,
  Bold,
  Italic,
  Underline,
  AlignVerticalSpaceAround,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { Resizable, type ResizeCallback, type DraggableCallback } from 're-resizable';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSettings, type PolicySettings, type PolicyElement, type SavedTemplate } from '@/contexts/SettingsContext';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import { PrintablePolicy } from '@/components/printable-policy';

// --- Constants & Helpers ---

const GRID_SIZE = 5;
const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;
const mmToPx = (mm: number) => (mm / 25.4) * 96;

const paperSizes = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  a6: { width: 105, height: 148 },
  '4x6': { width: 101.6, height: 152.4 },
};

const toolboxItems = [
  { type: 'text', label: 'نص', icon: Type, content: 'نص', defaultWidth: 150, defaultHeight: 30 },
  { type: 'barcode', label: 'باركود', icon: ScanBarcode, content: 'orderId', defaultWidth: 150, defaultHeight: 50 },
  { type: 'image', label: 'صورة/شعار', icon: ImageIcon, content: '', defaultWidth: 100, defaultHeight: 50 },
  { type: 'shape', label: 'شكل', icon: Shapes, content: 'مربع', defaultWidth: 100, defaultHeight: 100 },
];

const dataFields = [
  { value: '{{recipient}}', label: 'اسم المستلم' },
  { value: '{{phone}}', label: 'هاتف المستلم' },
  { value: '{{address}}', label: 'العنوان الكامل' },
  { value: '{{city}}', label: 'المدينة' },
  { value: '{{cod}}', label: 'قيمة التحصيل' },
  { value: '{{merchant}}', label: 'اسم التاجر' },
  { value: '{{date}}', label: 'التاريخ' },
  { value: '{{orderId}}', label: 'رقم الطلب' },
  { value: '{{notes}}', label: 'الملاحظات' },
];

// --- Sub-components ---

const DraggableItem = ({ element, selected, onSelect, onUpdate, isOverlay = false }: {
  element: PolicyElement;
  selected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onUpdate: (id: string, updates: Partial<PolicyElement>) => void;
  isOverlay?: boolean;
}) => {
  const handleResizeStop: ResizeCallback = (e, direction, ref, d) => {
    onUpdate(element.id, {
      width: snapToGrid(element.width + d.width),
      height: snapToGrid(element.height + d.height),
    });
  };

  const handleDrag: DraggableCallback = (e, data) => {
    onUpdate(element.id, {
      x: snapToGrid(data.x),
      y: snapToGrid(data.y),
    });
  };

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return <div className="p-1 w-full h-full" style={{ fontFamily: 'inherit', fontSize: `${element.fontSize}px`, fontWeight: element.fontWeight, color: element.color }}>{element.content}</div>;
      case 'barcode':
        return <div className="p-1 w-full h-full flex flex-col items-center justify-center text-xs"> <ScanBarcode className="w-10 h-10" /> <p className='mt-1'>باركود: {element.content}</p> </div>;
      case 'image':
        return <ImageIcon className="w-full h-full text-muted-foreground p-2" />;
      case 'shape':
        return <div className="w-full h-full" style={{ backgroundColor: element.backgroundColor, opacity: element.opacity }} />;
    }
  };

  return (
    <Resizable
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      onResizeStop={handleResizeStop}
      onDragStop={handleDrag}
      enable={{
        top: selected, right: selected, bottom: selected, left: selected,
        topRight: selected, bottomRight: selected, bottomLeft: selected, topLeft: selected,
      }}
      className={`absolute cursor-move ${selected ? 'border-2 border-dashed border-primary z-50' : 'border-transparent'}`}
      style={{ zIndex: element.zIndex, borderColor: element.borderColor, borderWidth: element.borderWidth }}
      onClick={(e) => onSelect(element.id, e)}
    >
      {renderContent()}
    </Resizable>
  );
};

const ToolboxItem = ({ tool, onDragStart }: { tool: typeof toolboxItems[0]; onDragStart: (event: DragStartEvent) => void }) => {
    // This is a dummy component for the DragOverlay to pick up
    // The actual drag interaction will be handled by the DndContext
    return (
        <Button
            variant="outline"
            className="flex items-center justify-start gap-2 w-full h-12"
            onMouseDown={(e) => {
                // This simulates the start of a drag operation for dnd-kit
                // In a real scenario, you would manage this more cleanly
                // @ts-ignore
                onDragStart({ active: { id: `tool-${tool.type}`, data: { current: { tool } } } });
            }}
        >
            <tool.icon className="h-5 w-5 text-muted-foreground" />
            <span>{tool.label}</span>
        </Button>
    );
};


const PropertiesPanel = ({ element, onUpdate, onDelete }: { element: PolicyElement | null, onUpdate: (id: string, updates: Partial<PolicyElement>) => void, onDelete: (id: string) => void }) => {
    if (!element) return <Card className="p-4 text-center text-muted-foreground">حدد عنصراً لعرض خصائصه</Card>;

    return (
        <Card className="space-y-4 p-4">
            <CardTitle className="text-base">خصائص العنصر</CardTitle>
            <Separator/>
            <div className="grid grid-cols-2 gap-2">
                <div><Label>العرض</Label><Input type="number" value={element.width} onChange={e => onUpdate(element.id, { width: +e.target.value })} /></div>
                <div><Label>الارتفاع</Label><Input type="number" value={element.height} onChange={e => onUpdate(element.id, { height: +e.target.value })} /></div>
            </div>
            {element.type === 'text' && (
                <>
                    <div><Label>المحتوى</Label><Input value={element.content} onChange={e => onUpdate(element.id, { content: e.target.value })} /></div>
                    <div>
                        <Label>ربط ببيانات</Label>
                        <Select onValueChange={value => onUpdate(element.id, { content: value })}>
                            <SelectTrigger><SelectValue placeholder="اختر حقل بيانات..." /></SelectTrigger>
                            <SelectContent>{dataFields.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div><Label>حجم الخط</Label><Input type="number" value={element.fontSize} onChange={e => onUpdate(element.id, { fontSize: +e.target.value })} /></div>
                    <div><Label>اللون</Label><Input type="color" value={element.color} onChange={e => onUpdate(element.id, { color: e.target.value })} className="w-full h-10"/></div>
                    <div><Label>النمط</Label><Select value={element.fontWeight} onValueChange={value => onUpdate(element.id, { fontWeight: value as 'normal' | 'bold' })}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="normal">عادي</SelectItem><SelectItem value="bold">عريض</SelectItem></SelectContent></Select></div>
                </>
            )}
             {element.type === 'barcode' && (
                <div>
                    <Label>ربط الباركود بـ</Label>
                    <Select value={element.content} onValueChange={value => onUpdate(element.id, { content: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{dataFields.filter(f=>f.value.includes('Id')).map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
             )}
             {element.type === 'shape' && (
                 <div><Label>لون الخلفية</Label><Input type="color" value={element.backgroundColor} onChange={e => onUpdate(element.id, { backgroundColor: e.target.value })} className="w-full h-10"/></div>
             )}
            <div>
                <Label>الإطار</Label>
                <div className="flex gap-2">
                    <Input type="number" value={element.borderWidth} onChange={e => onUpdate(element.id, { borderWidth: +e.target.value })} placeholder="السماكة" />
                    <Input type="color" value={element.borderColor} onChange={e => onUpdate(element.id, { borderColor: e.target.value })} />
                </div>
            </div>
            <Button variant="destructive" onClick={() => onDelete(element.id)} className="w-full"><Trash2 className="mr-2"/>حذف العنصر</Button>
        </Card>
    );
};


// --- Main Page Component ---
export default function PolicyEditorPage() {
    const { toast } = useToast();
    const context = useSettings();
    const { settings: policySettings, updatePolicySetting, isHydrated } = context || {};
    
    // Fallback to default if context is not ready
    const [elements, setElements] = useState<PolicyElement[]>(policySettings?.elements || []);
    const [paperSize, setPaperSize] = useState<PolicySettings['paperSize']>(policySettings?.paperSize || 'custom');
    const [customDimensions, setCustomDimensions] = useState(policySettings?.customDimensions || { width: 75, height: 45 });
    const [margins, setMargins] = useState(policySettings?.margins || { top: 2, right: 2, bottom: 2, left: 2 });
    const [zoomLevel, setZoomLevel] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const importTemplateInputRef = useRef<HTMLInputElement>(null);

    const [templates, setTemplates] = useState<SavedTemplate[]>([]);
    
    const [modalElement, setModalElement] = useState<PolicyElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<SavedTemplate | null>(null);
    const [isPrintSampleDialogOpen, setIsPrintSampleDialogOpen] = useState(false);
    const printablePolicyRef = useRef<{ handleExportPDF: () => void }>(null);


    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Load from localStorage
    useEffect(() => {
        if (isHydrated && policySettings) {
            setElements(policySettings.elements);
            setPaperSize(policySettings.paperSize);
            setCustomDimensions(policySettings.customDimensions);
            setMargins(policySettings.margins);
        }
        try {
            const savedTemplates = JSON.parse(localStorage.getItem('policyTemplates') || '[]');
            setTemplates(savedTemplates);
        } catch {}
    }, [isHydrated, policySettings]);

    const paperDimensions = useMemo(() => {
        if (paperSize === 'custom') return { width: mmToPx(customDimensions.width), height: mmToPx(customDimensions.height) };
        const size = paperSizes[paperSize];
        return { width: mmToPx(size.width), height: mmToPx(size.height) };
    }, [paperSize, customDimensions]);

    // ----------- Element Management -----------
    const addElement = useCallback((tool: typeof toolboxItems[0]) => {
        if (!canvasRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        let newElement: PolicyElement = {
            id: nanoid(),
            type: tool.type as any,
            x: snapToGrid(canvasRect.width / 2 - ((tool.defaultWidth || 100) * zoomLevel) / 2),
            y: snapToGrid(canvasRect.height / 2 - ((tool.defaultHeight || 50) * zoomLevel) / 2),
            width: tool.defaultWidth,
            height: tool.defaultHeight,
            content: tool.content,
            zIndex: elements.length,
            fontSize: 14,
            fontWeight: 'normal',
            color: '#000000',
            borderColor: '#000000',
            borderWidth: 0,
            opacity: 1,
            backgroundColor: '#ffffff'
        };

        setElements(prev => [...prev, newElement]);
        setSelectedIds([newElement.id]);
    }, [elements, zoomLevel]);

    const handleUpdateElement = (id: string, updates: Partial<PolicyElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const handleDeleteElement = () => {
        setElements(p => p.filter(el => !selectedIds.includes(el.id)));
        setSelectedIds([]);
    };
    
    const handleDuplicate = () => {
        if (selectedIds.length === 0) return;
        const newElements: PolicyElement[] = [];
        const newSelectedIds: string[] = [];
        elements.forEach(el => {
            if(selectedIds.includes(el.id)){
                const newEl: PolicyElement = {
                    ...el,
                    id: nanoid(),
                    x: snapToGrid(el.x + 20),
                    y: snapToGrid(el.y + 20),
                    zIndex: elements.length + newElements.length,
                };
                newElements.push(newEl);
                newSelectedIds.push(newEl.id);
            }
        });
        setElements(prev => [...prev, ...newElements]);
        setSelectedIds(newSelectedIds);
    };

    const handleLayering = (type: 'front' | 'back' | 'forward' | 'backward') => {
        if (selectedIds.length !== 1) return;
        const selectedId = selectedIds[0];
        setElements(prev => {
            const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
            const index = sorted.findIndex(el => el.id === selectedId);
            if (index === -1) return prev;
            const [item] = sorted.splice(index, 1);
            switch (type) {
                case 'front': sorted.push(item); break;
                case 'back': sorted.unshift(item); break;
                case 'forward': sorted.splice(Math.min(index + 1, sorted.length), 0, item); break;
                case 'backward': sorted.splice(Math.max(index - 1, 0), 0, item); break;
            }
            return sorted.map((el, i) => ({ ...el, zIndex: i }));
        });
    };
    
    // DND Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;
        setActiveDragId(null);
        if (!over) return; // Dropped outside canvas

        if (String(active.id).startsWith('tool-')) {
            const toolType = String(active.id).replace('tool-', '');
            const tool = toolboxItems.find(t => t.type === toolType);
            if (tool) addElement(tool);
        } else {
            const element = elements.find(el => el.id === active.id);
            if(element) {
                handleUpdateElement(element.id, {
                    x: snapToGrid(element.x + delta.x),
                    y: snapToGrid(element.y + delta.y),
                });
            }
        }
    };
    
    // --- Canvas & Rendering ---
    if (!isHydrated) return null;
    
    const selectedElement = elements.find(el => el.id === selectedIds[0]) || null;
    
    const currentTemplate: SavedTemplate = useMemo(() => ({
        id: 'current_design',
        name: 'Current Design',
        elements,
        paperSize,
        customDimensions,
        margins,
      }), [elements, paperSize, customDimensions, margins]);

    return (
        <div className="space-y-6" onClick={() => setSelectedIds([])}>
             <PropertiesModal
                element={modalElement}
                onUpdate={handleUpdateElement}
                onDelete={handleDeleteElement}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>{editingTemplateId ? 'تحديث القالب' : 'حفظ قالب جديد'}</DialogTitle>
                    <DialogDescription>أدخل اسمًا مميزًا لهذا القالب.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                    <Label htmlFor="templateName">اسم القالب</Label>
                    <Input id="templateName" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                    </div>
                    <DialogFooter>
                    <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                    <Button onClick={() => {}}>حفظ القالب</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isPrintSampleDialogOpen} onOpenChange={setIsPrintSampleDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                    <DialogTitle>معاينة الطباعة</DialogTitle>
                    <DialogDescription>هذه معاينة لكيف ستبدو البوليصة عند الطباعة بالبيانات الفعلية.</DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted p-4 rounded-md flex items-center justify-center">
                    <PrintablePolicy ref={printablePolicyRef} orders={[]} template={currentTemplate} onExport={() => setIsPrintSampleDialogOpen(false)} />
                    </div>
                    <DialogFooter>
                    <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                    <Button onClick={() => printablePolicyRef.current?.handleExportPDF()}>
                        <Save className="ml-2 h-4 w-4 inline" /> طباعة
                    </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>الأدوات</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                {toolboxItems.map(tool => (
                                    <ToolboxItem key={tool.label} tool={tool} onDragStart={handleDragStart} />
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>القوالب المحفوظة</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-2">
                                <Button size="sm" variant="secondary" onClick={() => {}}>حفظ التصميم الحالي</Button>
                                <Button size="sm" variant="outline" onClick={() => importTemplateInputRef.current?.click()}>استيراد</Button>
                                <input id="import-template-input" ref={importTemplateInputRef} type="file" accept=".json" className="hidden" onChange={()=>{}} />
                                </div>
                                {templates.map(template => (
                                <div key={template.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <Button variant="link" className="p-0 h-auto" onClick={() => {}}>{template.name}</Button>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => {}}>تعديل</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => {}}>تصدير</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => {}} className="text-destructive">حذف</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-6 space-y-6">
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                            <CardTitle>لوحة التصميم</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => setZoomLevel(z => Math.max(0.2, z - 0.1))}><ZoomOut /></Button>
                                <span className="text-sm font-semibold w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                                <Button variant="outline" size="icon" onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))}><ZoomIn /></Button>
                                 <Button variant="secondary" onClick={() => {setIsPrintSampleDialogOpen(true)}}>معاينة وطباعة</Button>
                            </div>
                            </CardHeader>
                             <CardContent className="flex justify-center items-center bg-muted p-8 rounded-lg overflow-auto min-h-[70vh]">
                                <div id="canvas" ref={canvasRef} className="relative bg-white rounded-md shadow-inner" style={{ width: paperDimensions.width, height: paperDimensions.height, transform: `scale(${zoomLevel})` }}>
                                    <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
                                        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                                        backgroundImage: `linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)`
                                    }} />
                                    {elements.sort((a,b) => a.zIndex - b.zIndex).map(el => (
                                        <DraggableItem key={el.id} element={el} selected={selectedIds.includes(el.id)} onSelect={(id, e) => { e.stopPropagation(); setSelectedIds([id]); }} onUpdate={handleUpdateElement} />
                                    ))}
                                </div>
                                <DragOverlay>
                                    {activeDragId && activeDragId.startsWith('tool-') ? 
                                    <div className="bg-primary/20 border-2 border-dashed border-primary rounded-md p-4 flex items-center justify-center gap-2">
                                        <ImageIcon className="h-5 w-5" /><span>{toolboxItems.find(t=>`tool-${t.type}` === activeDragId)?.label}</span>
                                    </div>
                                    : activeDragId ?
                                    <DraggableItem element={elements.find(el => el.id === activeDragId)!} selected={true} onSelect={()=>{}} onUpdate={()=>{}} isOverlay />
                                    : null}
                                </DragOverlay>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="lg:col-span-3 space-y-6">
                        <PropertiesPanel element={selectedElement} onUpdate={handleUpdateElement} onDelete={()=>{}} />
                    </div>
                </div>
            </DndContext>
        </div>
    );
}

const PropertiesModal = ({ element, open, onOpenChange, onUpdate, onDelete }: {
    element: PolicyElement | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: string, updates: Partial<PolicyElement>) => void;
    onDelete: (id: string) => void;
  }) => {
    if (!element) return null;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>تعديل خصائص العنصر</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <PropertiesPanel element={element} onUpdate={onUpdate} onDelete={onDelete} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
