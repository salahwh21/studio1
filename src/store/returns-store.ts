
'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Order } from './orders-store';
import { ordersStore } from './orders-store';

export type DriverSlip = {
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
const createInitialDriverSlips = (): DriverSlip[] => {
  const { orders } = ordersStore.getState();
  const abuAlAbdOrders = orders.filter(o => o.driver === 'ابو العبد' && o.status === 'مرجع للفرع').slice(0, 3);
  const mohammadSweidOrders = orders.filter(o => o.driver === 'محمد سويد' && o.status === 'مرجع للفرع').slice(0, 2);

  return [
    ...(abuAlAbdOrders.length > 0 ? [{
      id: `DS-1721650000000`,
      driverName: 'ابو العبد',
      date: new Date('2024-07-22').toISOString(),
      itemCount: abuAlAbdOrders.length,
      orders: abuAlAbdOrders
    }] : []),
     ...(mohammadSweidOrders.length > 0 ? [{
      id: `DS-1721563600000`,
      driverName: 'محمد سويد',
      date: new Date('2024-07-21').toISOString(),
      itemCount: mohammadSweidOrders.length,
      orders: mohammadSweidOrders
    }] : []),
  ];
}


type ReturnsState = {
  driverSlips: DriverSlip[];
  merchantSlips: MerchantSlip[];
  addDriverSlip: (slip: Omit<DriverSlip, 'id'>) => void;
  addMerchantSlip: (slip: Omit<MerchantSlip, 'id'>) => void;
  updateMerchantSlipStatus: (slipId: string, status: MerchantSlip['status']) => void;
};

export const useReturnsStore = create<ReturnsState>()(immer((set) => ({
  driverSlips: createInitialDriverSlips(),
  merchantSlips: [],
  
  addDriverSlip: (slipData) => {
    set(state => {
      const newSlip: DriverSlip = {
        ...slipData,
        id: `DS-${Date.now()}`
      };
      state.driverSlips.unshift(newSlip);
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
