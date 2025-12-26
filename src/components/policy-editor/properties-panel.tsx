'use client';

import React from 'react';
import { PolicyElement } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Trash2, Layers, Move, Palette, Type, Settings } from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: PolicyElement | null;
  onElementUpdate: (elementId: string, updates: Partial<PolicyElement>) => void;
  onElementDuplicate: (elementId: string) => void;
  onElementDelete: (elementId: string) => void;
}

export function PropertiesPanel({
  selectedElement,
  onElementUpdate,
  onElementDuplicate,
  onElementDelete
}: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 py-12">
          <Layers className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">لا يوجد عنصر محدد</h3>
          <p className="text-sm">اختر عنصراً من اللوحة لتعديل خصائصه</p>
        </div>
      </div>
    );
  }

  const updateElement = (updates: Partial<PolicyElement>) => {
    onElementUpdate(selectedElement.id, updates);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Element Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {selectedElement.type === 'text' && <Type className="w-5 h-5" />}
            {selectedElement.type === 'barcode' && <div className="w-5 h-5 bg-green-500 rounded" />}
            {selectedElement.type === 'image' && <div className="w-5 h-5 bg-purple-500 rounded" />}
            {selectedElement.type === 'shape' && <div className="w-5 h-5 bg-orange-500 rounded" />}
            
            <span className="capitalize">
              {selectedElement.type === 'text' && 'نص'}
              {selectedElement.type === 'barcode' && 'باركود'}
              {selectedElement.type === 'image' && 'صورة'}
              {selectedElement.type === 'shape' && 'شكل'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onElementDuplicate(selectedElement.id)}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              نسخ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onElementDelete(selectedElement.id)}
              className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              حذف
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">المحتوى</TabsTrigger>
          <TabsTrigger value="position">الموضع</TabsTrigger>
          <TabsTrigger value="style">التنسيق</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="w-4 h-4" />
                محتوى العنصر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedElement.type === 'text' || selectedElement.type === 'barcode' ? (
                <div>
                  <Label htmlFor="element-content">النص</Label>
                  <Textarea
                    id="element-content"
                    value={selectedElement.content}
                    onChange={(e) => updateElement({ content: e.target.value })}
                    rows={4}
                    placeholder="أدخل النص هنا..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    يمكنك استخدام المتغيرات: {'{'}{'{'} orderId {'}'}{'}'}، {'{'}{'{'} recipient {'}'}{'}'}، {'{'}{'{'} phone {'}'}{'}'}، {'{'}{'{'} address {'}'}{'}'}
                  </div>
                </div>
              ) : selectedElement.type === 'image' ? (
                <div>
                  <Label htmlFor="element-content">رابط الصورة</Label>
                  <Input
                    id="element-content"
                    placeholder="https://example.com/image.jpg"
                    value={selectedElement.content}
                    onChange={(e) => updateElement({ content: e.target.value })}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p>هذا العنصر لا يحتوي على محتوى نصي</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="position" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Move className="w-4 h-4" />
                الموضع والحجم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="element-x">الموضع X (مم)</Label>
                  <Input
                    id="element-x"
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => updateElement({ x: parseFloat(e.target.value) || 0 })}
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="element-y">الموضع Y (مم)</Label>
                  <Input
                    id="element-y"
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => updateElement({ y: parseFloat(e.target.value) || 0 })}
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="element-width">العرض (مم)</Label>
                  <Input
                    id="element-width"
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => updateElement({ width: parseFloat(e.target.value) || 1 })}
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="element-height">الارتفاع (مم)</Label>
                  <Input
                    id="element-height"
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => updateElement({ height: parseFloat(e.target.value) || 1 })}
                    step="0.1"
                    min="0.1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="element-z-index">ترتيب الطبقة</Label>
                <Input
                  id="element-z-index"
                  type="number"
                  value={selectedElement.zIndex}
                  onChange={(e) => updateElement({ zIndex: parseInt(e.target.value) || 1 })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          {/* Typography */}
          {(selectedElement.type === 'text' || selectedElement.type === 'barcode') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  الخط والنص
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="element-font-size">حجم الخط (px)</Label>
                  <Input
                    id="element-font-size"
                    type="number"
                    min="8"
                    max="72"
                    value={selectedElement.fontSize}
                    onChange={(e) => updateElement({ fontSize: parseInt(e.target.value) || 12 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="element-font-weight">وزن الخط</Label>
                  <Select
                    value={selectedElement.fontWeight}
                    onValueChange={(value) => updateElement({ fontWeight: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="bold">عريض</SelectItem>
                      <SelectItem value="lighter">خفيف</SelectItem>
                      <SelectItem value="900">عريض جداً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="element-text-align">محاذاة النص</Label>
                  <Select
                    value={selectedElement.textAlign}
                    onValueChange={(value) => updateElement({ textAlign: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">يمين</SelectItem>
                      <SelectItem value="center">وسط</SelectItem>
                      <SelectItem value="left">يسار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="element-font-style">نمط الخط</Label>
                  <Select
                    value={selectedElement.fontStyle}
                    onValueChange={(value) => updateElement({ fontStyle: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">عادي</SelectItem>
                      <SelectItem value="italic">مائل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Colors and Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4" />
                الألوان والمظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="element-color">لون النص</Label>
                  <div className="flex gap-2">
                    <Input
                      id="element-color"
                      type="color"
                      value={selectedElement.color}
                      onChange={(e) => updateElement({ color: e.target.value })}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={selectedElement.color}
                      onChange={(e) => updateElement({ color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="element-bg-color">لون الخلفية</Label>
                  <div className="flex gap-2">
                    <Input
                      id="element-bg-color"
                      type="color"
                      value={selectedElement.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.backgroundColor}
                      onChange={(e) => updateElement({ backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={selectedElement.backgroundColor}
                      onChange={(e) => updateElement({ backgroundColor: e.target.value })}
                      className="flex-1"
                      placeholder="transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="element-opacity">الشفافية</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="element-opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedElement.opacity}
                    onChange={(e) => updateElement({ opacity: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 min-w-[40px]">
                    {Math.round(selectedElement.opacity * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Borders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                الحدود والإطار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="element-border-width">عرض الحدود (px)</Label>
                <Input
                  id="element-border-width"
                  type="number"
                  min="0"
                  max="10"
                  value={selectedElement.borderWidth}
                  onChange={(e) => updateElement({ borderWidth: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="element-border-color">لون الحدود</Label>
                <div className="flex gap-2">
                  <Input
                    id="element-border-color"
                    type="color"
                    value={selectedElement.borderColor}
                    onChange={(e) => updateElement({ borderColor: e.target.value })}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={selectedElement.borderColor}
                    onChange={(e) => updateElement({ borderColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="element-border-radius">انحناء الحدود (px)</Label>
                <Input
                  id="element-border-radius"
                  type="number"
                  min="0"
                  max="50"
                  value={selectedElement.borderRadius}
                  onChange={(e) => updateElement({ borderRadius: parseInt(e.target.value) || 0 })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}