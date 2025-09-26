'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Order } from './orders-store';
import { ordersStore } from './orders-store';

export type DriverReturnSlip = {
  id: string;
  driverName: string;
  date: string;
  itemCount: number;
  orders: Order[];
};

export type MerchantSlip = {
  id: string;
  merchant: string;
  date: string;
  items: number;
  status: 'جاهز للتسليم' | 'تم التسليم';
  orders: Order[];
};

// --- Mock Data ---
const createInitialDriverSlips = (): DriverReturnSlip[] => {
  const { orders } = ordersStore.getState();
  const abuAlAbdOrders = orders.filter(o => o.driver === 'ابو العبد' && o.status === 'مرجع للفرع').slice(0, 3);
  const mohammadSweidOrders = orders.filter(o => o.driver === 'محمد سويد' && o.status === 'مرجع للفرع').slice(0, 2);

  return [
    ...(abuAlAbdOrders.length > 0 ? [{
      id: `DRS-1721650000000`, // Changed prefix to Driver Return Slip
      driverName: 'ابو العبد',
      date: new Date('2024-07-22').toISOString(),
      itemCount: abuAlAbdOrders.length,
      orders: abuAlAbdOrders
    }] : []),
     ...(mohammadSweidOrders.length > 0 ? [{
      id: `DRS-1721563600000`, // Changed prefix
      driverName: 'محمد سويد',
      date: new Date('2024-07-21').toISOString(),
      itemCount: mohammadSweidOrders.length,
      orders: mohammadSweidOrders
    }] : []),
  ];
}


type ReturnsState = {
  driverReturnSlips: DriverReturnSlip[];
  merchantSlips: MerchantSlip[];
  addDriverReturnSlip: (slip: Omit<DriverReturnSlip, 'id'>) => void;
  removeOrderFromDriverReturnSlip: (slipId: string, orderId: string) => void;
  addMerchantSlip: (slip: Omit<MerchantSlip, 'id'>) => void;
  updateMerchantSlipStatus: (slipId: string, status: MerchantSlip['status']) => void;
};

export const useReturnsStore = create<ReturnsState>()(immer((set) => ({
  driverReturnSlips: createInitialDriverSlips(),
  merchantSlips: [],
  
  addDriverReturnSlip: (slipData) => {
    set(state => {
      const newSlip: DriverReturnSlip = {
        ...slipData,
        id: `DRS-${Date.now()}`
      };
      state.driverReturnSlips.unshift(newSlip);
    });
  },

  removeOrderFromDriverReturnSlip: (slipId, orderId) => {
    set(state => {
        const slip = state.driverReturnSlips.find(s => s.id === slipId);
        if (slip) {
            slip.orders = slip.orders.filter(o => o.id !== orderId);
            slip.itemCount = slip.orders.length;
        }
    });
  },

  addMerchantSlip: (slipData) => {
    set(state => {
      const newSlip: MerchantSlip = {
        ...slipData,
        id: `RS-${new Date().getFullYear()}-${String(state.merchantSlips.length + 1).padStart(3, '0')}`
      };
      state.merchantSlips.unshift(newSlip);
    });
  },

  updateMerchantSlipStatus: (slipId, status) => {
    set(state => {
      const slip = state.merchantSlips.find(s => s.id === slipId);
      if (slip) {
        slip.status = status;
      }
    });
  },
})));
