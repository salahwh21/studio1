'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Trash2, Plus, Eye, EyeOff, Lock, Unlock, RotateCcw, Copy, ChevronUp, ChevronDown, Move, Pencil, Hash, DollarSign, User, Phone, MapPin, Package, Calendar, FileText, Type, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

type ElementType = 'barcode' | 'cod' | 'recipient' | 'phone' | 'address' | 'city' | 'region' | 'merchant' | 'date' | 'orderId' | 'notes' | 'logo' | 'line' | 'title';

interface PolicyElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '900';
  textAlign: 'right' | 'center' | 'left';
  backgroundColor: string;
  textColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  showLabel: boolean;
  label?: string;
}

const sampleData = {
  orderId: 'ORD-12345',
  merchant: 'متجر الإلكترونيات',
  recipient: 'أحمد محمد',
  phone: '0791234567',
  city: 'الشميساني',
  region: 'عمان',
  address: 'شارع الملكة رانيا، مبنى 15',
  cod: '45.00',
  date: '2024-01-15',
  notes: 'يرجى الاتصال قبل التوصيل',
  currency: 'د.أ',
  title: 'بوليصة شحن',
};

const elementNames: Record<ElementType, string> = {
  barcode: 'الباركود',
  cod: 'المبلغ',
  recipient: 'المستلم',
  phone: 'الهاتف',
  address: 'العنوان',
  city: 'المدينة',
  region: 'المنطقة',
  merchant: 'التاجر',
  date: 'التاريخ',
  orderId: 'رقم الطلب',
  notes: 'الملاحظات',
  logo: 'الشعار',
  line: 'خط فاصل',
  title: 'العنوان',
};

const elementIcons: Record<ElementType, React.ReactNode> = {
  barcode: <Hash className="h-3 w-3" />,
  cod: <DollarSign className="h-3 w-3" />,
  recipient: <User className="h-3 w-3" />,
  phone: <Phone className="h-3 w-3" />,
  address: <MapPin className="h-3 w-3" />,
  city: <MapPin className="h-3 w-3" />,
  region: <MapPin className="h-3 w-3" />,
  merchant: <Package className="h-3 w-3" />,
  date: <Calendar className="h-3 w-3" />,
  orderId: <FileText className="h-3 w-3" />,
  notes: <FileText className="h-3 w-3" />,
  logo: <Package className="h-3 w-3" />,
  line: <Minus className="h-3 w-3" />,
  title: <Type className="h-3 w-3" />,
};

