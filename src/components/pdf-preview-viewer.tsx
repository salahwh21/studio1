'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Printer,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCw,
    ChevronLeft,
    ChevronRight,
    X,
    Maximize2,
    Minimize2,
    FileText
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface PdfPreviewViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pdfUrl: string | null;
    title?: string;
    pageCount?: number;
    onPrint?: () => void;
    onDownload?: () => void;
    isLoading?: boolean;
    orderIds?: string[];
}

export const PdfPreviewViewer = ({
    open,
    onOpenChange,
    pdfUrl,
    title = 'معاينة البوليصة',
    pageCount = 1,
    onPrint,
    onDownload,
    isLoading = false,
    orderIds = [],
}: PdfPreviewViewerProps) => {
    const [zoom, setZoom] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setZoom(100);
            setCurrentPage(1);
        }
    }, [open]);

    // Zoom controls
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
    const handleZoomReset = () => setZoom(100);

    // Page navigation
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, pageCount));

    // Print directly
    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.print();
        }
    };

    // Download PDF
    const handleDownload = () => {
        if (onDownload) {
            onDownload();
        } else if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${title}.pdf`;
            link.click();
        }
    };

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
                                <FileText className="h-5 w-5 text-gray-400" />
                                <span className="text-white font-medium text-sm">{title}</span>
                            </div>
                            {orderIds.length > 0 && (
                                <Badge className="bg-blue-600 text-white text-xs">
                                    {orderIds.length} طلب
                                </Badge>
                            )}
                        </div>

                        {/* Center - Page navigation & Zoom */}
                        <div className="flex items-center gap-4">
                            {/* Page Navigation */}
                            {pageCount > 1 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <span className="text-gray-300 text-sm min-w-[60px] text-center">
                                        {currentPage} / {pageCount}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleNextPage}
                                        disabled={currentPage === pageCount}
                                        className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <Separator orientation="vertical" className="h-6 bg-gray-600" />

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomOut}
                                    disabled={zoom <= 50}
                                    className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <button
                                    onClick={handleZoomReset}
                                    className="px-2 py-1 text-gray-300 text-sm hover:text-white hover:bg-gray-700 rounded min-w-[50px]"
                                >
                                    {zoom}%
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomIn}
                                    disabled={zoom >= 200}
                                    className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrint}
                                disabled={isLoading || !pdfUrl}
                                className="text-gray-300 hover:text-white hover:bg-gray-700 gap-2"
                            >
                                <Printer className="h-4 w-4" />
                                <span className="hidden sm:inline">طباعة</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                disabled={isLoading || !pdfUrl}
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
                        {/* PDF Viewer */}
                        <div className="flex-1 bg-gray-700 flex items-center justify-center overflow-auto p-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-gray-500 border-t-white rounded-full animate-spin" />
                                    <span className="text-gray-300">جاري تحميل المعاينة...</span>
                                </div>
                            ) : pdfUrl ? (
                                <div
                                    style={{
                                        transform: `scale(${zoom / 100})`,
                                        transformOrigin: 'center center',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    className="bg-white shadow-2xl rounded overflow-hidden"
                                >
                                    <iframe
                                        ref={iframeRef}
                                        src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
                                        className="w-[595px] h-[842px] border-0"
                                        title={title}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-gray-400">
                                    <FileText className="h-16 w-16 opacity-50" />
                                    <span>لا يوجد ملف للعرض</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails sidebar */}
                        {pageCount > 1 && pdfUrl && (
                            <div className="w-48 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
                                <div className="p-3 border-b border-gray-700">
                                    <span className="text-gray-300 text-sm font-medium">الصفحات</span>
                                </div>
                                <ScrollArea className="flex-1">
                                    <div className="p-3 space-y-3">
                                        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={cn(
                                                    "w-full aspect-[1/1.414] rounded border-2 overflow-hidden transition-all",
                                                    currentPage === page
                                                        ? "border-blue-500 ring-2 ring-blue-500/30"
                                                        : "border-gray-600 hover:border-gray-500"
                                                )}
                                            >
                                                <div className="w-full h-full bg-white flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">صفحة {page}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-2 border-t border-gray-700 text-center">
                                    <span className="text-gray-500 text-xs">{pageCount} صفحة</span>
                                </div>
                            </div>
                        )}

                        {/* Single page - Order list sidebar */}
                        {orderIds.length > 1 && pageCount === 1 && (
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
