'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Order } from './orders-store';

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

type ReturnsState = {
  driverSlips: DriverSlip[];
  merchantSlips: MerchantSlip[];
  addDriverSlip: (slip: Omit<DriverSlip, 'id'>) => void;
  addMerchantSlip: (slip: Omit<MerchantSlip, 'id'>) => void;
  updateMerchantSlipStatus: (slipId: string, status: MerchantSlip['status']) => void;
};

export const useReturnsStore = create<ReturnsState>()(immer((set) => ({
  driverSlips: [],
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