// قوالب جاهزة لكل نوع بوليصة
const getDefaultElements = (type: 'standard' | 'colored' | 'thermal', size: { w: number; h: number }): PolicyElement[] => {
  const baseElements: PolicyElement[] = [];
  let zIndex = 1;
  
  const addEl = (el: Partial<PolicyElement> & { type: ElementType }): PolicyElement => ({
    id: `${el.type}-${zIndex}`,
    x: el.x || 0,
    y: el.y || 0,
    width: el.width || 100,
    height: el.height || 30,
    fontSize: el.fontSize || 10,
    fontWeight: el.fontWeight || 'normal',
    textAlign: el.textAlign || 'right',
    backgroundColor: el.backgroundColor || 'transparent',
    textColor: el.textColor || '#000000',
    borderWidth: el.borderWidth || 0,
    borderColor: el.borderColor || '#000000',
    borderRadius: el.borderRadius || 0,
    padding: el.padding || 4,
    visible: true,
    locked: false,
    zIndex: zIndex++,
    showLabel: el.showLabel || false,
    label: el.label,
    type: el.type,
  });

  if (type === 'thermal') {
    // ملصق حراري 100x150
    return [
      addEl({ type: 'barcode', x: 20, y: 8, width: 160, height: 40, textAlign: 'center' }),
      addEl({ type: 'cod', x: 10, y: 52, width: 180, height: 50, fontSize: 28, fontWeight: '900', textAlign: 'center', backgroundColor: '#f5f5f5' }),
      addEl({ type: 'recipient', x: 10, y: 107, width: 180, height: 35, fontSize: 14, fontWeight: '900', showLabel: true, label: 'المستلم', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 }),
      addEl({ type: 'phone', x: 10, y: 147, width: 180, height: 22, fontSize: 11, textAlign: 'left' }),
      addEl({ type: 'address', x: 10, y: 174, width: 180, height: 42, fontSize: 9, showLabel: true, label: 'العنوان', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 }),
      addEl({ type: 'city', x: 10, y: 221, width: 65, height: 20, fontSize: 9, fontWeight: 'bold', backgroundColor: '#000', textColor: '#fff', borderRadius: 4, textAlign: 'center' }),
      addEl({ type: 'region', x: 80, y: 221, width: 65, height: 20, fontSize: 9, borderWidth: 1, borderColor: '#000', borderRadius: 4, textAlign: 'center' }),
      addEl({ type: 'merchant', x: 10, y: 246, width: 100, height: 18, fontSize: 8, textColor: '#666' }),
      addEl({ type: 'date', x: 130, y: 246, width: 60, height: 18, fontSize: 8, textAlign: 'left' }),
    ];
  }
  
  // Standard & Colored - A4/A5
  return [
    addEl({ type: 'logo', x: 10, y: 10, width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 6 }),
    addEl({ type: 'title', x: 55, y: 10, width: 120, height: 35, fontSize: 16, fontWeight: 'bold' }),
    addEl({ type: 'barcode', x: size.w - 90, y: 10, width: 80, height: 40, textAlign: 'center', backgroundColor: '#f3f4f6', borderRadius: 4 }),
    addEl({ type: 'line', x: 10, y: 55, width: size.w - 20, height: 2, backgroundColor: type === 'colored' ? '#3b82f6' : '#000' }),
    addEl({ type: 'cod', x: 10, y: 65, width: size.w - 20, height: 50, fontSize: 24, fontWeight: '900', textAlign: 'center', backgroundColor: type === 'colored' ? '#10b981' : '#f5f5f5', textColor: type === 'colored' ? '#fff' : '#000', borderRadius: 6 }),
    addEl({ type: 'merchant', x: 10, y: 125, width: (size.w - 30) / 2, height: 45, fontSize: 10, showLabel: true, label: 'التاجر', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6 }),
    addEl({ type: 'recipient', x: size.w / 2 + 5, y: 125, width: (size.w - 30) / 2, height: 45, fontSize: 12, fontWeight: 'bold', showLabel: true, label: 'المستلم', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6 }),
    addEl({ type: 'phone', x: 10, y: 180, width: size.w - 20, height: 25, fontSize: 11, textAlign: 'left' }),
    addEl({ type: 'address', x: 10, y: 210, width: size.w - 20, height: 50, fontSize: 10, showLabel: true, label: 'العنوان', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6 }),
    addEl({ type: 'city', x: 10, y: 270, width: 70, height: 22, fontSize: 10, fontWeight: 'bold', backgroundColor: '#000', textColor: '#fff', borderRadius: 4, textAlign: 'center' }),
    addEl({ type: 'region', x: 85, y: 270, width: 70, height: 22, fontSize: 10, borderWidth: 1, borderColor: '#000', borderRadius: 4, textAlign: 'center' }),
    addEl({ type: 'notes', x: 10, y: 300, width: size.w - 20, height: 40, fontSize: 9, showLabel: true, label: 'ملاحظات', backgroundColor: '#fffef0', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 4 }),
    addEl({ type: 'date', x: 10, y: 350, width: 80, height: 18, fontSize: 8, textColor: '#666' }),
    addEl({ type: 'orderId', x: size.w - 90, y: 350, width: 80, height: 18, fontSize: 8, textAlign: 'left', textColor: '#666' }),
  ];
};

interface EditablePolicyPreviewProps {
  type: 'standard' | 'colored' | 'thermal';
  canvasWidth?: number;
  canvasHeight?: number;
}

