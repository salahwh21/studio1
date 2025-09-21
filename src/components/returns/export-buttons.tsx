'use client';
import React from 'react';
import { generateDriverSlipExcel, generateMerchantSlipExcel } from '@/services/excel-export-service';
import type { DriverSlip, MerchantSlip } from '@/store/returns-store';
import type { User } from '@/store/user-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '../icon';

interface ExportButtonsProps {
  driverSlips: DriverSlip[];
  merchantSlips: MerchantSlip[];
  users: User[];
  reportsLogo: string | null;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ driverSlips, merchantSlips, users, reportsLogo }) => {
  return (
    <Card>
        <CardHeader>
            <CardTitle>تصدير جميع الكشوفات</CardTitle>
            <CardDescription>
                تصدير جميع كشوفات السائقين أو التجار المتاحة حالياً إلى ملف Excel.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
            <Button
                disabled={driverSlips.length === 0}
                onClick={() => generateDriverSlipExcel(driverSlips, users, reportsLogo)}
            >
                <Icon name="FileDown" className="ml-2 h-4 w-4"/>
                تصدير كشوفات السائقين ({driverSlips.length})
            </Button>

            <Button
                variant="secondary"
                disabled={merchantSlips.length === 0}
                onClick={() => generateMerchantSlipExcel(merchantSlips, users, reportsLogo)}
            >
                <Icon name="FileDown" className="ml-2 h-4 w-4"/>
                تصدير كشوفات التجار ({merchantSlips.length})
            </Button>
        </CardContent>
    </Card>
  );
};
