
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { fetchWrapper } from '@/lib/fetchWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    if (!url || serverData) return;

    setLoading(true);
    fetchWrapper<T>(url)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [url, serverData, responseType]);

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
        <CardContent className="text-center font-medium">{`حدث خطأ: ${error}`}</CardContent>
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
