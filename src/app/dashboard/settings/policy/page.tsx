

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
    Save,
    Trash2,
    Edit,
    BringToFront,
    SendToBack,
    Copy,
    AlertTriangle,
    Wand2,
    Printer,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSettings, type PolicySettings } from '@/contexts/SettingsContext';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// ---------- Types ----------
type ElementType = 'text' | 'image' | 'barcode' | 'rect' | 'line' | 'table';
type FontWeight = 'normal' | 'bold';

type TableCellData = { id: string; content: string };
type TableRowData = { id: string; cells: TableCellData[] };

type PolicyElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  zIndex: number;
  fontSize?: number;
  fontWeight?: FontWeight;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  backgroundColor?: string;
  // Table specific properties
  rowCount?: number;
  colCount?: number;
  tableData?: TableRowData[];
  headers?: string[];
};

type SavedTemplate = {
  id: string;
  name: string;
  elements: PolicyElement[];
  paperSize: PolicySettings['paperSize'];
  customDimensions: { width: number; height: number };
  margins: { top: number; right: number; bottom: number; left: number };
};

type DesignError = {
    elementId: string;
    message: string;
}


const GRID_SIZE = 8;
const DPI = 96; // 96 pixels per inch

type PaperSize = { width: number; height: number; label: string };
const paperSizes: Record<string, PaperSize> = {
  a4: { width: 210, height: 297, label: 'A4 (210×297mm)' },
  a5: { width: 148, height: 210, label: 'A5 (148×210mm)' },
  label_4x6: { width: 101.6, height: 152.4, label: 'Label 4×6 in' },
  label_4x4: { width: 4 * 25.4, height: 4 * 25.4, label: 'Label 4×4 in' },
  custom: { width: 75, height: 45, label: 'حجم مخصص' },
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
    { type: 'text', label: 'قيمة التحصيل', icon: 'HandCoins', content: '{cod_amount}', defaultWidth: 100, defaultHeight: 32 },
    { type: 'barcode', label: 'باركود', icon: 'Barcode', content: '{order_id}', defaultWidth: 150, defaultHeight: 50 },
    { type: 'text', label: 'رقم الطلب', icon: 'ClipboardList', content: '{order_id}', defaultWidth: 150, defaultHeight: 24 },
    { type: 'text', label: 'الرقم المرجعي', icon: 'ClipboardCheck', content: '{reference_id}', defaultWidth: 150, defaultHeight: 24 },
    { type: 'text', label: 'ملاحظات الطلب', icon: 'Clipboard', content: '{order_notes}', defaultWidth: 200, defaultHeight: 60 },
    { type: 'table', label: 'جدول', icon: 'Table', content: '', defaultWidth: 320, defaultHeight: 120 },
    { type: 'text', label: 'نص', icon: 'Type', content: 'نص جديد', defaultWidth: 120, defaultHeight: 24 },
    { type: 'rect', label: 'مستطيل', icon: 'RectangleHorizontal', content: '', defaultWidth: 160, defaultHeight: 80 },
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
    color: el.type === 'line' ? 'transparent' : (el.color ?? '#111827'),
    borderWidth: el.type === 'rect' ? el.borderWidth ?? 1 : 0,
    borderColor: el.borderColor ?? 'transparent',
    borderStyle: 'solid',
    opacity: el.opacity ?? 1,
    backgroundColor: el.type === 'line' ? (el.color ?? '#000000') : el.backgroundColor,
    textAlign: 'center',
    padding: 4,
    wordBreak: 'break-word',
  };

  if (el.type === 'text') return <div style={baseStyle}>{el.content || 'نص جديد'}</div>;
  if (el.type === 'barcode') return <div style={baseStyle}><Icon name="Barcode" className="h-8 w-8" /></div>;
  if (el.type === 'image') return <div style={baseStyle}><Icon name="Image" className="h-8 w-8 text-muted-foreground" /></div>;
  if (el.type === 'rect') return <div style={baseStyle}></div>;
  if (el.type === 'line') return <div style={{...baseStyle, padding: 0}}></div>;
  if (el.type === 'table') {
    const { headers = [], tableData = [], borderColor = '#000000', fontSize = 12, fontWeight = 'bold' } = el;
    return (
        <div style={{ ...baseStyle, display: 'block', padding: 0, alignItems: 'stretch', justifyContent: 'stretch' }}>
            <table className="w-full h-full border-collapse" style={{fontSize: `${fontSize}px`}}>
                <thead>
                    <tr style={{fontWeight: fontWeight}}>
                        {headers.map((header, i) => (
                            <th key={i} className="border p-1 overflow-hidden" style={{borderColor}}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row) => (
                        <tr key={row.id}>
                            {row.cells.map((cell) => (
                                <td key={cell.id} className="border p-1" style={{borderColor}}>{cell.content}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
  }
  
  return null;
}

// ---------- Canvas item ----------
const DraggableItem = ({ element, selected, onSelect, onResizeStop, onContextMenu, onDoubleClick }: {
  element: PolicyElement;
  selected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onResizeStop: (id: string, w: number, h: number) => void;
  onContextMenu: (event: React.MouseEvent, element: PolicyElement) => void;
  onDoubleClick: (element: PolicyElement) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id: element.id });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    outline: selected ? '2px solid hsl(var(--primary))' : 'none',
    outlineOffset: '2px',
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  if(isDragging) {
      style.visibility = 'hidden';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => onSelect(element.id, e)}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(element); }}
      onContextMenu={(e) => onContextMenu(e, element)}
    >
      <Resizable
          size={{ width: element.width, height: element.height }}
          onResizeStop={(_e, _dir, ref) => onResizeStop(element.id, snapToGrid(ref.offsetWidth), snapToGrid(ref.offsetHeight))}
          minWidth={element.type === 'line' ? GRID_SIZE : GRID_SIZE * 2}
          minHeight={element.type === 'line' ? 1 : GRID_SIZE * 2}
          grid={[GRID_SIZE, GRID_SIZE]}
          enable={{ top: true, right: true, bottom: true, left: true, topRight: true, bottomRight: true, bottomLeft: true, topLeft: true }}
          className="cursor-grab active:cursor-grabbing"
      >
          <div style={{ width: '100%', height: '100%' }}>
              <ElementContent el={element} />
          </div>
      </Resizable>
    </div>
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


// ---------- Properties Modal ----------
const PropertiesModal = ({ element, onUpdate, onDelete, open, onOpenChange }: {
    element: PolicyElement | null;
    onUpdate: (id: string, updates: Partial<PolicyElement>) => void;
    onDelete: (id: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    const [currentElement, setCurrentElement] = useState<PolicyElement | null>(null);

    useEffect(() => {
        if(element){
            setCurrentElement({...element});
        }
    }, [element]);
    
    if (!open || !currentElement) {
        return null;
    }

    const handleChange = (field: keyof PolicyElement, value: any) => {
        setCurrentElement(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleNumericChange = (field: keyof PolicyElement, value: string) => {
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
            handleChange(field, num);
        }
    };
    
    const handleFloatChange = (field: keyof PolicyElement, value: string) => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            handleChange(field, num);
        }
    };

    const handleTableDimensionChange = (dimension: 'colCount' | 'rowCount', value: number) => {
        if (value < 1 || value > 20) return;
    
        setCurrentElement(prev => {
            if (!prev) return null;
            const newElement = { ...prev, [dimension]: value };
    
            const newRowCount = dimension === 'rowCount' ? value : (prev.rowCount ?? 2);
            const newColCount = dimension === 'colCount' ? value : (prev.colCount ?? 2);
    
            // Adjust headers
            const currentHeaders = prev.headers ?? [];
            const newHeaders = Array.from({ length: newColCount }, (_, i) => currentHeaders[i] || `رأس ${i + 1}`);
            newElement.headers = newHeaders;
    
            // Adjust tableData
            const currentTableData = prev.tableData ?? [];
            const newTableData = Array.from({ length: newRowCount }, (_, rowIndex) => {
                const existingRow = currentTableData[rowIndex];
                const newCells = Array.from({ length: newColCount }, (_, colIndex) => {
                    const existingCell = existingRow?.cells[colIndex];
                    return existingCell || { id: nanoid(), content: '' };
                });
                return { id: existingRow?.id || nanoid(), cells: newCells };
            });
            newElement.tableData = newTableData;
    
            return newElement;
        });
    };
    
    const handleTableHeaderChange = (index: number, value: string) => {
        setCurrentElement(prev => {
            if (!prev || !prev.headers) return prev;
            const newHeaders = [...prev.headers];
            newHeaders[index] = value;
            return { ...prev, headers: newHeaders };
        });
    };
    
    const handleTableCellChange = (rowIndex: number, colIndex: number, value: string) => {
        setCurrentElement(prev => {
            if (!prev || !prev.tableData) return prev;
            const newTableData = JSON.parse(JSON.stringify(prev.tableData));
            newTableData[rowIndex].cells[colIndex].content = value;
            return { ...prev, tableData: newTableData };
        });
    };

    const handleSave = () => {
        if(currentElement) {
            onUpdate(currentElement.id, currentElement);
        }
        onOpenChange(false);
    }
    
    const handleDeleteAndClose = () => {
        if(currentElement) {
            onDelete(currentElement.id);
        }
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>خصائص: {currentElement.type}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {currentElement.type === 'text' && (
                        <div className="space-y-2"><Label>النص</Label><Textarea value={currentElement.content} onChange={(e) => handleChange('content', e.target.value)} /></div>
                    )}
                    {(currentElement.type === 'text' || currentElement.type === 'table') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>حجم الخط</Label><Input type="number" value={currentElement.fontSize ?? 14} onChange={(e) => handleNumericChange('fontSize', e.target.value)} /></div>
                            <div className="space-y-2"><Label>وزن الخط</Label><Select value={currentElement.fontWeight ?? 'normal'} onValueChange={(val: FontWeight) => handleChange('fontWeight', val)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">عادي</SelectItem><SelectItem value="bold">عريض</SelectItem></SelectContent></Select></div>
                        </div>
                    )}
                    {currentElement.type === 'table' && (
                        <div className="space-y-4 p-4 border rounded-md">
                            <h4 className="font-semibold">إعدادات الجدول</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>عدد الأعمدة</Label><Input type="number" value={currentElement.colCount ?? 2} onChange={(e) => handleTableDimensionChange('colCount', parseInt(e.target.value, 10))} /></div>
                                <div className="space-y-2"><Label>عدد الصفوف</Label><Input type="number" value={currentElement.rowCount ?? 2} onChange={(e) => handleTableDimensionChange('rowCount', parseInt(e.target.value, 10))} /></div>
                            </div>
                             <div className="space-y-2">
                                <Label>رؤوس الأعمدة</Label>
                                <div className="grid grid-cols-2 gap-2">
                                {(currentElement.headers ?? []).map((header, index) => (
                                    <Input key={index} value={header} onChange={(e) => handleTableHeaderChange(index, e.target.value)} placeholder={`رأس ${index + 1}`} />
                                ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>بيانات الخلايا</Label>
                                <div className="space-y-2">
                                {(currentElement.tableData ?? []).map((row, rowIndex) => (
                                    <div key={row.id} className="grid grid-cols-2 gap-2">
                                    {row.cells.map((cell, colIndex) => (
                                        <Input key={cell.id} value={cell.content} onChange={(e) => handleTableCellChange(rowIndex, colIndex, e.target.value)} placeholder={`صف ${rowIndex+1}, عمود ${colIndex+1}`} />
                                    ))}
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>X</Label><Input type="number" value={currentElement.x} onChange={(e) => handleNumericChange('x', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Y</Label><Input type="number" value={currentElement.y} onChange={(e) => handleNumericChange('y', e.target.value)} /></div>
                        <div className="space-y-2"><Label>العرض</Label><Input type="number" value={currentElement.width} onChange={(e) => handleNumericChange('width', e.target.value)} /></div>
                        <div className="space-y-2"><Label>الارتفاع</Label><Input type="number" value={currentElement.height} onChange={(e) => handleNumericChange('height', e.target.value)} /></div>
                    </div>
                    {(currentElement.type === 'text' || currentElement.type === 'line') && <div className="space-y-2"><Label>اللون</Label><Input type="color" value={currentElement.color ?? '#000000'} onChange={(e) => handleChange('color', e.target.value)} className="h-10 w-full p-1" /></div>}
                    {(currentElement.type === 'rect') && <div className="space-y-2"><Label>لون التعبئة</Label><Input type="color" value={currentElement.backgroundColor ?? '#ffffff'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="h-10 w-full p-1" /></div>}
                    {(currentElement.type === 'rect' || currentElement.type === 'table') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>لون الحد</Label><Input type="color" value={currentElement.borderColor ?? '#000000'} onChange={(e) => handleChange('borderColor', e.target.value)} className="h-10 w-full p-1" /></div>
                            <div className="space-y-2"><Label>عرض الحد</Label><Input type="number" value={currentElement.borderWidth ?? 1} onChange={(e) => handleNumericChange('borderWidth', e.target.value)} /></div>
                        </div>
                    )}
                    <div className="space-y-2"><Label>الشفافية</Label><Input type="number" step="0.1" min="0" max="1" value={currentElement.opacity ?? 1} onChange={(e) => handleFloatChange('opacity', e.target.value)} /></div>
                </div>
                <DialogFooter className="justify-between">
                    <Button variant="destructive" onClick={handleDeleteAndClose}><Trash2 className="ml-2 h-4 w-4" /> حذف</Button>
                    <div className="flex gap-2">
                        <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                        <Button onClick={handleSave}>حفظ التغييرات</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// ---------- Main component ----------
export default function PolicyEditorPage() {
  const { toast } = useToast();
  const context = useSettings();
  const { settings, updatePolicySetting, isHydrated } = context || {};
  const { paperSize = 'custom', customDimensions = { width: 75, height: 45 }, margins = { top: 2, right: 2, bottom: 2, left: 2 } } = settings?.policy || {};
  
  const [elements, setElements] = useState<PolicyElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const sensors = useSensors(useSensor(PointerSensor));

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, element: PolicyElement } | null>(null);
  const [modalElement, setModalElement] = useState<PolicyElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [designErrors, setDesignErrors] = useState<DesignError[]>([]);


  const paperDimensions = useMemo(() => {
    if (paperSize === 'custom') {
      return { width: mmToPx(customDimensions.width), height: mmToPx(customDimensions.height) };
    }
    const size = paperSizes[paperSize];
    return { width: mmToPx(size.width), height: mmToPx(size.height) };
  }, [paperSize, customDimensions]);
  
  const marginPx = useMemo(() => ({
    top: mmToPx(margins.top),
    right: mmToPx(margins.right),
    bottom: mmToPx(margins.bottom),
    left: mmToPx(margins.left),
  }), [margins]);

 const handleSmartLayout = () => {
    const { width: canvasWidth, height: canvasHeight } = paperDimensions;
    const { top, right, left, bottom } = marginPx;
    const printableWidth = canvasWidth - left - right;
    const printableHeight = canvasHeight - top - bottom;
  
    let newElements: PolicyElement[] = [];

    // Smart layout logic for A4 paper
    if (paperSize === 'a4' || paperSize === 'a5') {
        const headerHeight = snapToGrid(printableHeight * 0.15);
        const halfWidth = snapToGrid(printableWidth / 2 - GRID_SIZE / 2);
        const bodyY = top + headerHeight + GRID_SIZE;
        const bodyHeight = snapToGrid(printableHeight * 0.25);
        
        newElements = [
            { id: nanoid(), type: 'image', x: left, y: top, width: snapToGrid(printableWidth * 0.3), height: headerHeight - GRID_SIZE, content: '{company_logo}', zIndex: 1 },
            { id: nanoid(), type: 'barcode', x: canvasWidth - right - snapToGrid(printableWidth * 0.4), y: top, width: snapToGrid(printableWidth * 0.4), height: headerHeight - GRID_SIZE, content: '{order_id}', zIndex: 1 },
            { id: nanoid(), type: 'line', x: left, y: top + headerHeight, width: printableWidth, height: 2, zIndex: 0, color: '#000000', backgroundColor: '#000000' },
            { id: nanoid(), type: 'rect', x: left, y: bodyY, width: halfWidth, height: bodyHeight, content: '', zIndex: 0, borderColor: '#cccccc', borderWidth: 1 },
            { id: nanoid(), type: 'text', x: left + GRID_SIZE, y: bodyY + GRID_SIZE, width: halfWidth - (GRID_SIZE*2), height: 30, content: 'من (المرسل)', zIndex: 1, fontWeight: 'bold' },
            { id: nanoid(), type: 'text', x: left + GRID_SIZE, y: bodyY + 40, width: halfWidth - (GRID_SIZE*2), height: bodyHeight - 50, content: '{merchant_name}\n{merchant_phone}', zIndex: 1 },
            { id: nanoid(), type: 'rect', x: left + halfWidth + GRID_SIZE, y: bodyY, width: halfWidth, height: bodyHeight, content: '', zIndex: 0, borderColor: '#cccccc', borderWidth: 1 },
            { id: nanoid(), type: 'text', x: left + halfWidth + (GRID_SIZE*2), y: bodyY + GRID_SIZE, width: halfWidth - (GRID_SIZE*2), height: 30, content: 'إلى (المستلم)', zIndex: 1, fontWeight: 'bold' },
            { id: nanoid(), type: 'text', x: left + halfWidth + (GRID_SIZE*2), y: bodyY + 40, width: halfWidth - (GRID_SIZE*2), height: bodyHeight - 50, content: '{recipient_name}\n{recipient_address}\n{recipient_phone}', zIndex: 1 },
        ];
    } else { // Smart layout for labels (e.g., 4x6)
        const recipientInfoHeight = snapToGrid(printableHeight * 0.4);
        const barcodeHeight = snapToGrid(printableHeight * 0.25);
        newElements = [
            { id: nanoid(), type: 'text', x: left, y: top, width: printableWidth, height: 24, content: 'من: {merchant_name}', zIndex: 1, fontWeight: 'bold' },
            { id: nanoid(), type: 'text', x: left, y: top + 32, width: printableWidth, height: recipientInfoHeight, content: 'إلى: {recipient_name}\n{recipient_address}\n{recipient_phone}', zIndex: 1, fontSize: 16 },
            { id: nanoid(), type: 'barcode', x: left, y: top + 40 + recipientInfoHeight, width: printableWidth, height: barcodeHeight, content: '{order_id}', zIndex: 1 },
            { id: nanoid(), type: 'text', x: left, y: top + 48 + recipientInfoHeight + barcodeHeight, width: printableWidth, height: 32, content: 'المبلغ: {cod_amount}', zIndex: 1, fontSize: 20, fontWeight: 'bold' },
        ];
    }
    
    setElements(newElements);
    toast({ title: 'تم إنشاء التصميم', description: 'تم إنشاء تصميم احترافي بناءً على حجم الصفحة.' });
  };


  // --- Smart Features ---
  useEffect(() => {
    const errors: DesignError[] = [];
    elements.forEach(el => {
        // Boundary check
        if (el.x < marginPx.left || 
            el.y < marginPx.top || 
            (el.x + el.width) > (paperDimensions.width - marginPx.right) ||
            (el.y + el.height) > (paperDimensions.height - marginPx.bottom)) {
            errors.push({ elementId: el.id, message: `عنصر (${el.type}) خارج حدود الطباعة.` });
        }
        
        // Text overflow check (heuristic)
        if(el.type === 'text' && el.content) {
            const charCount = el.content.length;
            const area = el.width * el.height;
            const fontSize = el.fontSize || 14;
            // This is a very rough estimation. A better way would be to render to a hidden canvas.
            const estimatedAreaNeeded = charCount * (fontSize * 0.5) * fontSize;
            if(estimatedAreaNeeded > area * 1.5) {
                errors.push({ elementId: el.id, message: `النص قد يكون أكبر من المربع المخصص له.` });
            }
        }
    });
    setDesignErrors(errors);
  }, [elements, paperDimensions, marginPx]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIds.length === 0) return;

      const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
      if (!isArrowKey) return;

      e.preventDefault();
      const step = e.shiftKey ? GRID_SIZE * 5 : GRID_SIZE;

      setElements(prevElements =>
        prevElements.map(el => {
          if (selectedIds.includes(el.id)) {
            const newEl = { ...el };
            switch (e.key) {
              case 'ArrowUp':
                newEl.y = Math.max(0, newEl.y - step);
                break;
              case 'ArrowDown':
                newEl.y = Math.min(paperDimensions.height - newEl.height, newEl.y + step);
                break;
              case 'ArrowLeft':
                newEl.x = Math.max(0, newEl.x - step);
                break;
              case 'ArrowRight':
                newEl.x = Math.min(paperDimensions.width - newEl.width, newEl.x + step);
                break;
            }
            return newEl;
          }
          return el;
        })
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIds, elements, paperDimensions]);

  const addElement = useCallback((tool: typeof toolboxItems[0]) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    let newElement: PolicyElement = {
        id: nanoid(),
        type: tool.type as ElementType,
        x: snapToGrid(canvasRect.width / 2 - (tool.defaultWidth || 100) / 2),
        y: snapToGrid(canvasRect.height / 2 - (tool.defaultHeight || 50) / 2),
        width: tool.defaultWidth,
        height: tool.defaultHeight,
        content: tool.content,
        zIndex: elements.length,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        borderColor: '#000000',
        borderWidth: 1,
        opacity: 1,
        backgroundColor: '#ffffff'
    };

     if (tool.type === 'table') {
        const rowCount = 3;
        const colCount = 3;
        newElement = {
            ...newElement,
            rowCount,
            colCount,
            headers: Array.from({ length: colCount }, (_, i) => `رأس ${i + 1}`),
            tableData: Array.from({ length: rowCount }, () => ({
                id: nanoid(),
                cells: Array.from({ length: colCount }, () => ({ id: nanoid(), content: 'بيانات' }))
            }))
        };
    }

    setElements((prev) => [...prev, newElement]);
  }, [elements]);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, delta } = e;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setElements((items) =>
        items.map((item) => {
            if (item.id === active.id) {
                const newX = Math.max(0, Math.min(item.x + delta.x, canvasRect.width - item.width));
                const newY = Math.max(0, Math.min(item.y + delta.y, canvasRect.height - item.height));
                return { ...item, x: snapToGrid(newX), y: snapToGrid(newY) };
            }
            return item;
        })
    );
  }, []);
  
  const handleSelect = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedIds.length === 1 && selectedIds[0] === id) {
          return;
      }
      setSelectedIds([id]);
  }, [selectedIds]);
  
  const handleResizeStop = useCallback((id: string, w: number, h: number) => {
    setElements((p) => p.map((el) => (el.id === id ? { ...el, width: snapToGrid(w), height: snapToGrid(h) } : el)));
  }, []);

  const handleUpdateElement = (id: string, updates: Partial<PolicyElement>) => {
    setElements(prevElements => 
        prevElements.map(el => 
            el.id === id ? { ...el, ...updates } : el
        )
    );
  };
  
  const handleDeleteElement = (id: string) => {
      setElements(p => p.filter(el => el.id !== id));
      setSelectedIds(p => p.filter(selId => selId !== id));
  };
  
  const handleDoubleClickElement = (element: PolicyElement) => {
      setModalElement(element);
      setIsModalOpen(true);
  };

  const handleAlignment = (type: 'left' | 'h-center' | 'right' | 'top' | 'v-center' | 'bottom') => {
      if (selectedIds.length === 0) return;
      setElements(prev => {
          return prev.map(el => {
              if(!selectedIds.includes(el.id)) return el;
              
              const newEl = {...el};
              const canvasWidth = paperDimensions.width;
              const canvasHeight = paperDimensions.height;

              switch (type) {
                  case 'left': newEl.x = 0; break;
                  case 'h-center': newEl.x = (canvasWidth / 2) - (newEl.width / 2); break;
                  case 'right': newEl.x = canvasWidth - newEl.width; break;
                  case 'top': newEl.y = 0; break;
                  case 'v-center': newEl.y = (canvasHeight / 2) - (newEl.height / 2); break;
                  case 'bottom': newEl.y = canvasHeight - newEl.height; break;
              }
              return {...newEl, x: snapToGrid(newEl.x), y: snapToGrid(newEl.y)};
          });
      });
  };
  
  const handleLayering = (type: 'front' | 'back' | 'forward' | 'backward') => {
    if (selectedIds.length !== 1) return;
    const selectedId = selectedIds[0];

    setElements(prev => {
        const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
        const currentIndex = sorted.findIndex(el => el.id === selectedId);
        if (currentIndex === -1) return prev;

        let newElements = [...sorted];
        const [item] = newElements.splice(currentIndex, 1);

        switch (type) {
            case 'front': newElements.push(item); break;
            case 'back': newElements.unshift(item); break;
            case 'forward': newElements.splice(Math.min(currentIndex + 1, newElements.length), 0, item); break;
            case 'backward': newElements.splice(Math.max(currentIndex - 1, 0), 0, item); break;
        }

        return newElements.map((el, index) => ({ ...el, zIndex: index }));
    });
};

const handleDuplicate = () => {
    if (selectedIds.length === 0) return;
    const newElements: PolicyElement[] = [];
    const newSelectedIds: string[] = [];
    
    elements.forEach(el => {
        if(selectedIds.includes(el.id)){
            const newElement: PolicyElement = {
                ...el,
                id: nanoid(),
                x: snapToGrid(el.x + 20),
                y: snapToGrid(el.y + 20),
                zIndex: elements.length + newElements.length,
            };
            newElements.push(newElement);
            newSelectedIds.push(newElement.id);
        }
    });

    setElements(prev => [...prev, ...newElements]);
    setSelectedIds(newSelectedIds);
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
      paperSize: paperSize,
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
    if(updatePolicySetting) {
        updatePolicySetting('paperSize', template.paperSize);
        updatePolicySetting('customDimensions', template.customDimensions);
        updatePolicySetting('margins', template.margins);
    }
    toast({ title: 'تم التحميل', description: `تم تحميل قالب "${template.name}".` });
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('policyTemplates', JSON.stringify(updatedTemplates));
    toast({ title: 'تم الحذف', description: 'تم حذف القالب بنجاح.' });
  };
  
  const readyTemplates: Record<string, SavedTemplate> = {
    "a4_default": {
        id: "a4_default", name: "A4 احترافي", paperSize: "a4",
        customDimensions: { width: 210, height: 297 }, margins: { top: 10, right: 10, bottom: 10, left: 10 },
        elements: [
            { id: "1", type: "rect", x: 16, y: 16, width: 752, height: 112, zIndex: 0, content: "", borderColor: "#000000", borderWidth: 2, backgroundColor: "#f3f4f6", opacity: 1, color: '#000000', fontSize: 14, fontWeight: 'normal' },
            { id: "2", type: "text", x: 576, y: 24, width: 184, height: 40, zIndex: 1, content: "بوليصة شحن", fontSize: 24, fontWeight: "bold", color: "#000000", opacity: 1 },
            { id: "3", type: "image", x: 24, y: 24, width: 144, height: 56, zIndex: 1, content: "{company_logo}", opacity: 1 },
            { id: "4", type: "text", x: 24, y: 88, width: 200, height: 24, zIndex: 1, content: "اسم الشركة: {company_name}", fontSize: 12, color: "#000000", opacity: 1 },
            { id: "5", type: "barcode", x: 584, y: 72, width: 176, height: 48, zIndex: 1, content: "{order_id}", opacity: 1 },
            { id: "6", type: "rect", x: 16, y: 144, width: 376, height: 200, zIndex: 0, content: "", borderColor: "#000000", borderWidth: 1, backgroundColor: '#ffffff', opacity: 1 },
            { id: "7", type: "rect", x: 400, y: 144, width: 368, height: 200, zIndex: 0, content: "", borderColor: "#000000", borderWidth: 1, backgroundColor: '#ffffff', opacity: 1 },
            { id: "8", type: "text", x: 408, y: 152, width: 120, height: 24, zIndex: 1, content: "إلى (المستلم):", fontSize: 16, fontWeight: "bold", color: "#000000", opacity: 1 },
            { id: "9", type: "text", x: 24, y: 152, width: 120, height: 24, zIndex: 1, content: "من (المرسل):", fontSize: 16, fontWeight: "bold", color: "#000000", opacity: 1 },
            { id: "10", type: "text", x: 32, y: 184, width: 352, height: 152, zIndex: 1, content: "اسم المتجر: {merchant_name}\nهاتف: {merchant_phone}\nعنوان: {merchant_address}", fontSize: 14, color: "#000000", opacity: 1 },
            { id: "11", type: "text", x: 408, y: 184, width: 352, height: 152, zIndex: 1, content: "اسم المستلم: {recipient_name}\nهاتف: {recipient_phone}\nعنوان: {recipient_address}", fontSize: 14, color: "#000000", opacity: 1 },
            { id: "12", type: "rect", x: 16, y: 360, width: 752, height: 160, zIndex: 0, content: "", borderColor: "#000000", borderWidth: 1, backgroundColor: '#ffffff', opacity: 1 },
            { id: "13", type: "text", x: 608, y: 368, width: 152, height: 32, zIndex: 1, content: "ملخص الطلب", fontSize: 16, fontWeight: "bold", opacity: 1 },
            { id: "14", type: "text", x: 48, y: 368, width: 150, height: 30, zIndex: 1, content: "قيمة التحصيل (COD)", fontSize: 18, fontWeight: "bold", opacity: 1 },
            { id: "15", type: "text", x: 32, y: 408, width: 200, height: 60, zIndex: 1, content: "{cod_amount}", fontSize: 36, fontWeight: "bold", color: "#000000", opacity: 1 },
            { id: "16", type: "text", x: 408, y: 400, width: 352, height: 112, zIndex: 1, content: "المنتجات: {order_items}\nالكمية: {items_count}\nملاحظات: {notes}", fontSize: 12, color: "#374151", opacity: 1 },
        ]
    },
    "label_4x6_default": {
        id: "label_4x6_default", name: "بوليصة 4x6 عملية", paperSize: "label_4x6",
        customDimensions: { width: 101.6, height: 152.4 }, margins: { top: 5, right: 5, bottom: 5, left: 5 },
        elements: [
            { id: "1", type: "text", x: 16, y: 16, width: 184, height: 24, zIndex: 1, content: "من: {merchant_name}", fontSize: 14, fontWeight: "bold", color: "#000000", opacity: 1 },
            { id: "2", type: "text", x: 16, y: 48, width: 352, height: 120, zIndex: 1, content: "إلى: {recipient_name}\n{recipient_address}\n{recipient_phone}", fontSize: 18, color: "#000000", opacity: 1 },
            { id: "3", type: "barcode", x: 40, y: 176, width: 304, height: 80, zIndex: 1, content: "{order_id}", opacity: 1 },
            { id: "4", type: "text", x: 16, y: 264, width: 352, height: 48, zIndex: 1, content: "المبلغ: {cod_amount}", fontSize: 28, fontWeight: "bold", color: "#000000", opacity: 1 },
            { id: "5", type: "text", x: 16, y: 320, width: 352, height: 48, zIndex: 1, content: "{order_id}", fontSize: 12, fontWeight: "normal", color: "#000000", opacity: 1 },
            { id: "6", type: "text", x: 16, y: 376, width: 352, height: 24, zIndex: 1, content: "مرجع: {reference_id}", fontSize: 12, color: "#000000", opacity: 1 },
            { id: "7", type: "image", x: 232, y: 8, width: 144, height: 40, zIndex: 1, content: "{company_logo}", opacity: 1 },
            { id: "8", type: "line", x: 16, y: 168, width: 352, height: 2, zIndex: 0, content: "", color: "#000000", opacity: 1 },
            { id: "9", type: "line", x: 16, y: 312, width: 352, height: 2, zIndex: 0, content: "", color: "#000000", opacity: 1 },
        ]
    },
    "label_45x75_default": {
        id: "label_45x75_default", name: "بوليصة 75x45 (عرضية)", paperSize: "custom",
        customDimensions: { width: 75, height: 45 }, margins: { top: 2, right: 2, bottom: 2, left: 2 },
        elements: [
            { id: "el_brcd", type: "barcode", x: 128, y: 8, width: 136, height: 88, zIndex: 1, content: "{order_id}", fontSize: 14, fontWeight: 'normal', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff' },
            { id: "el_brcd_txt", type: "text", x: 128, y: 104, width: 136, height: 24, zIndex: 1, content: "{order_id}", fontSize: 12, fontWeight: 'normal', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff' },
            { id: "el_logo", type: "image", x: 16, y: 8, width: 104, height: 120, zIndex: 1, content: "{company_logo}", fontSize: 14, fontWeight: 'normal', color: '#000000', borderColor: '#000000', borderWidth: 1, opacity: 1, backgroundColor: '#ffffff' },
        ]
    }
  };

  const handleContextMenu = (event: React.MouseEvent, element: PolicyElement) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, element });
  };
  
  const handleEditFromContextMenu = () => {
      if (contextMenu) {
          setModalElement(contextMenu.element);
          setIsModalOpen(true);
          setContextMenu(null);
      }
  }

  const handlePrint = async () => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    try {
        const canvas = await html2canvas(canvasElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // If you use external images
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: paperDimensions.width > paperDimensions.height ? 'l' : 'p',
            unit: 'mm',
            format: [paperDimensions.width * (25.4 / DPI), paperDimensions.height * (25.4 / DPI)],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');

    } catch (e) {
        console.error('Error generating PDF', e);
        toast({
            variant: 'destructive',
            title: 'خطأ في الطباعة',
            description: 'حدث خطأ أثناء محاولة إنشاء ملف PDF.',
        });
    }
  };


  if (!isHydrated) {
    return null; // or a loading skeleton
  }


  return (
    <div className="space-y-6" onClick={() => setContextMenu(null)}>
        {contextMenu && (
            <div
                style={{ top: contextMenu.y, left: contextMenu.x }}
                className="fixed z-50 bg-popover border rounded-md shadow-lg"
            >
                <Button variant="ghost" onClick={handleEditFromContextMenu} className="w-full justify-start p-2 text-sm">
                    <Edit className="h-4 w-4 ml-2"/> تعديل
                </Button>
            </div>
        )}
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
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="ml-2 h-4 w-4" /> طباعة عينة
                    </Button>
                    <Button variant="outline" onClick={handleSmartLayout}>
                        <Wand2 className="ml-2 h-4 w-4" /> المساعدة الذكية
                    </Button>
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
                 <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => handleAlignment('left')}><AlignHorizontalJustifyStart className="h-4 w-4 mr-1" /> محاذاة لليسار</Button>
                 <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => handleAlignment('h-center')}><AlignHorizontalJustifyCenter className="h-4 w-4 mr-1" /> توسيط أفقي</Button>
                 <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => handleAlignment('right')}><AlignHorizontalJustifyEnd className="h-4 w-4 mr-1" /> محاذاة لليمين</Button>
                 <Separator orientation="vertical" className="h-6" />
                 <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => handleAlignment('top')}><AlignVerticalJustifyStart className="h-4 w-4 mr-1" /> محاذاة للأعلى</Button>
                 <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => handleAlignment('v-center')}><AlignVerticalJustifyCenter className="h-4 w-4 mr-1" /> توسيط عمودي</Button>
                 <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={() => handleAlignment('bottom')}><AlignVerticalJustifyEnd className="h-4 w-4 mr-1" /> محاذاة للأسفل</Button>
                 <Separator orientation="vertical" className="h-6" />
                 <Button variant="ghost" size="sm" disabled={selectedIds.length !== 1} onClick={() => handleLayering('forward')}><BringToFront className="h-4 w-4 mr-1" /> تقديم</Button>
                 <Button variant="ghost" size="sm" disabled={selectedIds.length !== 1} onClick={() => handleLayering('backward')}><SendToBack className="h-4 w-4 mr-1" /> تأخير</Button>
                 <Separator orientation="vertical" className="h-6" />
                 <Button variant="ghost" size="sm" disabled={selectedIds.length === 0} onClick={handleDuplicate}><Copy className="h-4 w-4 mr-1" /> نسخ</Button>
                 <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={selectedIds.length === 0} onClick={() => handleDeleteElement(selectedIds[0])}><Trash2 className="h-4 w-4 mr-1" /> حذف</Button>
            </CardContent>
        </Card>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[createSnapModifier(GRID_SIZE)]}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                <div className="space-y-6 lg:col-span-1 lg:sticky lg:top-24">
                     <Card>
                        <CardHeader><CardTitle>الأدوات</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            {toolboxItems.map(tool => (
                                <ToolboxItem key={tool.label} tool={tool} onClick={() => addElement(tool)} />
                            ))}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>إعدادات البوليصة</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>حجم الورق</Label>
                                <Select value={paperSize} onValueChange={(val) => updatePolicySetting && updatePolicySetting('paperSize', val as PolicySettings['paperSize'])}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>{Object.entries(paperSizes).map(([key, { label }]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             {paperSize === 'custom' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2"><Label>العرض (مم)</Label><Input type="number" value={customDimensions.width} onChange={e => updatePolicySetting && updatePolicySetting('customDimensions', {...customDimensions, width: parseInt(e.target.value, 10) || 0})} /></div>
                                    <div className="space-y-2"><Label>الارتفاع (مم)</Label><Input type="number" value={customDimensions.height} onChange={e => updatePolicySetting && updatePolicySetting('customDimensions', {...customDimensions, height: parseInt(e.target.value, 10) || 0})} /></div>
                                </div>
                            )}
                             <div className="space-y-2">
                                <Label>الهوامش (مم)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                     <div className="space-y-2"><Label className="text-xs">الأعلى</Label><Input type="number" placeholder="أعلى" value={margins.top} onChange={e => updatePolicySetting && updatePolicySetting('margins', {...margins, top: parseInt(e.target.value, 10) || 0})}/></div>
                                     <div className="space-y-2"><Label className="text-xs">الأسفل</Label><Input type="number" placeholder="أسفل" value={margins.bottom} onChange={e => updatePolicySetting && updatePolicySetting('margins', {...margins, bottom: parseInt(e.target.value, 10) || 0})}/></div>
                                     <div className="space-y-2"><Label className="text-xs">اليمين</Label><Input type="number" placeholder="يمين" value={margins.right} onChange={e => updatePolicySetting && updatePolicySetting('margins', {...margins, right: parseInt(e.target.value, 10) || 0})}/></div>
                                     <div className="space-y-2"><Label className="text-xs">اليسار</Label><Input type="number" placeholder="يسار" value={margins.left} onChange={e => updatePolicySetting && updatePolicySetting('margins', {...margins, left: parseInt(e.target.value, 10) || 0})}/></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     {designErrors.length > 0 && (
                        <Card className="border-yellow-400">
                             <CardHeader><CardTitle className="flex items-center gap-2 text-yellow-600"><AlertTriangle /> تنبيهات التصميم</CardTitle></CardHeader>
                             <CardContent className="space-y-2">
                                {designErrors.map(error => (
                                    <Button key={error.elementId} variant="ghost" className="text-xs h-auto p-1 justify-start w-full" onClick={() => setSelectedIds([error.elementId])}>
                                        - {error.message}
                                    </Button>
                                ))}
                             </CardContent>
                        </Card>
                    )}
                     <Card>
                        <CardHeader><CardTitle>القوالب</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             <h4 className="font-semibold text-sm">قوالب جاهزة</h4>
                             {Object.values(readyTemplates).map(template => (
                                <Button key={template.id} variant="link" className="p-0 h-auto" onClick={() => loadTemplate(template)}>
                                    {template.name}
                                </Button>
                             ))}
                             <h4 className="font-semibold text-sm pt-2 border-t">القوالب المحفوظة</h4>
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
                            <div
                              ref={canvasRef}
                              className="relative bg-white rounded-md shadow-inner"
                              style={{ ...paperDimensions }}
                              onClick={(e) => { e.stopPropagation(); setSelectedIds([]);}}
                            >
                                <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
                                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`,
                                    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                                    backgroundRepeat: 'repeat',
                                }} />
                                <div className="absolute border-2 border-dashed border-red-400/50 pointer-events-none" style={{
                                    top: `${marginPx.top}px`, right: `${marginPx.right}px`,
                                    bottom: `${marginPx.bottom}px`, left: `${marginPx.left}px`,
                                }}/>
                                {elements.sort((a,b) => a.zIndex - b.zIndex).map((el) => (
                                    <DraggableItem
                                      key={el.id}
                                      element={el}
                                      selected={selectedIds.includes(el.id)}
                                      onSelect={handleSelect}
                                      onResizeStop={handleResizeStop}
                                      onContextMenu={handleContextMenu}
                                      onDoubleClick={handleDoubleClickElement}
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
