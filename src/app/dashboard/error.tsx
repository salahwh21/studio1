'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-md w-full border-2 border-red-300 dark:border-red-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <CardTitle>حدث خطأ في هذه الصفحة</CardTitle>
              <CardDescription>باقي التطبيق يعمل بشكل طبيعي</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm font-mono text-red-800 dark:text-red-200">
              {error.message || 'خطأ غير معروف'}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={reset} className="w-full">
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
