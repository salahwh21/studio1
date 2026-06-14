'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Orders page error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-md w-full border-2 border-orange-300 dark:border-orange-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div>
              <CardTitle>خطأ في تحميل الطلبات</CardTitle>
              <CardDescription>يمكنك المحاولة مرة أخرى أو العودة للوحة التحكم</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-mono text-orange-800 dark:text-orange-200">
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
