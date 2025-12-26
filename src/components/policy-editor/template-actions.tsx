'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { SavedTemplate } from '@/contexts/SettingsContext';
import { Save, Download, Upload, FileText, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateActionsProps {
  currentTemplate: SavedTemplate;
  onSave: (template: SavedTemplate) => void;
  onLoad: (template: SavedTemplate) => void;
}

export function TemplateActions({ currentTemplate, onSave, onLoad }: TemplateActionsProps) {
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState(currentTemplate.name);
  const [importData, setImportData] = useState('');

  const handleSave = () => {
    const updatedTemplate = {
      ...currentTemplate,
      name: templateName,
      id: `custom-${Date.now()}`,
    };
    
    onSave(updatedTemplate);
    setSaveDialogOpen(false);
    
    toast({
      title: 'تم الحفظ بنجاح',
      description: `تم حفظ القالب "${templateName}" بنجاح`,
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(currentTemplate, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${currentTemplate.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: 'تم التصدير بنجاح',
      description: 'تم تصدير القالب كملف JSON',
    });
  };

  const handleImport = () => {
    try {
      const template = JSON.parse(importData) as SavedTemplate;
      
      // Validate template structure
      if (!template.id || !template.name || !template.elements) {
        throw new Error('Invalid template format');
      }
      
      onLoad(template);
      setLoadDialogOpen(false);
      setImportData('');
      
      toast({
        title: 'تم الاستيراد بنجاح',
        description: `تم استيراد القالب "${template.name}" بنجاح`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'فشل الاستيراد',
        description: 'تأكد من صحة تنسيق ملف القالب',
      });
    }
  };

  const handleDuplicate = () => {
    const duplicatedTemplate = {
      ...currentTemplate,
      id: `copy-${Date.now()}`,
      name: `نسخة من ${currentTemplate.name}`,
    };
    
    onLoad(duplicatedTemplate);
    
    toast({
      title: 'تم النسخ بنجاح',
      description: 'تم إنشاء نسخة من القالب الحالي',
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            حفظ
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حفظ القالب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">اسم القالب</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="أدخل اسم القالب"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>سيتم حفظ القالب مع {currentTemplate.elements.length} عنصر</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={!templateName.trim()}>
              حفظ القالب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Button */}
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        تصدير
      </Button>

      {/* Import Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            استيراد
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>استيراد قالب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-data">بيانات القالب (JSON)</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="الصق بيانات القالب هنا..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>الصق محتوى ملف JSON الخاص بالقالب المراد استيراده</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleImport} disabled={!importData.trim()}>
              استيراد القالب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Button */}
      <Button variant="outline" size="sm" onClick={handleDuplicate}>
        <Copy className="w-4 h-4 mr-2" />
        نسخ
      </Button>
    </div>
  );
}