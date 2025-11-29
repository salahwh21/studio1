import api from '@/lib/api';

/**
 * API Synchronization Service
 * Syncs data from backend API to Zustand stores
 */

export const apiSync = {
  // Load dashboard stats
  loadDashboardStats: async () => {
    try {
      const stats = await api.getDashboardStats();
      return stats;
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      return null;
    }
  },

  // Load orders from backend
  loadOrders: async (filters = {}) => {
    try {
      const orders = await api.getOrders(filters);
      return orders;
    } catch (error) {
      console.error('Failed to load orders:', error);
      return null;
    }
  },

  // Load users from backend
  loadUsers: async (role?: string) => {
    try {
      const users = await api.getUsers(role);
      return users;
    } catch (error) {
      console.error('Failed to load users:', error);
      return null;
    }
  },

  // Load available drivers
  loadAvailableDrivers: async () => {
    try {
      const drivers = await api.getAvailableDrivers();
      return drivers;
    } catch (error) {
      console.error('Failed to load drivers:', error);
      return null;
    }
  },

  // Sync order status
  syncOrderStatus: async (orderId: string, status: string, driverId?: string) => {
    try {
      const result = await api.updateOrderStatus(orderId, status, driverId);
      return result;
    } catch (error) {
      console.error('Failed to sync order status:', error);
      throw error;
    }
  },

  // Create order via API
  createOrder: async (orderData: any) => {
    try {
      const result = await api.createOrder(orderData);
      return result;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }
};

export default apiSync;
