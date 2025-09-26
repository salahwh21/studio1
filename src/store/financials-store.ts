
'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Order } from './orders-store';

export type DriverPaymentSlip = {
  id: string;
  driverName: string;
  date: string;
  itemCount: number;
  orders: Order[];
};

export type MerchantPaymentSlip = {
  id: string;
  merchantName: string;
  date: string;
  itemCount: number;
  status: 'جاهز للتسليم' | 'مدفوع';
  orders: Order[];
};

type FinancialsState = {
  driverPaymentSlips: DriverPaymentSlip[];
  merchantPaymentSlips: MerchantPaymentSlip[];
  addDriverPaymentSlip: (slip: Omit<DriverPaymentSlip, 'id'>) => void;
  removeOrderFromDriverPaymentSlip: (slipId: string, orderId: string) => void;
  updateOrderInDriverPaymentSlip: (slipId: string, orderId: string, updatedOrder: Order) => void;
  addMerchantPaymentSlip: (slip: Omit<MerchantPaymentSlip, 'id'>) => void;
  removeOrderFromMerchantPaymentSlip: (slipId: string, orderId: string) => void;
  updateOrderInMerchantPaymentSlip: (slipId: string, orderId: string, updatedOrder: Order) => void;
};

export const useFinancialsStore = create<FinancialsState>()(immer((set) => ({
  driverPaymentSlips: [],
  merchantPaymentSlips: [],
  
  addDriverPaymentSlip: (slipData) => {
    set(state => {
      const newSlip: DriverPaymentSlip = {
        ...slipData,
        id: `PAY-${Date.now()}`
      };
      state.driverPaymentSlips.unshift(newSlip);
    });
  },

  removeOrderFromDriverPaymentSlip: (slipId, orderId) => {
    set(state => {
        const slip = state.driverPaymentSlips.find(s => s.id === slipId);
        if (slip) {
            slip.orders = slip.orders.filter(o => o.id !== orderId);
            slip.itemCount = slip.orders.length;
        }
    });
  },

  updateOrderInDriverPaymentSlip: (slipId, orderId, updatedOrder) => {
    set(state => {
        const slip = state.driverPaymentSlips.find(s => s.id === slipId);
        if (slip) {
            const orderIndex = slip.orders.findIndex(o => o.id === orderId);
            if(orderIndex !== -1) {
                slip.orders[orderIndex] = updatedOrder;
            }
        }
    });
  },

  addMerchantPaymentSlip: (slipData) => {
    set(state => {
        const newSlip: MerchantPaymentSlip = {
            ...slipData,
            id: `MPAY-${Date.now()}`
        };
        state.merchantPaymentSlips.unshift(newSlip);
    });
  },
  
  removeOrderFromMerchantPaymentSlip: (slipId, orderId) => {
    set(state => {
        const slip = state.merchantPaymentSlips.find(s => s.id === slipId);
        if (slip) {
            slip.orders = slip.orders.filter(o => o.id !== orderId);
            slip.itemCount = slip.orders.length;
        }
    });
  },
  
  updateOrderInMerchantPaymentSlip: (slipId, orderId, updatedOrder) => {
    set(state => {
        const slip = state.merchantPaymentSlips.find(s => s.id === slipId);
        if (slip) {
            const orderIndex = slip.orders.findIndex(o => o.id === orderId);
            if(orderIndex !== -1) {
                slip.orders[orderIndex] = updatedOrder;
            }
        }
    });
  },
})));
