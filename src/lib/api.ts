const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  // Dashboard stats
  getDashboardStats: async () => {
    const res = await fetch(`${API_URL}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  getRevenueStats: async (period = 'day') => {
    const res = await fetch(`${API_URL}/dashboard/revenue?period=${period}`);
    if (!res.ok) throw new Error('Failed to fetch revenue stats');
    return res.json();
  },

  getDriversStats: async () => {
    const res = await fetch(`${API_URL}/dashboard/drivers-stats`);
    if (!res.ok) throw new Error('Failed to fetch drivers stats');
    return res.json();
  },

  getOrdersByStatus: async () => {
    const res = await fetch(`${API_URL}/dashboard/orders-by-status`);
    if (!res.ok) throw new Error('Failed to fetch orders by status');
    return res.json();
  },

  // Orders
  getOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_URL}/orders?${params}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  getOrderById: async (orderId: string) => {
    const res = await fetch(`${API_URL}/orders/${orderId}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  createOrder: async (orderData: any) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  updateOrderStatus: async (orderId: string, status: string, driverId?: string) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, driver_id: driverId })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Drivers
  getAvailableDrivers: async () => {
    const res = await fetch(`${API_URL}/drivers/available`);
    if (!res.ok) throw new Error('Failed to fetch available drivers');
    return res.json();
  },

  updateDriverLocation: async (driverId: string, latitude: number, longitude: number) => {
    const res = await fetch(`${API_URL}/drivers/${driverId}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude })
    });
    if (!res.ok) throw new Error('Failed to update driver location');
    return res.json();
  },

  updateDriverStatus: async (driverId: string, is_online: boolean) => {
    const res = await fetch(`${API_URL}/drivers/${driverId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_online })
    });
    if (!res.ok) throw new Error('Failed to update driver status');
    return res.json();
  },

  getDriverOrders: async (driverId: string, status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const res = await fetch(`${API_URL}/drivers/${driverId}/orders?${params}`);
    if (!res.ok) throw new Error('Failed to fetch driver orders');
    return res.json();
  },

  getDriverStats: async (driverId: string) => {
    const res = await fetch(`${API_URL}/drivers/${driverId}/stats`);
    if (!res.ok) throw new Error('Failed to fetch driver stats');
    return res.json();
  },

  // Users
  getUsers: async (role?: string) => {
    const params = role ? `?role=${role}` : '';
    const res = await fetch(`${API_URL}/users${params}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  },

  // Health check
  healthCheck: async () => {
    const res = await fetch(`${API_URL.replace('/api', '')}/api/health`);
    if (!res.ok) throw new Error('Backend is not available');
    return res.json();
  }
};

export default api;
