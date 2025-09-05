
'use server';

import { ordersStore, type Order } from '@/store/orders-store';

export type OrderSortConfig = {
  key: keyof Order;
  direction: 'ascending' | 'descending';
};

export type FilterDefinition = {
  field: string;
  operator: 'contains' | 'equals';
  value: string;
}

type GetOrdersParams = {
  page: number;
  rowsPerPage: number;
  sortConfig?: OrderSortConfig | null;
  filters?: FilterDefinition[];
};

export async function getOrders(params: GetOrdersParams): Promise<{ orders: Order[], totalCount: number }> {
  const { page, rowsPerPage, sortConfig, filters } = params;

  // In a real app, this data would come from a database.
  // For now, we're using the Zustand store as a mock database.
  const allOrders = ordersStore.getState().orders;

  // 1. Filtering
  let filteredOrders = allOrders;

  if (filters && filters.length > 0) {
    filteredOrders = allOrders.filter(order => {
      return filters.every(filter => {
        const orderValue = order[filter.field as keyof Order] as string | undefined;
        if (orderValue === undefined) return false;

        const filterValueLower = filter.value.toLowerCase();
        const orderValueLower = String(orderValue).toLowerCase();

        if (filter.operator === 'contains') {
          return orderValueLower.includes(filterValueLower);
        }
        if (filter.operator === 'equals') {
          return orderValueLower === filterValueLower;
        }
        return true;
      });
    });
  }

  // 2. Sorting
  if (sortConfig) {
    filteredOrders.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      
      if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }

  const totalCount = filteredOrders.length;

  // 3. Pagination
  const startIndex = page * rowsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

  return {
    orders: paginatedOrders,
    totalCount: totalCount,
  };
}
