
'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import type { Order } from './orders-store';

export type DriverPaymentSlip = {
  id: string;
  driverName: string;
  date: string;
  itemCount: number;
  orders: any[]; // Using any to match API response flexibility, or Order[]
};

export type MerchantPaymentSlip = {
  id: string;
  merchantName: string;
  date: string;
  itemCount: number;
  status: 'جاهز للتسليم' | 'مدفوع' | 'تم التسليم';
  orders: any[];
};

type FinancialsState = {
  driverPaymentSlips: DriverPaymentSlip[];
  merchantPaymentSlips: MerchantPaymentSlip[];

  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSlips: () => Promise<void>;

  addDriverPaymentSlip: (slip: { driverName: string; orderIds: string[]; date?: string }) => Promise<void>;
  deleteDriverPaymentSlip: (id: string) => Promise<void>;

  // Restored Actions for UI compatibility
  removeOrderFromDriverPaymentSlip: (slipId: string, orderId: string) => Promise<void>;
  updateOrderInDriverPaymentSlip: (slipId: string, orderId: string, updatedOrder: any) => Promise<void>;

  removeOrderFromMerchantPaymentSlip: (slipId: string, orderId: string) => Promise<void>;
  updateOrderInMerchantPaymentSlip: (slipId: string, orderId: string, updatedOrder: any) => Promise<void>;

  addMerchantPaymentSlip: (slip: { merchantName: string; orderIds: string[]; date?: string; status?: string }) => Promise<void>;
  updateMerchantPaymentStatus: (id: string, status: string) => Promise<void>;
  deleteMerchantPaymentSlip: (id: string) => Promise<void>;
};

// Check if backend is reachable
const isBackendReady = () => {
  if (typeof window === 'undefined') return false;
  // We assume backend is ready if we are in browser environment, 
  // real check happens during fetch
  return true;
};

export const useFinancialsStore = create<FinancialsState>()(
  persist(
    immer((set, get) => ({
      driverPaymentSlips: [],
      merchantPaymentSlips: [],
      isLoading: false,
      error: null,

      fetchSlips: async () => {
        // Local mode: Do nothing, just rely on persistence
        // Optionally simulate a load
        set({ isLoading: false });
      },

      addDriverPaymentSlip: async (slipData) => {
        const id = `dps-${Date.now()}`;
        const newSlip = {
          id,
          driverName: slipData.driverName,
          date: slipData.date || new Date().toISOString(),
          itemCount: slipData.orderIds.length,
          orders: slipData.orderIds.map(oid => ({ id: oid } as any)) // Minimal mock
        };
        set(state => {
          state.driverPaymentSlips.push(newSlip);
        });
      },

      deleteDriverPaymentSlip: async (id) => {
        set(state => {
          state.driverPaymentSlips = state.driverPaymentSlips.filter(s => s.id !== id);
        });
      },

      removeOrderFromDriverPaymentSlip: async (slipId, orderId) => {
        set(state => {
          const slip = state.driverPaymentSlips.find(s => s.id === slipId);
          if (slip) {
            slip.orders = slip.orders.filter(o => o.id !== orderId);
            slip.itemCount = slip.orders.length;
          }
        });
      },

      updateOrderInDriverPaymentSlip: async (slipId, orderId, updatedOrder) => {
        // Local update logic
      },

      removeOrderFromMerchantPaymentSlip: async (slipId, orderId) => {
        set(state => {
          const slip = state.merchantPaymentSlips.find(s => s.id === slipId);
          if (slip) {
            slip.orders = slip.orders.filter(o => o.id !== orderId);
            slip.itemCount = slip.orders.length;
          }
        });
      },

      updateOrderInMerchantPaymentSlip: async (slipId, orderId, updatedOrder) => {
        // Local update assumption
      },

      addMerchantPaymentSlip: async (slipData) => {
        const id = `mps-${Date.now()}`;
        const newSlip = {
          id,
          merchantName: slipData.merchantName,
          date: slipData.date || new Date().toISOString(),
          itemCount: slipData.orderIds.length,
          status: (slipData.status || 'جاهز للتسليم') as any,
          orders: slipData.orderIds.map(oid => ({ id: oid } as any))
        };
        set(state => {
          state.merchantPaymentSlips.push(newSlip);
        });
      },

      updateMerchantPaymentStatus: async (id, status) => {
        set(state => {
          const slip = state.merchantPaymentSlips.find(s => s.id === id);
          if (slip) slip.status = status as any;
        });
      },

      deleteMerchantPaymentSlip: async (id) => {
        set(state => {
          state.merchantPaymentSlips = state.merchantPaymentSlips.filter(s => s.id !== id);
        });
      },

    })),
    {
      name: 'financials-storage',
      // version: 2, // COMMENTED OUT TO TRY RESTORE OLD DATA
    }
  )
);
