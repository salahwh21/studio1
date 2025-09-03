

'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect, forwardRef } from 'react';
import Link from 'next/link';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Download,
  Image as ImageIcon,
  MoreVertical,
  PlusCircle,
  Save,
  ScanBarcode,
  Shapes,
  Type,
  Upload,
  ZoomIn,
  ZoomOut,
  Palette,
  Bold,
  Italic,
  Underline,
  AlignVerticalSpaceAround,
  Printer as PrinterIcon,
  LayoutGrid,
  Trash,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  ArrowLeft,
  MousePointerSquare,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import Draggable, { type DraggableEvent, type DraggableData } from 'react-draggable';
import { Resizable, type ResizableProps } from 're-resizable';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSettings, type PolicySettings, type PolicyElement, type SavedTemplate, readyTemplates } from '@/contexts/SettingsContext';
import { Separator } from '@/components/ui/separator';
import { PrintablePolicy } from '@/components/printable-policy';
import { useOrdersStore } from '@/store/orders-store';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/icon';
import { ScrollArea } from '@/components/ui/scroll-area';


// --- Constants & Helpers ---

const GRID_SIZE = 5;
const SNAP_THRESHOLD = 6;
const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;
const mmToPx = (mm: number) => (mm / 25.4) * 96;

const paperSizes: Record<string, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  a6: { width: 105, height: 148 },
  '4x6': { width: 101.6, height: 152.4 },
};

const toolboxItems = [
    { type: 'text', label: 'نص', icon: Type, content: 'نص', defaultWidth: 150, defaultHeight: 30 },
    { type: 'barcode', label: 'باركود', icon: ScanBarcode, content: '{{orderId}}', defaultWidth: 150, defaultHeight: 50 },
    { type: 'image', label: 'صورة/شعار', icon: ImageIcon, content: '{{company_logo}}', defaultWidth: 100, defaultHeight: 50 },
    { type: 'shape', label: 'شكل', icon: Shapes, content: 'مربع', defaultWidth: 100, defaultHeight: 100 },
];

const dataFields = [
  { value: '{{recipient}}', label: 'اسم المستلم' },
  { value: '{{phone}}', label: 'هاتف المستلم' },
  { value: '{{address}}', label: 'العنوان الكامل' },
  { value: '{{city}}', label: 'المدينة' },
  { value: '{{region}}', label: 'المنطقة' },
  { value: '{{cod}}', label: 'قيمة التحصيل' },
  { value: '{{merchant}}', label: 'اسم التاجر' },
  { value: '{{date}}', label: 'التاريخ' },
  { value: '{{orderId}}', label: 'رقم الطلب' },
  { value: '{{referenceNumber}}', label: 'الرقم المرجعي' },
  { value: '{{driver}}', label: 'اسم السائق' },
  { value: '{{source}}', label: 'مصدر الطلب' },
  { value: '{{items}}', label: 'المنتجات' },
  { value: '{{notes}}', label: 'الملاحظات' },
  { value: '{{company_logo}}', label: 'شعار الشركة' },
];

// --- Sub-components ---

const PolicyElementComponent = forwardRef(({ element }: { element: PolicyElement }, ref: React.Ref<HTMLDivElement>) => {
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return <div className="p-1 w-full h-full" style={{ fontFamily: 'inherit', fontSize: `${element.fontSize}px`, fontWeight: element.fontWeight as any, color: element.color, textAlign: element.textAlign as any, fontStyle: element.fontStyle as any }}>{element.content}</div>;
      case 'barcode':
        return <div className="p-1 w-full h-full flex flex-col items-center justify-center text-xs"> <ScanBarcode className="w-10 h-10" /> <p className='mt-1'>باركود: {element.content}</p> </div>;
      case 'image':
        if (element.content) {
          return <img src={element.content} alt="logo" className="w-full h-full object-contain" />;
        }
        return <ImageIcon className="w-full h-full text-muted-foreground p-2" />;
      case 'shape':
        return <div className="w-full h-full" style={{ backgroundColor: element.backgroundColor, opacity: element.opacity }} />;
      default: return null;
    }
  };

  return (
    <div
      ref={ref}
      className="w-full h-full"
      style={{ borderColor: element.borderColor, borderWidth: `${element.borderWidth}px`, borderRadius: `${element.borderRadius}px` }}
    >
      {renderContent()}
    </div>
  );
});
PolicyElementComponent.displayName = 'PolicyElementComponent';


