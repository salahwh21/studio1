'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { QuickAddOrder } from './quick-add-order';

export function QuickActions() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {/* إضافة طلب — يفتح Sheet جانبي سريع */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2"
                  onClick={() => setQuickAddOpen(true)}
                >
                  <Icon name="Plus" className="h-4 w-4" />
                  <span className="hidden sm:inline">إضافة طلب</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>إضافة طلب جديد بسرعة</p>
              </TooltipContent>
            </Tooltip>

            {/* تحديث */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.location.reload()}
                >
                  <Icon name="RefreshCw" className="h-4 w-4" />
                  <span className="hidden sm:inline">تحديث</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>تحديث البيانات</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* نافذة إضافة طلب سريع */}
      <QuickAddOrder open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
}
