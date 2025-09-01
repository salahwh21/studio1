
import { create } from 'zustand';

// Mock Data - This will be the initial state of our store
const initialOrders = Array.from({ length: 85 }, (_, i) => ({
  id: `ORD-171981000${1+i}`,
  source: (['Shopify', 'Manual', 'API', 'WooCommerce'] as const)[i % 4],
  referenceNumber: `REF-00${100+i}`,
  recipient: ['محمد جاسم', 'أحمد محمود', 'أحمد خالد', 'فاطمة علي', 'حسن محمود', 'نور الهدى', 'خالد وليد'][i % 7],
  phone: `07${(791234567 + i * 1111111).toString().slice(0,8)}`,
  whatsapp: i % 5 === 0 ? `07${(987654321 - i * 1111111).toString().slice(0,8)}` : '',
  address: `${['الصويفية', 'تلاع العلي', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7]}`,
  city: ['عمان', 'الزرقاء', 'إربد'][i % 3],
  region: ['الصويفية', 'خلدا', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7],
  status: (['تم التسليم', 'جاري التوصيل', 'بالانتظار', 'راجع', 'مؤجل', 'تم استلام المال في الفرع'] as const)[i % 6],
  driver: ['علي الأحمد', 'ابو العبد', 'محمد الخالد', 'يوسف إبراهيم', 'عائشة بكر', 'غير معين'][i % 6],
  merchant: ['تاجر أ', 'متجر العامري', 'تاجر ج', 'تاجر د'][i % 4],
  cod: 35.50 + i * 5,
  itemPrice: 34.00 + i * 5,
  deliveryFee: 1.50,
  date: `2024-07-${(1 + i % 5).toString().padStart(2,'0')}`,
  notes: i % 3 === 0 ? 'اتصل قبل الوصول' : '',
}));

export type Order = typeof initialOrders[0];

// Define the state structure and actions
type OrdersState = {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  deleteOrders: (orderIds: string[]) => void;
  addOrder: (order: Order) => void;
  refreshOrders: () => void;
};

// Create the store
export const useOrdersStore = create<OrdersState>((set) => ({
  orders: initialOrders,
  
  setOrders: (orders) => set({ orders }),

  updateOrderStatus: (orderId, newStatus) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ),
    })),

  deleteOrders: (orderIds) =>
    set((state) => ({
      orders: state.orders.filter((order) => !orderIds.includes(order.id)),
    })),

  addOrder: (order) => 
    set((state) => ({
        orders: [order, ...state.orders]
    })),
    
  refreshOrders: () => set({ orders: initialOrders }),
}));