const PropertiesPanel = ({ element, onUpdate }: { 
    element: PolicyElement | null; 
    onUpdate: (id: string, updates: Partial<PolicyElement>) => void;
}) => {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0] && element) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                onUpdate(element.id, { content: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <Card>
            <CardHeader><CardTitle className='text-base'>خصائص العنصر</CardTitle></CardHeader>
            <CardContent>
                {!element ? (
                    <div className="text-center text-muted-foreground py-10">
                        <Icon name="MousePointerSquare" className="mx-auto h-8 w-8 mb-2" />
                        <p>حدد عنصرًا لتعديل خصائصه</p>
                    </div>
                ) : (
                    <ScrollArea className="h-96 pr-3">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>العرض (px)</Label><Input type="number" value={element.width} onChange={e => onUpdate(element.id, { width: +e.target.value })} /></div>
                                <div><Label>الارتفاع (px)</Label><Input type="number" value={element.height} onChange={e => onUpdate(element.id, { height: +e.target.value })} /></div>
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
                                    <div><Label>حجم الخط (px)</Label><Input type="number" value={element.fontSize} onChange={e => onUpdate(element.id, { fontSize: +e.target.value })} /></div>
                                    <div><Label>اللون</Label><Input type="color" value={element.color} onChange={e => onUpdate(element.id, { color: e.target.value })} className="w-full h-10"/></div>
                                    <div className='flex items-center gap-1'>
                                        <Label>المحاذاة والنمط</Label>
                                        <Button variant={element.fontWeight === 'bold' ? 'secondary' : 'outline'} size="icon" onClick={() => onUpdate(element.id, { fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' })}><Bold/></Button>
                                        <Button variant={element.fontStyle === 'italic' ? 'secondary' : 'outline'} size="icon" onClick={() => onUpdate(element.id, { fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}><Italic/></Button>
                                        <Button variant={element.textAlign === 'left' ? 'secondary' : 'outline'} size="icon" onClick={() => onUpdate(element.id, { textAlign: 'left'})}><AlignLeft/></Button>
                                        <Button variant={element.textAlign === 'center' ? 'secondary' : 'outline'} size="icon" onClick={() => onUpdate(element.id, { textAlign: 'center'})}><AlignCenter/></Button>
                                        <Button variant={element.textAlign === 'right' ? 'secondary' : 'outline'} size="icon" onClick={() => onUpdate(element.id, { textAlign: 'right'})}><AlignRight/></Button>
                                    </div>
                                </>
                            )}
                            {element.type === 'barcode' && (
                                <div>
                                    <Label>ربط الباركود بـ</Label>
                                    <Select value={element.content} onValueChange={value => onUpdate(element.id, { content: value })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{dataFields.filter(f=>f.value.includes('Id') || f.value.includes('phone')).map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            )}
                            {element.type === 'image' && (
                                <div>
                                    <Label>رفع صورة</Label>
                                    <Input type="file" accept="image/*" onChange={handleImageUpload} />
                                </div>
                            )}
                            {element.type === 'shape' && (
                                <>
                                    <div><Label>لون الخلفية</Label><Input type="color" value={element.backgroundColor} onChange={e => onUpdate(element.id, { backgroundColor: e.target.value })} className="w-full h-10"/></div>
                                    <div><Label>الشفافية</Label><Slider value={[element.opacity || 1]} onValueChange={v => onUpdate(element.id, { opacity: v[0]})} max={1} step={0.1}/></div>
                                </>
                            )}
                            <div>
                                <Label>الإطار</Label>
                                <div className="flex gap-2">
                                    <Input type="number" value={element.borderWidth} onChange={e => onUpdate(element.id, { borderWidth: +e.target.value })} placeholder="السماكة" />
                                    <Input type="color" value={element.borderColor} onChange={e => onUpdate(element.id, { borderColor: e.target.value })} />
                                </div>
                            </div>
                            <div><Label>استدارة الحواف (px)</Label><Input type="number" value={element.borderRadius} onChange={e => onUpdate(element.id, { borderRadius: +e.target.value })} /></div>
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
};

const PageSettingsPanel = ({ paperSize, customDimensions, margins, onPaperSizeChange, onDimensionChange, onMarginChange }: {
    paperSize: PolicySettings['paperSize'];
    customDimensions: PolicySettings['customDimensions'];
    margins: PolicySettings['margins'];
    onPaperSizeChange: (size: PolicySettings['paperSize']) => void;
    onDimensionChange: (dim: 'width' | 'height', value: number) => void;
    onMarginChange: (margin: 'top' | 'right' | 'bottom' | 'left', value: number) => void;
}) => (
    <Card>
        <CardHeader><CardTitle className='text-base'>إعدادات الصفحة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="paper-size">مقاس الورق</Label>
                <Select value={paperSize} onValueChange={(val) => onPaperSizeChange(val as PolicySettings['paperSize'])}>
                    <SelectTrigger id="paper-size"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.keys(paperSizes).map(size => <SelectItem key={size} value={size}>{size.toUpperCase()}</SelectItem>)}
                        <SelectItem value="custom">مخصص</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {paperSize === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                    <div><Label>العرض (mm)</Label><Input type="number" value={customDimensions.width} onChange={e => onDimensionChange('width', +e.target.value)} /></div>
                    <div><Label>الارتفاع (mm)</Label><Input type="number" value={customDimensions.height} onChange={e => onDimensionChange('height', +e.target.value)} /></div>
                </div>
            )}
            <div>
                <Label>الهوامش (mm)</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div><Label className='text-xs'>الأعلى</Label><Input type="number" value={margins.top} onChange={e => onMarginChange('top', +e.target.value)} /></div>
                    <div><Label className='text-xs'>الأسفل</Label><Input type="number" value={margins.bottom} onChange={e => onMarginChange('bottom', +e.target.value)} /></div>
                    <div><Label className='text-xs'>اليمين</Label><Input type="number" value={margins.right} onChange={e => onMarginChange('right', +e.target.value)} /></div>
                    <div><Label className='text-xs'>اليسار</Label><Input type="number" value={margins.left} onChange={e => onMarginChange('left', +e.target.value)} /></div>
                </div>
            </div>
        </CardContent>
    </Card>
);

const PolicyDraggableItem = ({ element, onUpdate, onSelect, onDragStart, onDrag, onStop, isSelected }: {
  element: PolicyElement;
  onUpdate: (id: string, updates: Partial<PolicyElement>) => void;
  onSelect: (id: string, e: React.MouseEvent | React.TouchEvent) => void;
  onDragStart: (e: DraggableEvent, data: DraggableData) => void;
  onDrag: (e: DraggableEvent, data: DraggableData) => void;
  onStop: (e: DraggableEvent, data: DraggableData) => void;
  isSelected: boolean;
}) => {
    const nodeRef = useRef(null);

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: element.x, y: element.y }}
            onStart={onDragStart}
            onDrag={onDrag}
            onStop={onStop}
        >
            <Resizable
                ref={nodeRef}
                size={{ width: element.width, height: element.height }}
                className="absolute"
                onResizeStop={(e, dir, ref, d) => onUpdate(element.id, { width: snapToGrid(element.width + d.width), height: snapToGrid(element.height + d.height) })}
                onClick={(e) => onSelect(element.id, e)}
                enable={{
                    top: isSelected, right: isSelected, bottom: isSelected, left: isSelected,
                    topRight: isSelected, bottomRight: isSelected, bottomLeft: isSelected, topLeft: isSelected,
                }}
            >
                <div className={`w-full h-full cursor-move ${isSelected ? 'border-2 border-dashed border-primary' : ''}`}>
                    <PolicyElementComponent element={element} />
                </div>
            </Resizable>
        </Draggable>
    );
};


// --- Main Page Component ---
export default function PolicyEditorPage() {
    const { toast } = useToast();
    const { orders } = useOrdersStore();
    const context = useSettings();
    
    const { settings: policySettings, isHydrated, updatePolicySetting } = context;

    const [elements, setElements] = useState<PolicyElement[]>(policySettings?.policy.elements || []);
    const [paperSize, setPaperSize] = useState<PolicySettings['paperSize']>(policySettings?.policy.paperSize || 'custom');
    const [customDimensions, setCustomDimensions] = useState(policySettings?.policy.customDimensions || { width: 100, height: 150 });
    const [margins, setMargins] = useState(policySettings?.policy.margins || { top: 2, right: 2, bottom: 2, left: 2 });
    const [zoomLevel, setZoomLevel] = useState(0.8);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [smartGuides, setSmartGuides] = useState<{ x: number[], y: number[] }>({ x: [], y: [] });
    const canvasRef = useRef<HTMLDivElement>(null);
    const importTemplateInputRef = useRef<HTMLInputElement>(null);
    const dragStartPositions = useRef<Record<string, {x: number, y: number}>>({});

    const [templates, setTemplates] = useState<SavedTemplate[]>([]);
    
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<SavedTemplate | null>(null);
    const [isPrintSampleDialogOpen, setIsPrintSampleDialogOpen] = useState(false);
    const printablePolicyRef = useRef<{ handleExport: () => void; handleDirectPrint: (order: any, type: 'zpl' | 'escpos') => Promise<void> }>(null);
    

    // Load from localStorage
    useEffect(() => {
        if (isHydrated && policySettings) {
            setElements(policySettings.policy.elements);
            setPaperSize(policySettings.policy.paperSize);
            setCustomDimensions(policySettings.policy.customDimensions);
            setMargins(policySettings.policy.margins);
        }
        try {
            const savedTemplatesJson = localStorage.getItem('policyTemplates');
            if (savedTemplatesJson) {
                setTemplates(JSON.parse(savedTemplatesJson));
            } else {
                 setTemplates(readyTemplates); // Initialize with default if nothing is saved
            }
        } catch {}
    }, [isHydrated, policySettings]);

    const paperDimensions = useMemo(() => {
        if (!isHydrated || !customDimensions) return { width: mmToPx(100), height: mmToPx(150) };
        if (paperSize === 'custom') return { width: mmToPx(customDimensions.width), height: mmToPx(customDimensions.height) };
        const size = paperSizes[paperSize];
        if (!size) return { width: mmToPx(customDimensions.width), height: mmToPx(customDimensions.height) }; // Fallback
        return { width: mmToPx(size.width), height: mmToPx(size.height) };
    }, [paperSize, customDimensions, isHydrated]);

    // ----------- Element Management -----------
    const addElement = useCallback((tool: typeof toolboxItems[0]) => {
        if (!canvasRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;

        let newElement: PolicyElement = {
            id: nanoid(),
            type: tool.type as any,
            x: snapToGrid(centerX - tool.defaultWidth / 2),
            y: snapToGrid(centerY - tool.defaultHeight / 2),
            width: tool.defaultWidth,
            height: tool.defaultHeight,
            content: tool.content,
            zIndex: elements.length,
            fontSize: 14,
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#000000',
            borderColor: '#000000',
            borderWidth: 0,
            opacity: 1,
            backgroundColor: '#ffffff',
            textAlign: 'right',
            borderRadius: 0,
        };

        setElements(prev => [...prev, newElement]);
        setSelectedIds([newElement.id]);
    }, [elements.length]);

    const handleUpdateElement = (id: string, updates: Partial<PolicyElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };
    
    const handleBulkUpdateElements = (ids: string[], deltaX: number, deltaY: number) => {
        setElements(prev => prev.map(el => {
            if (ids.includes(el.id)) {
                const startPos = dragStartPositions.current[el.id];
                if (startPos) {
                    return { ...el, x: startPos.x + deltaX, y: startPos.y + deltaY };
                }
            }
            return el;
        }));
    };

    const handleDeleteElement = () => {
        if (selectedIds.length > 0) {
            setElements(p => p.filter(el => !selectedIds.includes(el.id)));
            setSelectedIds([]);
        }
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

    const handleDragStart = useCallback((e: DraggableEvent, data: DraggableData) => {
        const node = data.node.parentElement; // The <Resizable> element
        if (!node) return false;
        
        setTimeout(() => setIsDragging(true), 0);

        const elementId = node.id;
        
        if (!selectedIds.includes(elementId)) {
            setSelectedIds([elementId]);
            dragStartPositions.current = {
                [elementId]: { x: data.x, y: data.y },
            };
        } else {
            dragStartPositions.current = elements
                .filter(el => selectedIds.includes(el.id))
                .reduce((acc, el) => {
                    acc[el.id] = { x: el.x, y: el.y };
                    return acc;
                }, {} as Record<string, {x: number, y: number}>);
        }
    }, [elements, selectedIds]);

    const handleDrag = useCallback((e: DraggableEvent, data: DraggableData) => {
        const node = data.node.parentElement;
        if (!node) return;
        const elementId = node.id;

        const activeElementStartPos = dragStartPositions.current[elementId];
        if (!activeElementStartPos) return;

        const deltaX = data.x - activeElementStartPos.x;
        const deltaY = data.y - activeElementStartPos.y;

        const otherElements = elements.filter(el => !selectedIds.includes(el.id));
        const activeElements = elements.filter(el => selectedIds.includes(el.id));
        
        let finalDeltaX = deltaX;
        let finalDeltaY = deltaY;
        const newGuides = { x: new Set<number>(), y: new Set<number>() };

        activeElements.forEach(activeEl => {
            const currentX = dragStartPositions.current[activeEl.id].x + deltaX;
            const currentY = dragStartPositions.current[activeEl.id].y + deltaY;
            
            const activePoints = {
                x: [currentX, currentX + activeEl.width / 2, currentX + activeEl.width],
                y: [currentY, currentY + activeEl.height / 2, currentY + activeEl.height],
            };

            const canvasSnapPoints = {
                x: [mmToPx(margins.left), paperDimensions.width / 2, paperDimensions.width - mmToPx(margins.right)],
                y: [mmToPx(margins.top), paperDimensions.height / 2, paperDimensions.height - mmToPx(margins.bottom)],
            };
            
            for (let p_idx = 0; p_idx < 3; p_idx++) {
                for (let c_idx = 0; c_idx < 3; c_idx++) {
                    if (Math.abs(activePoints.x[p_idx] - canvasSnapPoints.x[c_idx]) < SNAP_THRESHOLD) {
                        finalDeltaX = canvasSnapPoints.x[c_idx] - dragStartPositions.current[activeEl.id].x - (activePoints.x[p_idx] - currentX);
                        newGuides.x.add(canvasSnapPoints.x[c_idx]);
                    }
                     if (Math.abs(activePoints.y[p_idx] - canvasSnapPoints.y[c_idx]) < SNAP_THRESHOLD) {
                        finalDeltaY = canvasSnapPoints.y[c_idx] - dragStartPositions.current[activeEl.id].y - (activePoints.y[p_idx] - currentY);
                        newGuides.y.add(canvasSnapPoints.y[c_idx]);
                    }
                }
            }
            
            otherElements.forEach(otherEl => {
                const otherPoints = {
                    x: [otherEl.x, otherEl.x + otherEl.width / 2, otherEl.x + otherEl.width],
                    y: [otherEl.y, otherEl.y + otherEl.height / 2, otherEl.y + otherEl.height],
                };

                for (let p_idx = 0; p_idx < 3; p_idx++) {
                    for (let o_idx = 0; o_idx < 3; o_idx++) {
                        if (Math.abs(activePoints.x[p_idx] - otherPoints.x[o_idx]) < SNAP_THRESHOLD) {
                            finalDeltaX = otherPoints.x[o_idx] - dragStartPositions.current[activeEl.id].x - (activePoints.x[p_idx] - currentX);
                            newGuides.x.add(otherPoints.x[o_idx]);
                        }
                        if (Math.abs(activePoints.y[p_idx] - otherPoints.y[o_idx]) < SNAP_THRESHOLD) {
                           finalDeltaY = otherPoints.y[o_idx] - dragStartPositions.current[activeEl.id].y - (activePoints.y[p_idx] - currentY);
                           newGuides.y.add(otherPoints.y[o_idx]);
                        }
                    }
                }
            });
        });
        
        setSmartGuides({ x: Array.from(newGuides.x), y: Array.from(newGuides.y) });
        handleBulkUpdateElements(selectedIds, snapToGrid(finalDeltaX), snapToGrid(finalDeltaY));

    }, [elements, selectedIds, margins, paperDimensions]);

    const handleStopDrag = useCallback((e: DraggableEvent, data: DraggableData) => {
        setTimeout(() => setIsDragging(false), 0);
        setSmartGuides({ x: [], y: [] });
        const node = data.node.parentElement;
        if (!node) return;
        
        const elementId = node.id;
        const startPos = dragStartPositions.current[elementId];

        if(startPos) {
             const deltaX = data.x - startPos.x;
             const deltaY = data.y - startPos.y;
             handleBulkUpdateElements(selectedIds, snapToGrid(deltaX), snapToGrid(deltaY));
        }
        
        dragStartPositions.current = {};
    }, [selectedIds]);
    
    const selectedElement = useMemo(() => elements.find(el => el.id === selectedIds[0]), [elements, selectedIds]);
    

    // --- Template Management ---
    const saveTemplatesToStorage = (newTemplates: SavedTemplate[]) => {
        localStorage.setItem('policyTemplates', JSON.stringify(newTemplates));
        setTemplates(newTemplates);
    };

    const handleSaveTemplate = () => {
        if (!templateName) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم للقالب.' });
            return;
        }

        const templateData: Omit<SavedTemplate, 'id'> = {
            name: templateName,
            elements, paperSize, customDimensions, margins
        };

        let newTemplates;
        if(editingTemplateId) {
             newTemplates = templates.map(t => t.id === editingTemplateId ? { ...templateData, id: editingTemplateId } : t);
        } else {
            const newTemplate: SavedTemplate = { ...templateData, id: nanoid() };
            newTemplates = [...templates, newTemplate];
        }
        
        saveTemplatesToStorage(newTemplates);
        toast({ title: "تم الحفظ", description: "تم حفظ القالب بنجاح." });
        setIsSaveDialogOpen(false);
        setTemplateName('');
        setEditingTemplateId(null);
    };
    
    const handleLoadTemplate = (template: SavedTemplate) => {
        setElements(template.elements);
        setPaperSize(template.paperSize);
        setCustomDimensions(template.customDimensions);
        setMargins(template.margins);
        toast({ title: 'تم التحميل', description: `تم تحميل قالب "${template.name}".`});
    };
    
    const handleConfirmDelete = () => {
        if (templateToDelete) {
            const newTemplates = templates.filter(t => t.id !== templateToDelete.id);
            saveTemplatesToStorage(newTemplates);
            toast({ title: "تم الحذف", description: "تم حذف القالب." });
            setTemplateToDelete(null);
        }
    };
    
    const handleExportTemplate = () => {
        const currentDesign: SavedTemplate = {
            id: 'exported-template', name: 'قالب مُصَدَّر', elements, paperSize, customDimensions, margins
        };

        const dataStr = JSON.stringify(currentDesign, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `template_${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    
    const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read.");

                const importedTemplate: SavedTemplate = JSON.parse(text);
                if (importedTemplate.elements && importedTemplate.paperSize) {
                    handleLoadTemplate(importedTemplate);
                    toast({ title: 'تم استيراد القالب بنجاح' });
                } else {
                    throw new Error("Invalid template format.");
                }
            } catch (err) {
                 toast({ variant: 'destructive', title: 'فشل الاستيراد', description: 'الملف غير صالح أو تالف.' });
            }
        };
        reader.readAsText(file);
    };

    if (!isHydrated) return null;
    
    const currentTemplate: SavedTemplate = useMemo(() => ({
        id: 'current_design',
        name: 'Current Design',
        elements,
        paperSize,
        customDimensions,
        margins,
      }), [elements, paperSize, customDimensions, margins]);

  return (
    <div className="space-y-6" onClick={(e) => { if (!isDragging) { e.stopPropagation(); setSelectedIds([]); } }}>
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
                <Button onClick={handleSaveTemplate}>حفظ القالب</Button>
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
                    <PrintablePolicy ref={printablePolicyRef} orders={orders.length > 0 ? [orders[0]] : []} template={currentTemplate} />
                </div>
                 <DialogFooter className="justify-start gap-2">
                    <Button onClick={() => printablePolicyRef.current?.handleExport()}>
                        <Save className="ml-2 h-4 w-4 inline" /> طباعة PDF
                    </Button>
                    <Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(orders.length > 0 ? orders[0] : null, 'zpl')}>
                        <PrinterIcon className="ml-2 h-4 w-4 inline" /> طباعة ZPL
                    </Button>
                     <Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(orders.length > 0 ? orders[0] : null, 'escpos')}>
                        <PrinterIcon className="ml-2 h-4 w-4 inline" /> طباعة ESC/POS
                    </Button>
                    <DialogClose asChild><Button variant="outline" className="mr-auto">إلغاء</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
            <AlertDialogContent>
                 <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                    <AlertDialogDescription>هل أنت متأكد من حذف قالب "{templateToDelete?.name}"؟</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Card>
            <CardHeader className="flex-row justify-between items-start">
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">محرر البوليصة</CardTitle>
                    <CardDescription className="mt-1">اسحب وأفلت العناصر لتصميم البوليصة. انقر على عنصر لتعديل خصائصه.</CardDescription>
                </div>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/settings/general">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
        </Card>
        
        <Card>
            <CardContent className="p-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium whitespace-nowrap">إضافة:</Label>
                        {toolboxItems.map(tool => (
                             <Button key={tool.label} variant="outline" size="sm" className="flex items-center gap-2 h-8" onClick={() => addElement(tool)}>
                                <tool.icon className="h-4 w-4 text-muted-foreground" />
                                <span>{tool.label}</span>
                            </Button>
                        ))}
                    </div>

                    <Separator orientation='vertical' className="h-6 hidden md:block mx-2" />
                    
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setZoomLevel(z => Math.max(0.2, z - 0.1))}><ZoomOut className="h-5 w-5"/></Button>
                        <span className="text-sm font-semibold w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <Button variant="ghost" size="icon" onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))}><ZoomIn className="h-5 w-5"/></Button>
                    </div>

                    <Separator orientation='vertical' className="h-6 hidden md:block mx-2" />

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleLayering('front')} disabled={selectedIds.length !== 1}><ChevronsUp /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleLayering('forward')} disabled={selectedIds.length !== 1}><ChevronUp /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleLayering('backward')} disabled={selectedIds.length !== 1}><ChevronDown /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleLayering('back')} disabled={selectedIds.length !== 1}><ChevronsDown /></Button>
                    </div>
                    
                    <Separator orientation='vertical' className="h-6 hidden md:block mx-2" />

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleDuplicate} disabled={selectedIds.length === 0}><Copy /></Button>
                        <Button variant="ghost" size="icon" onClick={handleDeleteElement} disabled={selectedIds.length === 0}><Trash /></Button>
                    </div>
                    
                    <div className="flex items-center gap-2 md:mr-auto">
                        <Button variant="secondary" onClick={() => {setIsPrintSampleDialogOpen(true)}}> <PrinterIcon className="w-4 h-4 ml-1"/> معاينة وطباعة</Button>
                    </div>
                </div>
            </CardContent>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                 <PropertiesPanel
                    element={selectedElement || null}
                    onUpdate={handleUpdateElement}
                />
                 <PageSettingsPanel 
                    paperSize={paperSize}
                    customDimensions={customDimensions}
                    margins={margins}
                    onPaperSizeChange={setPaperSize}
                    onDimensionChange={(dim, val) => setCustomDimensions(prev => ({...prev, [dim]: val}))}
                    onMarginChange={(margin, val) => setMargins(prev => ({...prev, [margin]: val}))}
                />
                <Card>
                    <CardHeader><CardTitle className='text-base'>القوالب</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                            <Button size="sm" variant="secondary" onClick={() => { setEditingTemplateId(null); setTemplateName(''); setIsSaveDialogOpen(true); }}>حفظ الحالي</Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline"><MoreVertical className="w-4 h-4"/></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => importTemplateInputRef.current?.click()}>
                                        <Upload className="ml-2 h-4 w-4"/> استيراد قالب
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleExportTemplate}>
                                        <Download className="ml-2 h-4 w-4"/> تصدير الحالي
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <input id="import-template-input" ref={importTemplateInputRef} type="file" accept=".json" onChange={handleImportTemplate} className="hidden" />
                        </div>
                        <ScrollArea className="h-48">
                        {templates.map(template => (
                        <div key={template.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <Button variant="link" className="p-0 h-auto" onClick={() => handleLoadTemplate(template)}>{template.name}</Button>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => {setEditingTemplateId(template.id); setTemplateName(template.name); handleLoadTemplate(template); setIsSaveDialogOpen(true); }}>تحديث</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => setTemplateToDelete(template)} className="text-destructive">حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        ))}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-9 space-y-6">
                <Card>
                     <CardContent className="flex justify-center items-center bg-muted p-8 rounded-lg overflow-auto min-h-[70vh]">
                        <div
                            className="relative"
                            style={{ 
                                width: paperDimensions.width, 
                                height: paperDimensions.height,
                                transform: `scale(${zoomLevel})`, 
                                transformOrigin: 'top center' 
                            }}
                        >
                             <div 
                                id="canvas" 
                                ref={canvasRef} 
                                className="absolute bg-white rounded-md shadow-inner" 
                                style={{ 
                                    width: paperDimensions.width, 
                                    height: paperDimensions.height,
                                }}
                                onClick={(e) => {
                                    if(e.target === e.currentTarget){
                                        setSelectedIds([]);
                                    }
                                }}
                            >
                                {isDragging && smartGuides.x.map((x, i) => <div key={`sgx-${i}`} className="absolute top-0 h-full w-px bg-red-500 z-50" style={{ left: x }} />)}
                                {isDragging && smartGuides.y.map((y, i) => <div key={`sgy-${i}`} className="absolute left-0 w-full h-px bg-red-500 z-50" style={{ top: y }} />)}


                                <div 
                                    aria-hidden 
                                    className="absolute inset-0 pointer-events-none" 
                                    style={{
                                        borderStyle: 'dashed',
                                        borderWidth: '1px',
                                        borderColor: '#cccccc',
                                        top: `${mmToPx(margins.top)}px`,
                                        left: `${mmToPx(margins.left)}px`,
                                        bottom: `${mmToPx(margins.bottom)}px`,
                                        right: `${mmToPx(margins.right)}px`,
                                    }} 
                                />
                                <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
                                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                                    backgroundImage: `linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)`
                                }} />
                                {elements.map(el => (
                                    <Draggable
                                        key={el.id}
                                        nodeRef={el.ref}
                                        position={{ x: el.x, y: el.y }}
                                        onStart={(e, data) => {
                                            const node = el.ref?.current;
                                            if (!node) return false;
                                            handleDragStart(e, data);
                                        }}
                                        onDrag={handleDrag}
                                        onStop={handleStopDrag}
                                    >
                                        <Resizable
                                            ref={el.ref}
                                            id={el.id}
                                            size={{ width: el.width, height: el.height }}
                                            className="absolute"
                                            onResizeStop={(e, dir, ref, d) => handleUpdateElement(el.id, { width: snapToGrid(el.width + d.width), height: snapToGrid(el.height + d.height) })}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const event = e as React.MouseEvent;
                                                if (event.metaKey || event.ctrlKey) {
                                                    setSelectedIds(prev => prev.includes(el.id) ? prev.filter(i => i !== id) : [...prev, el.id]);
                                                } else {
                                                    setSelectedIds([el.id]);
                                                }
                                            }}
                                            enable={{
                                                top: selectedIds.includes(el.id), right: selectedIds.includes(el.id), bottom: selectedIds.includes(el.id), left: selectedIds.includes(el.id),
                                                topRight: selectedIds.includes(el.id), bottomRight: selectedIds.includes(el.id), bottomLeft: selectedIds.includes(el.id), topLeft: selectedIds.includes(el.id),
                                            }}
                                        >
                                            <div className={`w-full h-full cursor-move ${selectedIds.includes(el.id) ? 'border-2 border-dashed border-primary' : ''}`}>
                                                <PolicyElementComponent element={el} />
                                            </div>
                                        </Resizable>
                                    </Draggable>
                                ))}
                            </div>
                        </div>
                     </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
