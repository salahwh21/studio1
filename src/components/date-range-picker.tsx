
'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { addDays, format, isAfter, isBefore } from 'date-fns';
import { DateRange, DayPicker } from 'react-day-picker';
import { enUS } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

type DateRangePickerProps = React.HTMLAttributes<HTMLDivElement> & {
  initialDateRange?: DateRange;
  onUpdate?: (values: { range: DateRange, rangeCompare?: DateRange }) => void;
  align?: 'start' | 'center' | 'end';
  locale?: string;
  showCompare?: boolean;
};

export function DateRangePicker({
  initialDateRange,
  onUpdate,
  align = 'end',
  locale = 'ar',
  showCompare = false,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateRange || {
      from: undefined,
      to: undefined,
    }
  );
  const [compare, setCompare] = React.useState<DateRange | undefined>(undefined);

  // Helper function to format date display
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'd LLL, y', { locale: enUS });
  };

  const displayLabel =
    date?.from && date?.to
      ? `${formatDate(date.from)} - ${formatDate(date.to)}`
      : date?.from
      ? formatDate(date.from)
      : 'اختر فترة زمنية...';

  // Trigger onUpdate whenever date or compare changes
  React.useEffect(() => {
    onUpdate?.({ range: date || { from: undefined, to: undefined }, rangeCompare: compare });
  }, [date, compare, onUpdate]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[250px] justify-start text-right font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            <span>{displayLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={enUS}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
