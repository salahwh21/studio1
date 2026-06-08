'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function EmergencyBackupManager() {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleSqlDownload = async () => {
        setIsDownloading(true);
        try {
            // Using fetch to handle authentication/headers if needed, or simple window.open
            // Since we need credentials, fetch and create blob is safer
            const res = await fetch(`${API_URL}/export-sql`, {
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `full_backup_${new Date().toISOString().split('T')[0]}.sql`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error(e);
            alert('فشل تحميل قاعدة البيانات. تأكد من تشغيل السيرفر.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-green-500 border-2 bg-green-50 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Database className="h-6 w-6 text-green-700" />
                        <CardTitle className="text-green-800">تصدير قاعدة البيانات (SQL Export)</CardTitle>
                    </div>
                    <CardDescription className="text-green-700 font-bold">
                        هذا الملف هو كل ما تحتاجه لنقل موقعك إلى أي سيرفر أون لاين (On-line).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleSqlDownload}
                            disabled={isDownloading}
                            className="w-full bg-green-600 hover:bg-green-700 h-16 text-lg shadow-md flex flex-col items-center justify-center gap-1"
                        >
                            <div className="flex items-center gap-2">
                                <Download className="h-6 w-6" />
                                {isDownloading ? 'جاري التصدير...' : 'تحميل ملف قاعدة البيانات (.sql)'}
                            </div>
                            <span className="text-xs font-normal opacity-90">يحتوي على: الطلبات، المستخدمين، الإعدادات، والصلاحيات</span>
                        </Button>

                        <p className="text-xs text-center text-gray-500 mt-2">
                            * هذا الملف جاهز للاستيراد عبر phpMyAdmin أو pgAdmin مباشرة.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
