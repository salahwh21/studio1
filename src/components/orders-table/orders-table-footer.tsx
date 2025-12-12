'use client';

import { CardFooter } from '@/components/ui/card';
import { OrdersTablePagination } from './orders-table-pagination';

interface OrdersTableFooterProps {
  selectedRows: string[];
  orders: any[];
  footerTotals: {
    itemPrice: number;
    deliveryFee: number;
    cod: number;
    driverFee: number;
    additionalCost: number;
    companyDue: number;
  };
  formatCurrency: (amount: number) => string;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  groupBy: any;
}

export function OrdersTableFooter({
  selectedRows,
  orders,
  footerTotals,
  formatCurrency,
  page,
  totalPages,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  groupBy,
}: OrdersTableFooterProps) {
  return (
    <CardFooter className="flex-none flex items-center justify-between p-2 border-t">
      <div className="flex items-center gap-4 text-xs font-medium">
        <div className='p-2 rounded text-xs bg-slate-800 text-white font-bold' dir="ltr" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
          {selectedRows.length > 0 ? `إجمالي المحدد (${selectedRows.length})` : `إجمالي الصفحة (${orders.length})`}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">المستحق للتاجر:</span>
          <span className="font-bold text-primary" dir="ltr" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
            {formatCurrency(footerTotals.itemPrice)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">أجور التوصيل:</span>
          <span className="font-bold text-primary" dir="ltr" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
            {formatCurrency(footerTotals.deliveryFee + footerTotals.additionalCost)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">أجور السائق:</span>
          <span className="font-bold text-primary" dir="ltr" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
            {formatCurrency(footerTotals.driverFee)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">المطلوب للشركة:</span>
          <span className="font-bold text-primary" dir="ltr" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
            {formatCurrency(footerTotals.companyDue)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">قيمة التحصيل:</span>
          <span className="font-bold text-primary" dir="ltr" style={{ fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
            {formatCurrency(footerTotals.cod)}
          </span>
        </div>
      </div>
      <OrdersTablePagination
        page={page}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        showGroupBy={!!groupBy}
      />
    </CardFooter>
  );
}