export function EditablePolicyPreview({ type, canvasWidth = 200, canvasHeight = 300 }: EditablePolicyPreviewProps) {
  const [elements, setElements] = useState<PolicyElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: canvasWidth, height: canvasHeight });
  const canvasRef = useRef<HTMLDivElement>(null);

  // تحميل القالب الافتراضي عند التحميل
  useEffect(() => {
    setElements(getDefaultElements(type, { w: canvasSize.width, h: canvasSize.height }));
  }, [type]);

  const updateElement = useCallback((id: string, updates: Partial<PolicyElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const duplicateElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const maxZ = Math.max(...elements.map(e => e.zIndex));
    const newEl: PolicyElement = { ...el, id: `${el.type}-${Date.now()}`, x: el.x + 10, y: el.y + 10, zIndex: maxZ + 1 };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, [elements]);

  const addElement = useCallback((elType: ElementType) => {
    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    const defaults: Record<ElementType, Partial<PolicyElement>> = {
      barcode: { width: 140, height: 40, textAlign: 'center' },
      cod: { width: 160, height: 45, fontSize: 24, fontWeight: '900', textAlign: 'center', backgroundColor: '#f5f5f5' },
      recipient: { width: 140, height: 35, fontSize: 12, fontWeight: 'bold', showLabel: true, label: 'المستلم' },
      phone: { width: 120, height: 25, fontSize: 11, textAlign: 'left' },
      address: { width: 160, height: 40, fontSize: 9, showLabel: true, label: 'العنوان' },
      city: { width: 60, height: 20, fontSize: 9, fontWeight: 'bold', backgroundColor: '#000', textColor: '#fff', borderRadius: 4, textAlign: 'center' },
      region: { width: 60, height: 20, fontSize: 9, borderWidth: 1, borderRadius: 4, textAlign: 'center' },
      merchant: { width: 100, height: 22, fontSize: 9, textColor: '#666' },
      date: { width: 70, height: 18, fontSize: 8, textAlign: 'left' },
      orderId: { width: 80, height: 18, fontSize: 8 },
      notes: { width: 160, height: 35, fontSize: 8, backgroundColor: '#fffef0', borderWidth: 1, borderColor: '#f59e0b', showLabel: true, label: 'ملاحظات' },
      logo: { width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 6 },
      line: { width: 160, height: 2, backgroundColor: '#000' },
      title: { width: 100, height: 25, fontSize: 14, fontWeight: 'bold' },
    };
    const d = defaults[elType] || {};
    const newEl: PolicyElement = {
      id: `${elType}-${Date.now()}`,
      type: elType,
      x: 10,
      y: 10,
      width: d.width || 100,
      height: d.height || 30,
      fontSize: d.fontSize || 10,
      fontWeight: d.fontWeight || 'normal',
      textAlign: d.textAlign || 'right',
      backgroundColor: d.backgroundColor || 'transparent',
      textColor: d.textColor || '#000000',
      borderWidth: d.borderWidth || 0,
      borderColor: d.borderColor || '#000000',
      borderRadius: d.borderRadius || 0,
      padding: 4,
      visible: true,
      locked: false,
      zIndex: maxZ + 1,
      showLabel: d.showLabel || false,
      label: d.label,
    };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, [elements]);

  const moveLayer = useCallback((id: string, dir: 'up' | 'down') => {
    setElements(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(e => e.id === id);
      if (idx === -1) return prev;
      if (dir === 'up' && idx < sorted.length - 1) {
        [sorted[idx].zIndex, sorted[idx + 1].zIndex] = [sorted[idx + 1].zIndex, sorted[idx].zIndex];
      } else if (dir === 'down' && idx > 0) {
        [sorted[idx].zIndex, sorted[idx - 1].zIndex] = [sorted[idx - 1].zIndex, sorted[idx].zIndex];
      }
      return [...sorted];
    });
  }, []);

  const resetToDefault = () => {
    setElements(getDefaultElements(type, { w: canvasSize.width, h: canvasSize.height }));
    setSelectedId(null);
  };

  const getElementValue = (el: PolicyElement): string => {
    const map: Record<ElementType, string> = {
      barcode: sampleData.orderId,
      cod: `${sampleData.cod} ${sampleData.currency}`,
      recipient: sampleData.recipient,
      phone: sampleData.phone,
      address: sampleData.address,
      city: sampleData.city,
      region: sampleData.region,
      merchant: sampleData.merchant,
      date: sampleData.date,
      orderId: `#${sampleData.orderId}`,
      notes: sampleData.notes,
      logo: '',
      line: '',
      title: sampleData.title,
    };
    return map[el.type] || '';
  };

  const renderElement = (element: PolicyElement) => {
    if (!element.visible) return null;
    const isSelected = selectedId === element.id && editMode;
    const value = getElementValue(element);

    const content = (
      <div
        className={`w-full h-full overflow-hidden ${editMode && !element.locked ? 'cursor-move' : ''}`}
        style={{
          backgroundColor: element.backgroundColor,
          color: element.textColor,
          fontWeight: element.fontWeight,
          textAlign: element.textAlign,
          border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
          borderRadius: `${element.borderRadius}px`,
          padding: element.type === 'line' ? 0 : `${element.padding}px`,
          direction: element.type === 'phone' || element.type === 'date' ? 'ltr' : 'rtl',
        }}
      >
        {element.type === 'barcode' ? (
          <div className="text-center h-full flex flex-col justify-center">
            <svg style={{ height: '18px', width: '100%' }}>
              <rect x="5%" width="2" height="18" /><rect x="10%" width="1" height="18" /><rect x="15%" width="3" height="18" />
              <rect x="22%" width="1" height="18" /><rect x="27%" width="2" height="18" /><rect x="33%" width="1" height="18" />
              <rect x="38%" width="3" height="18" /><rect x="45%" width="1" height="18" /><rect x="50%" width="2" height="18" />
              <rect x="56%" width="1" height="18" /><rect x="61%" width="3" height="18" /><rect x="68%" width="1" height="18" />
              <rect x="73%" width="2" height="18" /><rect x="79%" width="1" height="18" /><rect x="84%" width="3" height="18" />
            </svg>
            <div style={{ fontSize: '7px' }}>{value}</div>
          </div>
        ) : element.type === 'logo' ? (
          <div className="w-full h-full flex items-center justify-center text-xl">🚚</div>
        ) : element.type === 'line' ? null : (
          <div className="h-full flex flex-col justify-center overflow-hidden">
            {element.showLabel && element.label && (
              <div style={{ fontSize: '7px', color: '#666', marginBottom: '1px' }}>{element.label}</div>
            )}
            <div className="truncate" style={{ fontSize: `${element.fontSize}px` }}>{value}</div>
          </div>
        )}
      </div>
    );

    if (!editMode) {
      return (
        <div
          key={element.id}
          style={{
            position: 'absolute',
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            zIndex: element.zIndex,
          }}
        >
          {content}
        </div>
      );
    }

    return (
      <Rnd
        key={element.id}
        size={{ width: element.width, height: element.height }}
        position={{ x: element.x, y: element.y }}
        onDragStart={() => setSelectedId(element.id)}
        onDragStop={(_, d) => !element.locked && updateElement(element.id, { x: Math.round(d.x), y: Math.round(d.y) })}
        onResizeStop={(_, __, ref, ___, pos) => !element.locked && updateElement(element.id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          x: Math.round(pos.x),
          y: Math.round(pos.y),
        })}
        bounds="parent"
        minWidth={20}
        minHeight={element.type === 'line' ? 2 : 15}
        disableDragging={element.locked}
        enableResizing={!element.locked}
        onMouseDown={() => setSelectedId(element.id)}
        style={{ zIndex: element.zIndex, outline: isSelected ? '2px solid #3b82f6' : 'none', outlineOffset: '1px' }}
      >
        {content}
      </Rnd>
    );
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className="space-y-4">
      {/* شريط الأدوات */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setEditMode(!editMode); setSelectedId(null); }}
            className="gap-1"
          >
            {editMode ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {editMode ? 'معاينة' : 'تحرير'}
          </Button>
          {editMode && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-3 w-3" />إضافة عنصر
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  {(Object.keys(elementNames) as ElementType[]).map(t => (
                    <DropdownMenuItem key={t} onClick={() => addElement(t)} className="gap-2 text-xs">
                      {elementIcons[t]}{elementNames[t]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={resetToDefault} className="gap-1">
                <RotateCcw className="h-3 w-3" />إعادة
              </Button>
            </>
          )}
        </div>
        <Badge variant="outline">{canvasSize.width}×{canvasSize.height}</Badge>
      </div>

      <div className="flex gap-4">
        {/* منطقة المعاينة/التحرير */}
        <div
          ref={canvasRef}
          className={`bg-white border-2 ${editMode ? 'border-blue-300' : 'border-gray-200'} relative shadow-lg mx-auto transition-colors`}
          style={{ width: canvasSize.width, height: canvasSize.height }}
          onClick={(e) => { if (e.target === canvasRef.current) setSelectedId(null); }}
        >
          {elements.map(renderElement)}
        </div>

        {/* لوحة الخصائص - تظهر فقط في وضع التحرير */}
        {editMode && (
          <Card className="w-52 shrink-0">
            <CardContent className="p-3">
              {selectedElement ? (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3 text-xs pr-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">خصائص</span>
                      <Badge variant="secondary" className="text-[10px]">{elementNames[selectedElement.type]}</Badge>
                    </div>

                    {/* الموقع */}
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">X</Label><Input type="number" value={selectedElement.x} onChange={(e) => updateElement(selectedElement.id, { x: +e.target.value || 0 })} className="h-7 mt-0.5" disabled={selectedElement.locked} /></div>
                      <div><Label className="text-[10px]">Y</Label><Input type="number" value={selectedElement.y} onChange={(e) => updateElement(selectedElement.id, { y: +e.target.value || 0 })} className="h-7 mt-0.5" disabled={selectedElement.locked} /></div>
                      <div><Label className="text-[10px]">عرض</Label><Input type="number" value={selectedElement.width} onChange={(e) => updateElement(selectedElement.id, { width: +e.target.value || 20 })} className="h-7 mt-0.5" disabled={selectedElement.locked} /></div>
                      <div><Label className="text-[10px]">ارتفاع</Label><Input type="number" value={selectedElement.height} onChange={(e) => updateElement(selectedElement.id, { height: +e.target.value || 15 })} className="h-7 mt-0.5" disabled={selectedElement.locked} /></div>
                    </div>

                    <Separator />

                    {/* الخط */}
                    {selectedElement.type !== 'line' && selectedElement.type !== 'logo' && (
                      <>
                        <div>
                          <Label className="text-[10px]">حجم الخط</Label>
                          <Input type="number" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 10 })} className="h-7 mt-0.5" min={6} max={48} />
                        </div>
                        <div>
                          <Label className="text-[10px]">الوزن</Label>
                          <Select value={selectedElement.fontWeight} onValueChange={(v) => updateElement(selectedElement.id, { fontWeight: v as 'normal' | 'bold' | '900' })}>
                            <SelectTrigger className="h-7 mt-0.5"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">عادي</SelectItem>
                              <SelectItem value="bold">عريض</SelectItem>
                              <SelectItem value="900">أعرض</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* الألوان */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px]">خلفية</Label>
                        <Input type="color" value={selectedElement.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.backgroundColor} onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })} className="h-7 w-full mt-0.5 p-0.5" />
                      </div>
                      {selectedElement.type !== 'line' && selectedElement.type !== 'logo' && (
                        <div>
                          <Label className="text-[10px]">نص</Label>
                          <Input type="color" value={selectedElement.textColor} onChange={(e) => updateElement(selectedElement.id, { textColor: e.target.value })} className="h-7 w-full mt-0.5 p-0.5" />
                        </div>
                      )}
                    </div>

                    {/* الإطار */}
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">إطار</Label><Input type="number" value={selectedElement.borderWidth} onChange={(e) => updateElement(selectedElement.id, { borderWidth: +e.target.value || 0 })} className="h-7 mt-0.5" min={0} max={5} /></div>
                      <div><Label className="text-[10px]">زوايا</Label><Input type="number" value={selectedElement.borderRadius} onChange={(e) => updateElement(selectedElement.id, { borderRadius: +e.target.value || 0 })} className="h-7 mt-0.5" min={0} max={20} /></div>
                    </div>

                    <Separator />

                    {/* الإجراءات */}
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px]">إظهار</Label>
                      <Switch checked={selectedElement.visible} onCheckedChange={(v) => updateElement(selectedElement.id, { visible: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px]">قفل</Label>
                      <Switch checked={selectedElement.locked} onCheckedChange={(v) => updateElement(selectedElement.id, { locked: v })} />
                    </div>

                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => moveLayer(selectedElement.id, 'up')}><ChevronUp className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => moveLayer(selectedElement.id, 'down')}><ChevronDown className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => duplicateElement(selectedElement.id)}><Copy className="h-3 w-3" /></Button>
                      <Button variant="destructive" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => deleteElement(selectedElement.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-gray-400 py-6 text-xs">
                  <Move className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <div>اضغط على عنصر لتعديله</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
