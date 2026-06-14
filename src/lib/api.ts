const API_URL = '/api';

// Note: JWT is now stored in httpOnly cookie and sent automatically with credentials: 'include'
const defaultFetchOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

async function handleResponse(res: Response) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  logout: async () => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      ...defaultFetchOptions,
      method: 'POST',
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_URL}/auth/me`, defaultFetchOptions);
    return handleResponse(res);
  },

  refreshToken: async () => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      ...defaultFetchOptions,
      method: 'POST',
    });
    return handleResponse(res);
  },

  getDashboardStats: async () => {
    const res = await fetch(`${API_URL}/dashboard/stats`, defaultFetchOptions);
    return handleResponse(res);
  },

  getRevenueStats: async (period = 'day') => {
    const res = await fetch(`${API_URL}/dashboard/revenue?period=${period}`, defaultFetchOptions);
    return handleResponse(res);
  },

  getDriversStats: async () => {
    const res = await fetch(`${API_URL}/dashboard/drivers-stats`, defaultFetchOptions);
    return handleResponse(res);
  },

  getDriverLocations: async () => {
    const res = await fetch(`${API_URL}/drivers/locations`, defaultFetchOptions);
    return handleResponse(res);
  },

  getOrdersByStatus: async () => {
    const res = await fetch(`${API_URL}/dashboard/orders-by-status`, defaultFetchOptions);
    return handleResponse(res);
  },

  getDriverPerformance: async () => {
    const res = await fetch(`${API_URL}/dashboard/driver-performance`, defaultFetchOptions);
    return handleResponse(res);
  },

  getHourlyOrders: async () => {
    const res = await fetch(`${API_URL}/dashboard/hourly-orders`, defaultFetchOptions);
    return handleResponse(res);
  },

  getTopAreas: async () => {
    const res = await fetch(`${API_URL}/dashboard/top-areas`, defaultFetchOptions);
    return handleResponse(res);
  },

  getTopMerchants: async () => {
    const res = await fetch(`${API_URL}/dashboard/top-merchants`, defaultFetchOptions);
    return handleResponse(res);
  },

  getWeeklyComparison: async () => {
    const res = await fetch(`${API_URL}/dashboard/weekly-comparison`, defaultFetchOptions);
    return handleResponse(res);
  },

  getOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters as any);
    const res = await fetch(`${API_URL}/orders?${params}`, defaultFetchOptions);
    return handleResponse(res);
  },

  getOrderById: async (orderId: string) => {
    const res = await fetch(`${API_URL}/orders/${orderId}`, defaultFetchOptions);
    return handleResponse(res);
  },

  createOrder: async (orderData: any) => {
    const res = await fetch(`${API_URL}/orders`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  updateOrderStatus: async (orderId: string, status: string, driverId?: string | null) => {
    const body: any = { status };
    if (driverId !== undefined) body.driver_id = driverId; // null = مسح صريح، string = تعيين
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      ...defaultFetchOptions,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  updateOrder: async (orderId: string, data: any) => {
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteOrder: async (orderId: string) => {
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  bulkDeleteOrders: async (orderIds: string[]) => {
    const res = await fetch(`${API_URL}/orders/bulk-delete`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({ orderIds }),
    });
    return handleResponse(res);
  },

  getAvailableDrivers: async () => {
    const res = await fetch(`${API_URL}/drivers/available`, defaultFetchOptions);
    return handleResponse(res);
  },

  updateDriverLocation: async (driverId: string, latitude: number, longitude: number) => {
    const res = await fetch(`${API_URL}/drivers/${driverId}/location`, {
      ...defaultFetchOptions,
      method: 'PATCH',
      body: JSON.stringify({ latitude, longitude }),
    });
    return handleResponse(res);
  },

  updateDriverStatus: async (driverId: string, is_online: boolean) => {
    const res = await fetch(`${API_URL}/drivers/${driverId}/status`, {
      ...defaultFetchOptions,
      method: 'PATCH',
      body: JSON.stringify({ is_online }),
    });
    return handleResponse(res);
  },

  getDriverOrders: async (driverId: string, status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const res = await fetch(`${API_URL}/drivers/${driverId}/orders?${params}`, defaultFetchOptions);
    return handleResponse(res);
  },

  getDriverStats: async (driverId: string) => {
    const res = await fetch(`${API_URL}/drivers/${driverId}/stats`, defaultFetchOptions);
    return handleResponse(res);
  },

  getUsers: async (role?: string) => {
    const params = role ? `?role=${role}` : '';
    const res = await fetch(`${API_URL}/users${params}`, defaultFetchOptions);
    return handleResponse(res);
  },

  createUser: async (userData: any) => {
    const res = await fetch(`${API_URL}/users`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  updateUser: async (userId: string, userData: any) => {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  deleteUser: async (userId: string) => {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  bulkDeleteUsers: async (userIds: string[]) => {
    const res = await fetch(`${API_URL}/users/bulk-delete`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
    return handleResponse(res);
  },

  healthCheck: async () => {
    const res = await fetch(`${API_URL.replace('/api', '')}/api/health`, defaultFetchOptions);
    return handleResponse(res);
  },

  // Settings API
  getSettings: async () => {
    const res = await fetch(`${API_URL}/settings`, defaultFetchOptions);
    return handleResponse(res);
  },

  updateSettings: async (settings: any) => {
    const res = await fetch(`${API_URL}/settings`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },

  updateSettingSection: async (section: string, data: any) => {
    const res = await fetch(`${API_URL}/settings/${section}`, {
      ...defaultFetchOptions,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // User preferences API
  getPreferences: async () => {
    const res = await fetch(`${API_URL}/auth/preferences`, defaultFetchOptions);
    return handleResponse(res);
  },

  savePreferences: async (patch: Record<string, unknown>) => {
    const res = await fetch(`${API_URL}/auth/preferences`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify(patch),
    });
    return handleResponse(res);
  },

  // Areas API
  getAreas: async () => {
    const res = await fetch(`${API_URL}/areas/all`, defaultFetchOptions);
    return handleResponse(res);
  },

  getCities: async () => {
    const res = await fetch(`${API_URL}/areas/cities`, defaultFetchOptions);
    return handleResponse(res);
  },

  getRegionsByCity: async (cityId: string) => {
    const res = await fetch(`${API_URL}/areas/cities/${cityId}/regions`, defaultFetchOptions);
    return handleResponse(res);
  },

  createCity: async (name: string) => {
    const res = await fetch(`${API_URL}/areas/cities`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },

  createRegion: async (name: string, cityId: string) => {
    const res = await fetch(`${API_URL}/areas/regions`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({ name, cityId }),
    });
    return handleResponse(res);
  },

  deleteCity: async (id: string) => {
    const res = await fetch(`${API_URL}/areas/cities/${id}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  deleteRegion: async (id: string) => {
    const res = await fetch(`${API_URL}/areas/regions/${id}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Financials API
  // Merchant Payments
  getMerchantPaymentSlips: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_URL}/financials/merchant-payments?${params}`, defaultFetchOptions);
    return handleResponse(res);
  },

  createMerchantPaymentSlip: async (data: any) => {
    const res = await fetch(`${API_URL}/financials/merchant-payments`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateMerchantPaymentStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/financials/merchant-payments/${id}/status`, {
      ...defaultFetchOptions,
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  updateMerchantPaymentSlip: async (id: string, orderIds: string[]) => {
    const res = await fetch(`${API_URL}/financials/merchant-payments/${id}`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify({ orderIds }),
    });
    return handleResponse(res);
  },

  deleteMerchantPaymentSlip: async (id: string) => {
    const res = await fetch(`${API_URL}/financials/merchant-payments/${id}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Driver Payments
  getDriverPaymentSlips: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_URL}/financials/driver-payments?${params}`, defaultFetchOptions);
    return handleResponse(res);
  },

  createDriverPaymentSlip: async (data: any) => {
    const res = await fetch(`${API_URL}/financials/driver-payments`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateDriverPaymentSlip: async (id: string, orderIds: string[]) => {
    const res = await fetch(`${API_URL}/financials/driver-payments/${id}`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify({ orderIds }),
    });
    return handleResponse(res);
  },

  deleteDriverPaymentSlip: async (id: string) => {
    const res = await fetch(`${API_URL}/financials/driver-payments/${id}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Financial Stats & Overview
  getFinancialOverview: async (period = 'month', startDate?: string, endDate?: string) => {
    let query = `period=${period}`;
    if (startDate && endDate) {
      query += `&startDate=${startDate}&endDate=${endDate}`;
    }
    const res = await fetch(`${API_URL}/financials/overview?${query}`, defaultFetchOptions);
    return handleResponse(res);
  },

  getDebtAlerts: async () => {
    const res = await fetch(`${API_URL}/financials/debt-alerts`, defaultFetchOptions);
    return handleResponse(res);
  },

  getDriverStatistics: async (driverName: string, period = 'today') => {
    const res = await fetch(`${API_URL}/financials/driver-statistics/${encodeURIComponent(driverName)}?period=${period}`, defaultFetchOptions);
    return handleResponse(res);
  },

  getMerchantStatistics: async (merchantName: string, period = 'month') => {
    const res = await fetch(`${API_URL}/financials/merchant-statistics/${encodeURIComponent(merchantName)}?period=${period}`, defaultFetchOptions);
    return handleResponse(res);
  },

  // Roles API
  getRoles: async () => {
    const res = await fetch(`${API_URL}/roles`, defaultFetchOptions);
    return handleResponse(res);
  },

  createRole: async (roleData: { name: string; description?: string }) => {
    const res = await fetch(`${API_URL}/roles`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(roleData),
    });
    return handleResponse(res);
  },

  updateRole: async (roleId: string, roleData: { name?: string; description?: string }) => {
    const res = await fetch(`${API_URL}/roles/${roleId}`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
    return handleResponse(res);
  },

  updateRolePermissions: async (roleId: string, permissions: string[]) => {
    const res = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
    return handleResponse(res);
  },

  deleteRole: async (roleId: string) => {
    const res = await fetch(`${API_URL}/roles/${roleId}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Statuses API
  getStatuses: async () => {
    const res = await fetch(`${API_URL}/statuses`, defaultFetchOptions);
    return handleResponse(res);
  },

  createStatus: async (statusData: any) => {
    const res = await fetch(`${API_URL}/statuses`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(statusData),
    });
    return handleResponse(res);
  },

  updateStatus: async (statusId: string, statusData: any) => {
    const res = await fetch(`${API_URL}/statuses/${statusId}`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
    return handleResponse(res);
  },

  deleteStatus: async (statusId: string) => {
    const res = await fetch(`${API_URL}/statuses/${statusId}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Returns API
  getDriversWithReturns: async () => {
    const res = await fetch(`${API_URL}/returns/drivers-with-returns`, defaultFetchOptions);
    return handleResponse(res) as Promise<{ drivers: Array<{ name: string; orderCount: number; totalCod: number }> }>;
  },

  createDriverReturnSlip: async (data: { driverName: string; orderIds: string[]; date?: string }) => {
    const res = await fetch(`${API_URL}/returns/driver-slips`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getDriverReturnSlips: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_URL}/returns/driver-slips?${params}`, defaultFetchOptions);
    return handleResponse(res);
  },

  getDriverReturnSlip: async (id: string) => {
    const res = await fetch(`${API_URL}/returns/driver-slips/${id}`, defaultFetchOptions);
    return handleResponse(res);
  },

  deleteDriverReturnSlip: async (id: string) => {
    const res = await fetch(`${API_URL}/returns/driver-slips/${id}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  removeOrderFromDriverSlip: async (slipId: string, orderId: string) => {
    const res = await fetch(`${API_URL}/returns/driver-slips/${slipId}/orders/${orderId}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  getMerchantReturnSlips: async (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_URL}/returns/merchant-slips?${params}`, defaultFetchOptions);
    return handleResponse(res);
  },

  updateMerchantReturnSlipStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/returns/merchant-slips/${id}/status`, {
      ...defaultFetchOptions,
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  createMerchantReturnSlip: async (data: { merchant: string; orderIds: string[]; date?: string }) => {
    const res = await fetch(`${API_URL}/returns/merchant-slips`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteMerchantReturnSlip: async (id: string) => {
    const res = await fetch(`${API_URL}/returns/merchant-slips/${id}`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Notifications API
  getWhatsAppUrl: async (orderId: string, templateKey?: string, customMessage?: string) => {
    const res = await fetch(`${API_URL}/notifications/whatsapp`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({ orderId, templateKey, customMessage }),
    });
    return handleResponse(res) as Promise<{ url: string; phone: string; message: string }>;
  },

  getNotificationTemplates: async () => {
    const res = await fetch(`${API_URL}/notifications/templates`, defaultFetchOptions);
    return handleResponse(res) as Promise<{ templates: Array<{ key: string; name: string; content: string }> }>;
  },
};

export default api;
