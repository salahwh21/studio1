/**
 * نظام موحد للطباعة والتصدير
 * يفصل بين الطباعة المباشرة وتصدير PDF
 */

import { generatePdfViaBrowserPrint, downloadPdf } from '@/services/pdf-service';
import { generateUnifiedSlipHTML, type SlipData, type SlipOptions } from './unified-slip-templates';

export interface PrintExportOptions extends SlipOptions {
  filename?: string;
}

/**
 * طباعة مباشرة - يفتح نافذة الطباعة
 */
export async function printSlip(data: SlipData, options: PrintExportOptions = {}): Promise<void> {
  const html = generateUnifiedSlipHTML(data, options);
  
  // إنشاء نافذة جديدة للطباعة
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('لا يمكن فتح نافذة الطباعة. تأكد من السماح للنوافذ المنبثقة.');
  }

  printWindow.document.write(html);
  printWindow.document.close();
  
  // انتظار تحميل المحتوى ثم طباعة
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    
    // إغلاق النافذة بعد الطباعة
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };
}

/**
 * تصدير PDF - يحمل ملف PDF
 */
export async function exportSlipToPDF(data: SlipData, options: PrintExportOptions = {}): Promise<void> {
  const html = generateUnifiedSlipHTML(data, options);
  const filename = options.filename || `slip_${Date.now()}`;
  
  // استخدام Browser Print للجداول
  const blob = await generatePdfViaBrowserPrint(html, { filename });
  
  // لا حاجة لتحميل الملف لأن Browser Print يتولى الأمر
}

/**
 * معاينة PDF - يفتح dialog للمعاينة (مبسط)
 */
export async function previewSlipPDF(data: SlipData, options: PrintExportOptions = {}): Promise<string> {
  const html = generateUnifiedSlipHTML(data, options);
  
  // إنشاء معاينة بسيطة باستخدام data URL
  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

/**
 * مكون موحد للطباعة والتصدير
 */
export interface UnifiedPrintExportProps {
  data: SlipData;
  options?: PrintExportOptions;
  onPrint?: () => void;
  onExport?: () => void;
  onPreview?: (url: string) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

export const UnifiedPrintExportActions = {
  /**
   * معالج الطباعة المباشرة
   */
  handlePrint: async (props: UnifiedPrintExportProps) => {
    try {
      await printSlip(props.data, props.options);
      props.onPrint?.();
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  },

  /**
   * معالج تصدير PDF
   */
  handleExport: async (props: UnifiedPrintExportProps) => {
    try {
      await exportSlipToPDF(props.data, props.options);
      props.onExport?.();
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  /**
   * معالج معاينة PDF
   */
  handlePreview: async (props: UnifiedPrintExportProps) => {
    try {
      const url = await previewSlipPDF(props.data, props.options);
      props.onPreview?.(url);
      return url;
    } catch (error) {
      console.error('Preview error:', error);
      throw error;
    }
  }
};