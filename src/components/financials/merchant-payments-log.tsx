
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const MerchantPaymentsLog = () => {
     return (
        <Card>
            <CardHeader>
                <CardTitle>سجل دفعات التجار</CardTitle>
                 <CardDescription>
                    عرض وطباعة وتأكيد كشوفات الدفع التي تم إنشاؤها للتجار.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">سيتم بناء هذه الواجهة هنا لعرض سجل دفعات التجار وتأكيدها.</p>
            </CardContent>
        </Card>
    );
}
