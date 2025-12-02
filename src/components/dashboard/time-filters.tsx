'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { DateRange } from 'react-day-picker';
import { subDays, startOfToday, startOfWeek, startOfMonth, subMonths } from 'date-fns';

type TimePeriod = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thismonth' | 'lastmonth' | 'custom';

interface TimeFiltersProps {
  onPeriodChange?: (period: TimePeriod, dateRange?: DateRange) => void;
  showCompare?: boolean;
  defaultPeriod?: TimePeriod;
}

export function TimeFilters({ 
  onPeriodChange, 
  showCompare = true,
  defaultPeriod = 'today' 
}: TimeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(
    (searchParams.get('period') as TimePeriod) || defaultPeriod
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [compareMode, setCompareMode] = useState(
    searchParams.get('compare') === 'true'
  );

  const getDateRangeForPeriod = (period: TimePeriod): DateRange => {
    const today = startOfToday();
    
    switch (period) {
      case 'today':
        return { from: today, to: today };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { from: yesterday, to: yesterday };
      case 'last7days':
        return { from: subDays(today, 7), to: today };
      case 'last30days':
        return { from: subDays(today, 30), to: today };
      case 'thismonth':
        return { from: startOfMonth(today), to: today };
      case 'lastmonth':
        const lastMonthStart = startOfMonth(subMonths(today, 1));
        const lastMonthEnd = subDays(startOfMonth(today), 1);
        return { from: lastMonthStart, to: lastMonthEnd };
      default:
        return { from: today, to: today };
    }
  };

  useEffect(() => {
    if (selectedPeriod !== 'custom') {
      const range = getDateRangeForPeriod(selectedPeriod);
      setDateRange(range);
      updateURL(selectedPeriod, range);
    }
  }, [selectedPeriod]);

  const updateURL = (period: TimePeriod, range?: DateRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    
    if (range?.from && range?.to) {
      params.set('from', range.from.toISOString());
      params.set('to', range.to.toISOString());
    }
    
    if (compareMode) {
      params.set('compare', 'true');
    } else {
      params.delete('compare');
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      const range = getDateRangeForPeriod(period);
      setDateRange(range);
      updateURL(period, range);
      onPeriodChange?.(period, range);
    } else {
      onPeriodChange?.(period, dateRange);
    }
  };

  const handleDateRangeUpdate = ({ range }: { range: DateRange; rangeCompare?: DateRange }) => {
    setDateRange(range);
    if (selectedPeriod === 'custom' && range.from && range.to) {
      updateURL('custom', range);
      onPeriodChange?.('custom', range);
    }
  };

  const handleCompareToggle = (checked: boolean) => {
    setCompareMode(checked);
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set('compare', 'true');
    } else {
      params.delete('compare');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    setSelectedPeriod('today');
    setDateRange(undefined);
    setCompareMode(false);
    router.push('?period=today', { scroll: false });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Icon name="Filter" className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">الفترة الزمنية</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="yesterday">أمس</SelectItem>
            <SelectItem value="last7days">آخر 7 أيام</SelectItem>
            <SelectItem value="last30days">آخر 30 يوم</SelectItem>
            <SelectItem value="thismonth">هذا الشهر</SelectItem>
            <SelectItem value="lastmonth">الشهر الماضي</SelectItem>
            <SelectItem value="custom">مخصص</SelectItem>
          </SelectContent>
        </Select>

        {selectedPeriod === 'custom' && (
          <DateRangePicker
            initialDateRange={dateRange}
            onUpdate={handleDateRangeUpdate}
            className="w-auto"
          />
        )}

        {showCompare && (
          <div className="flex items-center gap-2">
            <Switch
              id="compare-mode"
              checked={compareMode}
              onCheckedChange={handleCompareToggle}
            />
            <Label htmlFor="compare-mode" className="text-sm cursor-pointer">
              مقارنة مع الفترة السابقة
            </Label>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="gap-2"
        >
          <Icon name="X" className="h-4 w-4" />
          إعادة تعيين
        </Button>
      </div>
    </div>
  );
}

