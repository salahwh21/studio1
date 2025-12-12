const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  getOrdersByStatus: async () => {
    const res = await fetch(`${API_URL}/dashboard/orders-by-status`, defaultFetchOptions);
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

  updateOrderStatus: async (orderId: string, status: string, driverId?: string) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      ...defaultFetchOptions,
      method: 'PATCH',
      body: JSON.stringify({ status, driver_id: driverId }),
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
  getMerchantPaymentSlips: async () => {
    const res = await fetch(`${API_URL}/financials/merchant-payments`, defaultFetchOptions);
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
  }
};

export default api;
