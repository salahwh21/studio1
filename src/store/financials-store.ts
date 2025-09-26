
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

type FinancialsState = {
  driverPaymentSlips: DriverPaymentSlip[];
  addDriverPaymentSlip: (slip: Omit<DriverPaymentSlip, 'id'>) => void;
  removeOrderFromDriverPaymentSlip: (slipId: string, orderId: string) => void;
  updateOrderInDriverPaymentSlip: (slipId: string, orderId: string, updatedOrder: Order) => void;
};

export const useFinancialsStore = create<FinancialsState>()(immer((set) => ({
  driverPaymentSlips: [],
  
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
  }
})));
