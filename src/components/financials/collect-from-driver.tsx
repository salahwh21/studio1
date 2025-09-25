
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const CollectFromDriver = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>المرحلة الأولى: تحصيل المبالغ من السائقين</CardTitle>
        <CardDescription>
          عرض المبالغ المستحقة على السائقين من الشحنات التي تم توصيلها وتأكيد استلامها.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">سيتم بناء هذه الواجهة هنا لإدارة عملية التحصيل اليومي من السائقين.</p>
      </CardContent>
    </Card>
  );
};
