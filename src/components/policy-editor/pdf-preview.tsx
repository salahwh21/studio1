'use client';

import React, { useState, useEffect } from 'react';
import { SavedTemplate } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePdfPreview, generatePdf, downloadPdf } from '@/services/pdf-service';

interface PDFPreviewProps {
  template: SavedTemplate;
  mockData: any;
}

export function PDFPreview({ template, mockData }: PDFPreviewProps) {
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const canvasWidth = template.paperSize === 'custom' 
    ? template.customDimensions?.width || 100 
    : template.paperSize === 'a4' ? 210 : 148;
  
  const canvasHeight = template.paperSize === 'custom' 
    ? template.customDimensions?.height || 150 
    : template.paperSize === 'a4' ? 297 : 210;

  // Build HTML from template elements
  const buildTemplateHTML = () => {
    const elementsHTML = template.elements.map(element => {
      const style = `
        position: absolute;
        left: ${element.x}mm;
        top: ${element.y}mm;
        width: ${element.width}mm;
        height: ${element.height}mm;
        font-size: ${element.fontSize || 12}px;
        font-weight: ${element.fontWeight || 'normal'};
        text-align: ${element.textAlign || 'right'};
        color: ${element.color || '#000000'};
        background-color: ${element.backgroundColor || 'transparent'};
        border: ${element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000'}` : 'none'};
        border-radius: ${element.borderRadius || 0}px;
        opacity: ${element.opacity || 1};
        z-index: ${element.zIndex || 0};
        display: flex;
        align-items: center;
        justify-content: ${element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center'};
        overflow: hidden;
      `;

      let content = element.content || '';
      
      // For barcode type, show placeholder
      if (element.type === 'barcode') {
        content = `<div style="font-family: monospace; font-size: 10px;">[BARCODE]</div>`;
      }

      return `<div style="${style}">${content}</div>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: ${canvasWidth}mm ${canvasHeight}mm; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, Tahoma, sans-serif; 
            -webkit-print-color-adjust: exact;
            width: ${canvasWidth}mm;
            height: ${canvasHeight}mm;
            position: relative;
            background: white;
          }
        </style>
      </head>
      <body>${elementsHTML}</body>
      </html>
    `;
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const html = buildTemplateHTML();
      const dataUrl = await generatePdfPreview(html, {
        width: `${canvasWidth}mm`,
        height: `${canvasHeight}mm`,
      });
      setPdfUrl(dataUrl);

      toast({
        title: 'تم إنشاء المعاينة',
        description: 'تم إنشاء معاينة PDF بنجاح',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        variant: 'destructive',
        title: 'فشل إنشاء المعاينة',
        description: 'حدث خطأ أثناء إنشاء معاينة PDF',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const html = buildTemplateHTML();
      const blob = await generatePdf(html, {
        width: `${canvasWidth}mm`,
        height: `${canvasHeight}mm`,
        filename: template.name.replace(/[^a-zA-Z0-9]/g, '_'),
      });
      downloadPdf(blob, `${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'فشل التحميل',
        description: 'حدث خطأ أثناء تحميل PDF',
      });
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl);
      printWindow?.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={() => !pdfUrl && generatePDF()}>
          <Eye className="w-4 h-4 mr-2" />
          معاينة PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>معاينة PDF - {template.name}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                تحميل
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} disabled={!pdfUrl}>
                <Printer className="w-4 h-4 mr-2" />
                طباعة
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {isGenerating ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">جاري إنشاء معاينة PDF...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-96 border rounded"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded">
              <div className="text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">اضغط "إنشاء معاينة" لرؤية PDF</p>
                <Button onClick={generatePDF}>
                  إنشاء معاينة
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
