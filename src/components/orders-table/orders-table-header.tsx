'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, ListTree, ListOrdered, Settings2, Printer, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/icon';
import { AdvancedSearch } from './orders-table-search';
import { OrdersTableColumnsMenu } from './orders-table-columns-menu';
import { OrdersTableGroupByMenu } from './orders-table-group-by-menu';
import { OrdersTableActionsMenu } from './orders-table-actions-menu';
import { OrdersTableExportMenu } from './orders-table-export-menu';
import type { Order, FilterDefinition, GroupByOption } from './types';

interface OrdersTableHeaderProps {
  filters: FilterDefinition[];
  onAddFilter: (filter: FilterDefinition) => void;
  onRemoveFilter: (index: number) => void;
  globalSearch: string;
  onGlobalSearchChange: (term: string) => void;
  isEditMode: boolean;
  onEditModeChange: (enabled: boolean) => void;
  groupBy: GroupByOption;
  onGroupByChange: (groupBy: GroupByOption) => void;
  selectedRows: string[];
  onToggleAllGroups: () => void;
  onRefresh: () => void;
  hasGroupBy: boolean;
}

export function OrdersTableHeader({
  filters,
  onAddFilter,
  onRemoveFilter,
  globalSearch,
  onGlobalSearchChange,
  isEditMode,
  onEditModeChange,
  groupBy,
  onGroupByChange,
  selectedRows,
  onToggleAllGroups,
  onRefresh,
  hasGroupBy,
}: OrdersTableHeaderProps) {
  return (
    <div className="flex-none flex-row items-center justify-between flex flex-wrap gap-2">
      <AdvancedSearch
        filters={filters}
        onAddFilter={onAddFilter}
        onRemoveFilter={onRemoveFilter}
        onGlobalSearchChange={onGlobalSearchChange}
        globalSearchTerm={globalSearch}
      />
      <div className="flex items-center gap-2">
        <Switch
          id="edit-mode"
          checked={isEditMode}
          onCheckedChange={onEditModeChange}
          className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-300"
        />
        <Separator orientation="vertical" className="h-6" />
        <OrdersTableGroupByMenu groupBy={groupBy} onGroupByChange={onGroupByChange} />
        <OrdersTableColumnsMenu />
        <OrdersTableActionsMenu selectedRows={selectedRows} />
        <OrdersTableExportMenu selectedRows={selectedRows} />
        <Button variant="outline" size="sm" onClick={onToggleAllGroups} disabled={!hasGroupBy}>
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

