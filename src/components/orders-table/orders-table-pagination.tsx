'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface OrdersTablePaginationProps {
  page: number;
  totalPages: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  showGroupBy?: boolean;
}

export function OrdersTablePagination({
  page,
  totalPages,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  showGroupBy = false,
}: OrdersTablePaginationProps) {
  if (showGroupBy) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">صفوف الصفحة:</p>
        <Select
          value={`${rowsPerPage}`}
          onValueChange={(value) => {
            onRowsPerPageChange(Number(value));
            onPageChange(0);
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={rowsPerPage} />
          </SelectTrigger>
          <SelectContent side="top">
            {[100, 250, 500].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
            <SelectItem value={`${totalCount}`}>
              الكل
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="text-sm font-medium">
        صفحة {page + 1} من {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(0)}
          disabled={page === 0}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

