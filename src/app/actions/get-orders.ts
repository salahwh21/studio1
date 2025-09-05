
'use server';

import { ordersStore, type Order } from '@/store/orders-store';

export type OrderSortConfig = {
  key: keyof Order;
  direction: 'ascending' | 'descending';
};

type GetOrdersParams = {
  page: number;
  rowsPerPage: number;
  searchQuery?: string;
  sortConfig?: OrderSortConfig | null;
  filters?: {
    status?: string | null;
    driver?: string | null;
  };
};

export async function getOrders(params: GetOrdersParams): Promise<{ orders: Order[], totalCount: number }> {
  const { page, rowsPerPage, searchQuery, sortConfig, filters } = params;

  // In a real app, this data would come from a database.
  // For now, we're using the Zustand store as a mock database.
  const allOrders = ordersStore.getState().orders;

  // 1. Filtering
  let filteredOrders = allOrders.filter(order => {
    const searchLower = searchQuery?.toLowerCase() ?? '';
    const searchMatch = !searchQuery ||
        order.recipient.toLowerCase().includes(searchLower) ||
        order.phone.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.merchant.toLowerCase().includes(searchLower) ||
        (order.referenceNumber && order.referenceNumber.toLowerCase().includes(searchLower));
    
    const statusMatch = !filters?.status || order.status === filters.status;
    const driverMatch = !filters?.driver || order.driver === filters.driver;

    return searchMatch && statusMatch && driverMatch;
  });

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
