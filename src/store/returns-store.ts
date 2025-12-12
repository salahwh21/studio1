'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Order } from './orders-store';

// Return Types
export type ReturnType = 'driver_return' | 'merchant_return' | 'customer_return';

// Return Status
export type ReturnStatus = 
  | 'initiated'              // تم إنشاء المرتجع
  | 'picked_up'              // تم استلام المرتجع من السائق
  | 'in_transit'             // المرتجع في الطريق
  | 'at_warehouse'           // المرتجع وصل المستودع
  | 'inspected'              // تم فحص المرتجع
  | 'approved'               // المرتجع معتمد للاسترجاع
  | 'rejected'               // المرتجع مرفوض
  | 'returned_to_merchant'   // أُعيد للتاجر
  | 'refunded'               // تم استرجاع المبلغ
  | 'disposed';              // تم التخلص من المرتجع

// Return Reason
export type ReturnReason = 
  | 'undelivered'    // لم يُسلّم
  | 'damaged'        // تالف
  | 'refused'        // مرفوض
  | 'cancelled'      // ملغى
  | 'wrong_item'     // منتج خاطئ
  | 'excess_stock'   // فائض مخزون
  | 'other';         // أخرى

// Condition
export type Condition = 'good' | 'damaged' | 'lost';

// Resolution Type
export type ResolutionType = 'return_to_merchant' | 'refund' | 'dispose';

// Timeline Event
export type TimelineEvent = {
  status: ReturnStatus;
  timestamp: string;
  actor: string;
  notes?: string;
};

// Inspection
export type Inspection = {
  inspected_at: string;
  inspector_id: string;
  inspector_name: string;
  condition: Condition;
  photo_urls: string[];
  notes: string;
};

// Resolution
export type Resolution = {
  type: ResolutionType;
  amount?: number;
  refund_date?: string;
  resolved_at: string;
  notes?: string;
};

// Return Record (Main Type)
export type ReturnRecord = {
  id: string;
  return_type: ReturnType;
  original_order_id: string;
  status: ReturnStatus;
  
  // Return Info
  return_reason: ReturnReason;
  return_date: string;
  return_notes: string;
  
  // Driver Info (who delivers the return)
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  
  // Merchant Info
  merchant_id?: string;
  merchant_name: string;
  
  // Order Info (cached for quick access)
  order_data: {
    recipient: string;
    phone: string;
    address: string;
    cod: number;
  };
  
  // Inspection
  inspection?: Inspection;
  
  // Resolution
  resolution?: Resolution;
  
  // Timeline
  timeline: TimelineEvent[];
  
  // Metadata
  created_at: string;
  updated_at: string;
};

// Legacy types for backward compatibility
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

type ReturnsState = {
  // New comprehensive returns
  returns: ReturnRecord[];
  
  // Legacy slips (for backward compatibility)
  driverReturnSlips: DriverReturnSlip[];
  merchantSlips: MerchantSlip[];
  
  // New Return Methods
  createReturn: (data: Omit<ReturnRecord, 'id' | 'timeline' | 'created_at' | 'updated_at'>) => string;
  updateReturnStatus: (returnId: string, status: ReturnStatus, actor: string, notes?: string) => void;
  addInspection: (returnId: string, inspection: Inspection) => void;
  addResolution: (returnId: string, resolution: Resolution) => void;
  getReturnById: (returnId: string) => ReturnRecord | undefined;
  getReturnsByStatus: (status: ReturnStatus) => ReturnRecord[];
  getReturnsByType: (type: ReturnType) => ReturnRecord[];
  getReturnsByMerchant: (merchantName: string) => ReturnRecord[];
  getReturnsByDriver: (driverName: string) => ReturnRecord[];
  
  // Legacy Methods (for backward compatibility)
  addDriverReturnSlip: (slip: Omit<DriverReturnSlip, 'id'>) => void;
  removeOrderFromDriverReturnSlip: (slipId: string, orderId: string) => void;
  addMerchantSlip: (slip: Omit<MerchantSlip, 'id'>) => void;
  updateMerchantSlipStatus: (slipId: string, status: MerchantSlip['status']) => void;
  removeOrderFromMerchantSlip: (slipId: string, orderId: string) => void;
};

export const useReturnsStore = create<ReturnsState>()(immer((set, get) => ({
  returns: [],
  driverReturnSlips: [],
  merchantSlips: [],
  
  // Create new return
  createReturn: (data) => {
    const id = `RET-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newReturn: ReturnRecord = {
      ...data,
      id,
      timeline: [{
        status: data.status,
        timestamp: now,
        actor: 'system',
        notes: 'Return created'
      }],
      created_at: now,
      updated_at: now
    };
    
    set(state => {
      state.returns.unshift(newReturn);
    });
    
    return id;
  },
  
  // Update return status
  updateReturnStatus: (returnId, status, actor, notes) => {
    set(state => {
      const returnRecord = state.returns.find(r => r.id === returnId);
      if (returnRecord) {
        returnRecord.status = status;
        returnRecord.updated_at = new Date().toISOString();
        returnRecord.timeline.push({
          status,
          timestamp: new Date().toISOString(),
          actor,
          notes
        });
      }
    });
  },
  
  // Add inspection
  addInspection: (returnId, inspection) => {
    set(state => {
      const returnRecord = state.returns.find(r => r.id === returnId);
      if (returnRecord) {
        returnRecord.inspection = inspection;
        returnRecord.status = 'inspected';
        returnRecord.updated_at = new Date().toISOString();
        returnRecord.timeline.push({
          status: 'inspected',
          timestamp: inspection.inspected_at,
          actor: inspection.inspector_name,
          notes: `Inspected: ${inspection.condition}`
        });
      }
    });
  },
  
  // Add resolution
  addResolution: (returnId, resolution) => {
    set(state => {
      const returnRecord = state.returns.find(r => r.id === returnId);
      if (returnRecord) {
        returnRecord.resolution = resolution;
        
        // Update status based on resolution type
        let newStatus: ReturnStatus = 'approved';
        if (resolution.type === 'return_to_merchant') {
          newStatus = 'returned_to_merchant';
        } else if (resolution.type === 'refund') {
          newStatus = 'refunded';
        } else if (resolution.type === 'dispose') {
          newStatus = 'disposed';
        }
        
        returnRecord.status = newStatus;
        returnRecord.updated_at = new Date().toISOString();
        returnRecord.timeline.push({
          status: newStatus,
          timestamp: resolution.resolved_at,
          actor: 'manager',
          notes: `Resolved: ${resolution.type}`
        });
      }
    });
  },
  
  // Get return by ID
  getReturnById: (returnId) => {
    return get().returns.find(r => r.id === returnId);
  },
  
  // Get returns by status
  getReturnsByStatus: (status) => {
    return get().returns.filter(r => r.status === status);
  },
  
  // Get returns by type
  getReturnsByType: (type) => {
    return get().returns.filter(r => r.return_type === type);
  },
  
  // Get returns by merchant
  getReturnsByMerchant: (merchantName) => {
    return get().returns.filter(r => r.merchant_name === merchantName);
  },
  
  // Get returns by driver
  getReturnsByDriver: (driverName) => {
    return get().returns.filter(r => r.driver_name === driverName);
  },
  
  // Legacy methods
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

  removeOrderFromMerchantSlip: (slipId, orderId) => {
    set(state => {
      const slip = state.merchantSlips.find(s => s.id === slipId);
      if (slip) {
        slip.orders = slip.orders.filter(o => o.id !== orderId);
        slip.items = slip.orders.length;
      }
    });
  },
})));
