
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';


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

export type Order = typeof initialOrders[0] & { orderNumber: number };

// Helper to get the highest order number from existing orders
const getHighestOrderNumber = (orders: Order[]): number => {
    if (orders.length === 0) return 0;
    return Math.max(...orders.map(o => o.orderNumber || 0));
};

const initialOrderNumber = getHighestOrderNumber(initialOrders as Order[]);


// Define the state structure and actions
type OrdersState = {
  orders: Order[];
  nextOrderNumber: number;
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  updateOrderField: (orderId: string, field: keyof Order, value: any) => void;
  deleteOrders: (orderIds: string[]) => void;
  addOrder: (order: Omit<Order, 'orderNumber' | 'id'>) => void;
  refreshOrders: () => void;
};

// Create the store
export const useOrdersStore = create<OrdersState>()(immer((set) => ({
  orders: initialOrders.map((o, i) => ({...o, orderNumber: i + 1})), // Add initial order numbers
  nextOrderNumber: initialOrders.length + 1,
  
  setOrders: (orders) => set((state) => {
      state.orders = orders;
      state.nextOrderNumber = getHighestOrderNumber(orders) + 1;
  }),

  updateOrderStatus: (orderId, newStatus) =>
    set((state) => {
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
      }
    }),

  updateOrderField: (orderId, field, value) => 
    set((state) => {
        const order = state.orders.find(o => o.id === orderId);
        if(order) {
            (order as any)[field] = value;
            if(field === 'cod') {
                const deliveryFee = order.city === 'عمان' ? 2.5 : 3.5;
                order.itemPrice = value - deliveryFee;
                order.deliveryFee = deliveryFee;
            }
        }
    }),

  deleteOrders: (orderIds) =>
    set((state) => ({
      orders: state.orders.filter((order) => !orderIds.includes(order.id)),
    })),

  addOrder: (orderData) => 
    set((state) => {
        const newOrderNumber = state.nextOrderNumber;
        const newOrder: Order = {
            ...orderData,
            id: `new-${newOrderNumber}`, // temp id
            orderNumber: newOrderNumber,
        };
        state.orders.unshift(newOrder);
        state.nextOrderNumber = newOrderNumber + 1;
    }),
    
  refreshOrders: () => set((state) => {
      const renumberedOrders = initialOrders.map((o, i) => ({...o, orderNumber: i + 1}));
      state.orders = renumberedOrders;
      state.nextOrderNumber = renumberedOrders.length + 1;
  }),
})));
