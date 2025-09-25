
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PrepareMerchantPayments = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>تجهيز مستحقات التجار</CardTitle>
                 <CardDescription>
                    تجميع المبالغ المستحقة للتجار من الطلبات المكتملة وإنشاء كشوفات دفع.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">سيتم بناء هذه الواجهة هنا لتجميع وتجهيز كشوفات دفع التجار.</p>
            </CardContent>
        </Card>
    );
};
