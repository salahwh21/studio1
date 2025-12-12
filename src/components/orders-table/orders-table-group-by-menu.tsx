'use client';

import { ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { GROUP_BY_OPTIONS, type GroupByOption } from './orders-table-constants';

interface OrdersTableGroupByMenuProps {
  groupBy: GroupByOption;
  onGroupByChange: (groupBy: GroupByOption) => void;
}

export function OrdersTableGroupByMenu({ groupBy, onGroupByChange }: OrdersTableGroupByMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <ListTree className="h-4 w-4" />
          <span>التجميع حسب</span>
          {groupBy && <Badge variant="secondary" className='mr-1'>{GROUP_BY_OPTIONS.find(o => o.value === groupBy)?.label}</Badge>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>اختر حقل للتجميع</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {GROUP_BY_OPTIONS.map(option => (
          <DropdownMenuCheckboxItem key={option.label} checked={groupBy === option.value} onSelect={() => onGroupByChange(option.value)}>
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

