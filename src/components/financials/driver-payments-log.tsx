
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const DriverPaymentsLog = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>سجل الدفعات للسائقين</CardTitle>
                 <CardDescription>
                    عرض وتأكيد دفع أجور السائقين المستحقة.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">سيتم بناء هذه الواجهة هنا لعرض سجل دفع أجور السائقين.</p>
            </CardContent>
        </Card>
    );
};
