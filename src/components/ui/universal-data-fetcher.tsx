
'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { fetchWrapper } from '@/lib/fetchWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';

type UniversalDataFetcherProps<T> = {
  url?: string;                     // URL لجلب البيانات على العميل
  serverData?: T;                   // بيانات Server-side
  children: (data: T) => ReactNode;
  responseType?: 'json' | 'text' | 'blob';
};

export function UniversalDataFetcherUI<T>({
  url,
  serverData,
  children,
  responseType = 'json',
}: UniversalDataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(serverData || null);
  const [loading, setLoading] = useState(!serverData && !!url);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    if (!url) return;
    setLoading(true);
    setError(null);

    fetchWrapper<T>(url)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [url, responseType]);

  useEffect(() => {
    if (!serverData) fetchData();
  }, [serverData, fetchData]);

  if (loading)
    return (
      <Card className="p-4 text-center animate-pulse">
        <CardContent className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin w-6 h-6 text-primary" />
          <span className="text-primary font-medium">جاري تحميل البيانات...</span>
        </CardContent>
      </Card>
    );

  if (error)
    return (
      <Card className="p-4 border-red-400 bg-red-50 text-red-700">
        <CardContent className="text-center font-medium flex flex-col items-center gap-2">
          <span>حدث خطأ: {error}</span>
          {url && (
            <Button onClick={fetchData} variant="outline" size="sm" className="flex items-center gap-2 mt-2">
              <RefreshCcw className="w-4 h-4" /> إعادة المحاولة
            </Button>
          )}
        </CardContent>
      </Card>
    );

  if (!data)
    return (
      <Card className="p-4 border-yellow-400 bg-yellow-50 text-yellow-700">
        <CardContent className="text-center font-medium">لا توجد بيانات لعرضها.</CardContent>
      </Card>
    );

  return <>{children(data)}</>;
}
