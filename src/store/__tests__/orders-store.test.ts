import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ordersStore } from '../orders-store';

// Mock the API
vi.mock('@/lib/api', () => ({
  default: {
    getOrders: vi.fn(),
    createOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

describe('Orders Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    ordersStore.setState({
      orders: [],
      nextOrderNumber: 1,
      isLoading: false,
      error: null,
    });
  });

  describe('Initial State', () => {
    it('should have empty orders initially', () => {
      const state = ordersStore.getState();
      expect(state.orders).toEqual([]);
      expect(state.nextOrderNumber).toBe(1);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setOrders', () => {
    it('should set orders and update nextOrderNumber', () => {
      const mockOrders = [
        {
          id: 'ORD-001',
          orderNumber: 1,
          recipient: 'Test User',
          phone: '0791234567',
          address: 'Test Address',
          city: 'عمان',
          region: 'الصويفية',
          status: 'بالانتظار',
          previousStatus: '',
          driver: 'غير معين',
          merchant: 'Test Merchant',
          cod: 50,
          itemPrice: 48,
          deliveryFee: 2,
          additionalCost: 0,
          driverFee: 1.5,
          driverAdditionalFare: 0,
          date: '2024-12-04',
          notes: '',
          source: 'Manual' as const,
          referenceNumber: '',
          whatsapp: '',
        },
      ];

      ordersStore.getState().setOrders(mockOrders);
      const state = ordersStore.getState();

      expect(state.orders).toHaveLength(1);
      expect(state.orders[0].id).toBe('ORD-001');
      expect(state.nextOrderNumber).toBe(2);
    });
  });

  describe('updateOrderField', () => {
    it('should update a specific field of an order', () => {
      const mockOrder = {
        id: 'ORD-001',
        orderNumber: 1,
        recipient: 'Test User',
        phone: '0791234567',
        address: 'Test Address',
        city: 'عمان',
        region: 'الصويفية',
        status: 'بالانتظار',
        previousStatus: '',
        driver: 'غير معين',
        merchant: 'Test Merchant',
        cod: 50,
        itemPrice: 48,
        deliveryFee: 2,
        additionalCost: 0,
        driverFee: 1.5,
        driverAdditionalFare: 0,
        date: '2024-12-04',
        notes: '',
        source: 'Manual' as const,
        referenceNumber: '',
        whatsapp: '',
      };

      ordersStore.getState().setOrders([mockOrder]);
      ordersStore.getState().updateOrderField('ORD-001', 'recipient', 'Updated User');

      const state = ordersStore.getState();
      expect(state.orders[0].recipient).toBe('Updated User');
    });

    it('should update previousStatus when status is changed', () => {
      const mockOrder = {
        id: 'ORD-001',
        orderNumber: 1,
        recipient: 'Test User',
        phone: '0791234567',
        address: 'Test Address',
        city: 'عمان',
        region: 'الصويفية',
        status: 'بالانتظار',
        previousStatus: '',
        driver: 'غير معين',
        merchant: 'Test Merchant',
        cod: 50,
        itemPrice: 48,
        deliveryFee: 2,
        additionalCost: 0,
        driverFee: 1.5,
        driverAdditionalFare: 0,
        date: '2024-12-04',
        notes: '',
        source: 'Manual' as const,
        referenceNumber: '',
        whatsapp: '',
      };

      ordersStore.getState().setOrders([mockOrder]);
      ordersStore.getState().updateOrderField('ORD-001', 'status', 'جاري التوصيل');

      const state = ordersStore.getState();
      expect(state.orders[0].status).toBe('جاري التوصيل');
      expect(state.orders[0].previousStatus).toBe('بالانتظار');
    });
  });

  describe('deleteOrders', () => {
    it('should delete orders by IDs', () => {
      const mockOrders = [
        {
          id: 'ORD-001',
          orderNumber: 1,
          recipient: 'User 1',
          phone: '0791234567',
          address: 'Address 1',
          city: 'عمان',
          region: 'الصويفية',
          status: 'بالانتظار',
          previousStatus: '',
          driver: 'غير معين',
          merchant: 'Merchant 1',
          cod: 50,
          itemPrice: 48,
          deliveryFee: 2,
          additionalCost: 0,
          driverFee: 1.5,
          driverAdditionalFare: 0,
          date: '2024-12-04',
          notes: '',
          source: 'Manual' as const,
          referenceNumber: '',
          whatsapp: '',
        },
        {
          id: 'ORD-002',
          orderNumber: 2,
          recipient: 'User 2',
          phone: '0791234568',
          address: 'Address 2',
          city: 'عمان',
          region: 'خلدا',
          status: 'بالانتظار',
          previousStatus: '',
          driver: 'غير معين',
          merchant: 'Merchant 2',
          cod: 60,
          itemPrice: 58,
          deliveryFee: 2,
          additionalCost: 0,
          driverFee: 1.5,
          driverAdditionalFare: 0,
          date: '2024-12-04',
          notes: '',
          source: 'Manual' as const,
          referenceNumber: '',
          whatsapp: '',
        },
      ];

      ordersStore.getState().setOrders(mockOrders);
      ordersStore.getState().deleteOrders(['ORD-001']);

      const state = ordersStore.getState();
      expect(state.orders).toHaveLength(1);
      expect(state.orders[0].id).toBe('ORD-002');
    });
  });

  describe('bulkUpdateOrderStatus', () => {
    it('should update status for multiple orders', () => {
      const mockOrders = [
        {
          id: 'ORD-001',
          orderNumber: 1,
          recipient: 'User 1',
          phone: '0791234567',
          address: 'Address 1',
          city: 'عمان',
          region: 'الصويفية',
          status: 'بالانتظار',
          previousStatus: '',
          driver: 'غير معين',
          merchant: 'Merchant 1',
          cod: 50,
          itemPrice: 48,
          deliveryFee: 2,
          additionalCost: 0,
          driverFee: 1.5,
          driverAdditionalFare: 0,
          date: '2024-12-04',
          notes: '',
          source: 'Manual' as const,
          referenceNumber: '',
          whatsapp: '',
        },
        {
          id: 'ORD-002',
          orderNumber: 2,
          recipient: 'User 2',
          phone: '0791234568',
          address: 'Address 2',
          city: 'عمان',
          region: 'خلدا',
          status: 'بالانتظار',
          previousStatus: '',
          driver: 'غير معين',
          merchant: 'Merchant 2',
          cod: 60,
          itemPrice: 58,
          deliveryFee: 2,
          additionalCost: 0,
          driverFee: 1.5,
          driverAdditionalFare: 0,
          date: '2024-12-04',
          notes: '',
          source: 'Manual' as const,
          referenceNumber: '',
          whatsapp: '',
        },
      ];

      ordersStore.getState().setOrders(mockOrders);
      ordersStore.getState().bulkUpdateOrderStatus(['ORD-001', 'ORD-002'], 'جاري التوصيل');

      const state = ordersStore.getState();
      expect(state.orders[0].status).toBe('جاري التوصيل');
      expect(state.orders[1].status).toBe('جاري التوصيل');
      expect(state.orders[0].previousStatus).toBe('بالانتظار');
      expect(state.orders[1].previousStatus).toBe('بالانتظار');
    });
  });
});
