'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Printer,
    Download,
    ZoomIn,
    ZoomOut,
    X,
    Maximize2,
    Minimize2,
    FileText,
    RefreshCw
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { generatePdfViaBrowserPrint } from '@/services/pdf-service';

interface UnifiedPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // يمكن تمرير HTML مباشرة أو blob URL
    htmlContent?: string;
    pdfUrl?: string;
    title?: string;
    orderCount?: number;
    orderIds?: string[];
    // أبعاد المعاينة
    width?: number;
    height?: number;
    // callbacks
    onPrint?: () => void;
    onDownload?: () => void;
    onRefresh?: () => void;
    isLoading?: boolean;
}

export const UnifiedPreviewDialog = ({
    open,
    onOpenChange,
    htmlContent,
    pdfUrl,
    title = 'معاينة البوليصة',
    orderCount = 1,
    orderIds = [],
    width = 210,
    height = 297,
    onPrint,
    onDownload,
    onRefresh,
    isLoading = false,
}: UnifiedPreviewDialogProps) => {
    const [zoom, setZoom] = useState(80);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // إنشاء URL للمعاينة من HTML
    useEffect(() => {
        if (open && htmlContent) {
            const fullHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        @page { 
            size: ${width}mm ${height}mm; 
            margin: 5mm; 
        }
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        body { 
            font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif; 
            direction: rtl; 
            color: #000;
            background: white;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 20px;
            min-height: 100vh;
        }
        .content-wrapper {
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        @media print { 
            body { 
                margin: 0; 
                padding: 0;
                background: white;
            }
            .content-wrapper {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="content-wrapper">
        ${htmlContent}
    </div>
</body>
</html>`;

            const blob = new Blob([fullHtml], { type: 'text/html; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        } else if (pdfUrl) {
            setPreviewUrl(pdfUrl);
        }
    }, [open, htmlContent, pdfUrl, title, width, height]);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setZoom(80);
        }
    }, [open]);

    // Cleanup on close
    useEffect(() => {
        if (!open && previewUrl && htmlContent) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [open]);

    // Zoom controls
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 15, 150));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 15, 40));
    const handleZoomReset = () => setZoom(80);

    // Print directly
    const handlePrint = async () => {
        if (onPrint) {
            onPrint();
            return;
        }

        if (htmlContent) {
            setIsPrinting(true);
            try {
                await generatePdfViaBrowserPrint(htmlContent, {
                    filename: `${title}.pdf`,
                    width,
                    height
                });
            } finally {
                setIsPrinting(false);
            }
        } else if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.print();
        }
    };

    // Download
    const handleDownload = () => {
        if (onDownload) {
            onDownload();
            return;
        }

        if (previewUrl) {
            const link = document.createElement('a');
            link.href = previewUrl;
            link.download = `${title}.html`;
            link.click();
        }
    };

    const displayUrl = previewUrl || pdfUrl;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                dir="rtl"
                className={cn(
                    "p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-gray-900",
                    isFullscreen
                        ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none"
                        : "max-w-6xl w-[95vw] h-[90vh] max-h-[90vh]"
                )}
            >
                <DialogTitle className="sr-only">{title}</DialogTitle>

                <div className="flex flex-col h-full">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
                        {/* Left side - File info */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-400" />
                                <span className="text-white font-medium text-sm">{title}</span>
                            </div>
                            {orderCount > 0 && (
                                <Badge className="bg-blue-600 text-white text-xs">
                                    {orderCount} طلب
                                </Badge>
                            )}
                        </div>

                        {/* Center - Zoom Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomOut}
                                disabled={zoom <= 40}
                                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <button
                                onClick={handleZoomReset}
                                className="px-3 py-1 text-gray-300 text-sm hover:text-white hover:bg-gray-700 rounded min-w-[60px] text-center"
                            >
                                {zoom}%
                            </button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomIn}
                                disabled={zoom >= 150}
                                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-2">
                            {onRefresh && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onRefresh}
                                    disabled={isLoading}
                                    className="text-gray-300 hover:text-white hover:bg-gray-700 gap-2"
                                >
                                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrint}
                                disabled={isLoading || isPrinting || !displayUrl}
                                className="text-gray-300 hover:text-white hover:bg-gray-700 gap-2"
                            >
                                <Printer className={cn("h-4 w-4", isPrinting && "animate-pulse")} />
                                <span className="hidden sm:inline">طباعة</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                disabled={isLoading || !displayUrl}
                                className="text-gray-300 hover:text-white hover:bg-gray-700 gap-2"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">تحميل</span>
                            </Button>

                            <Separator orientation="vertical" className="h-6 bg-gray-600" />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="flex flex-1 min-h-0">
                        {/* Preview Viewer */}
                        <div className="flex-1 bg-gray-600 flex items-center justify-center overflow-auto p-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-gray-500 border-t-blue-400 rounded-full animate-spin" />
                                    <span className="text-gray-300">جاري تحميل المعاينة...</span>
                                </div>
                            ) : displayUrl ? (
                                <div
                                    style={{
                                        transform: `scale(${zoom / 100})`,
                                        transformOrigin: 'center top',
                                        transition: 'transform 0.2s ease'
                                    }}
                                >
                                    <iframe
                                        ref={iframeRef}
                                        src={displayUrl}
                                        className="bg-white shadow-2xl rounded"
                                        style={{
                                            width: `${width * 3.78}px`,
                                            height: `${height * 3.78}px`,
                                            border: 'none'
                                        }}
                                        title={title}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-gray-400">
                                    <FileText className="h-16 w-16 opacity-50" />
                                    <span>لا يوجد محتوى للعرض</span>
                                </div>
                            )}
                        </div>

                        {/* Order list sidebar */}
                        {orderIds.length > 1 && (
                            <div className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
                                <div className="p-3 border-b border-gray-700">
                                    <span className="text-gray-300 text-sm font-medium">الطلبات</span>
                                </div>
                                <ScrollArea className="flex-1">
                                    <div className="p-3 space-y-2">
                                        {orderIds.map((orderId, index) => (
                                            <div
                                                key={orderId}
                                                className="flex items-center gap-2 p-2 rounded bg-gray-700/50 text-gray-300 text-xs"
                                            >
                                                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                                    {index + 1}
                                                </span>
                                                <span className="font-mono truncate">{orderId}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-2 border-t border-gray-700 text-center">
                                    <span className="text-gray-500 text-xs">{orderIds.length} طلب</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
