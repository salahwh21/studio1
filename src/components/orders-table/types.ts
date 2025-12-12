import type { Order } from '@/store/orders-store';
import type { ColumnConfig } from '@/components/export-data-dialog';

export type OrderSource = Order['source'];
export type GroupByOption = keyof Order | null;

export interface FilterDefinition {
  field: keyof Order;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
  value: string | number;
}

export interface OrderSortConfig {
  key: keyof Order;
  direction: 'ascending' | 'descending';
}

export interface OrdersTableProps {
  // Will be used for passing props if needed
}

export { type Order, type ColumnConfig };

