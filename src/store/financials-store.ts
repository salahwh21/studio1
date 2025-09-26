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
})));
