
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { usersStore } from './user-store';
import { rolesStore } from './roles-store';


const createInitialOrders = () => {
    const { users } = usersStore.getState();
    const merchants = users.filter(u => u.roleId === 'merchant');
    const drivers = users.filter(u => u.roleId === 'driver');
    
    if (merchants.length === 0 || drivers.length === 0) return [];

    return Array.from({ length: 15 }, (_, i) => ({
        id: `ORD-171981000${1+i}`,
        source: (['Shopify', 'Manual', 'API', 'WooCommerce'] as const)[i % 4],
        referenceNumber: `REF-00${100+i}`,
        recipient: ['محمد جاسم', 'أحمد محمود', 'أحمد خالد', 'فاطمة علي', 'حسن محمود', 'نور الهدى', 'خالد وليد'][i % 7],
        phone: `07${(791234567 + i * 1111111).toString().slice(0,8)}`,
        whatsapp: i % 5 === 0 ? `07${(987654321 - i * 1111111).toString().slice(0,8)}` : '',
        address: `${['الصويفية', 'تلاع العلي', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7]}`,
        city: ['عمان', 'الزرقاء', 'إربد'][i % 3],
        region: ['الصويفية', 'خلدا', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7],
        status: (['تم التوصيل', 'جاري التوصيل', 'بالانتظار', 'راجع', 'مؤجل', 'تم استلام المال في الفرع'] as const)[i % 6],
        previousStatus: (['بالانتظار', 'جاري التوصيل', 'بالانتظار', 'جاري التوصيل', 'جاري التوصيل', 'تم التوصيل'] as const)[i % 6],
        driver: drivers[i % drivers.length].name,
        merchant: merchants[i % merchants.length].storeName || merchants[i % merchants.length].name,
        cod: 35.50 + i * 5,
        itemPrice: 34.00 + i * 5,
        deliveryFee: 1.50,
        additionalCost: i % 10 === 0 ? 0.5 : 0, 
        driverFee: 1.00,
        driverAdditionalFare: i % 15 === 0 ? -0.25 : 0, 
        date: `2024-07-${(1 + i % 5).toString().padStart(2,'0')}`,
        notes: i % 3 === 0 ? 'اتصل قبل الوصول' : '',
        lat: i % 10 === 0 ? 31.95 + (Math.random() - 0.5) * 0.1 : undefined,
        lng: i % 10 === 0 ? 35.91 + (Math.random() - 0.5) * 0.1 : undefined,
    }));
}


export type Order = ReturnType<typeof createInitialOrders>[0] & { orderNumber: number };

const getHighestOrderNumber = (orders: Order[]): number => {
    if (orders.length === 0) return 0;
    return Math.max(...orders.map(o => o.orderNumber || 0));
};

type OrdersState = {
  orders: Order[];
  nextOrderNumber: number;
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  updateOrderField: (orderId: string, field: keyof Order, value: any) => void;
  deleteOrders: (orderIds: string[]) => void;
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'previousStatus'>) => Order;
  refreshOrders: () => void;
};

const getSettings = () => {
    if (typeof window !== 'undefined') {
        try {
            const settings = localStorage.getItem('comprehensiveAppSettings');
            if (settings) {
                return JSON.parse(settings).orders;
            }
        } catch (e) {
            console.error("Failed to parse settings from localStorage for order store", e);
        }
    }
    return { orderPrefix: 'ORD-', defaultStatus: 'بالانتظار' };
};


export const ordersStore = create<OrdersState>()(immer((set, get) => {
    const initialOrders = createInitialOrders();
    const initialOrdersWithNumbers = initialOrders.map((o, i) => ({...o, orderNumber: i + 1}));
    const initialOrderNumber = getHighestOrderNumber(initialOrdersWithNumbers);

    return {
        orders: initialOrdersWithNumbers,
        nextOrderNumber: initialOrderNumber + 1,
        
        setOrders: (orders) => {
            const numberedOrders = orders.map((o, i) => ({ ...o, orderNumber: o.orderNumber || i + 1 }));
            set((state) => {
                state.orders = numberedOrders;
                state.nextOrderNumber = getHighestOrderNumber(numberedOrders) + 1;
            });
        },

        updateOrderStatus: (orderId, newStatus) =>
            set((state) => {
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
                order.previousStatus = order.status;
                order.status = newStatus;
            }
            }),

        updateOrderField: (orderId, field, value) => 
            set((state) => {
                const order = state.orders.find(o => o.id === orderId);
                if(order) {
                    if (field === 'status') {
                        order.previousStatus = order.status;
                    }
                    (order as any)[field] = value;
                    if(field === 'cod' || field === 'deliveryFee' || field === 'additionalCost') {
                        const cod = typeof order.cod === 'number' ? order.cod : 0;
                        const deliveryFee = typeof order.deliveryFee === 'number' ? order.deliveryFee : 0;
                        const additionalCost = typeof order.additionalCost === 'number' ? order.additionalCost : 0;
                        order.itemPrice = cod - (deliveryFee + additionalCost);
                    }
                }
            }),

        deleteOrders: (orderIds) =>
            set((state) => ({
            orders: state.orders.filter((order) => !orderIds.includes(order.id)),
            })),

        addOrder: (orderData) => {
            let newOrder: Order | null = null;
            set((state) => {
                const orderSettings = getSettings();
                const orderPrefix = orderSettings.orderPrefix || 'ORD-';
                const newOrderNumber = state.nextOrderNumber;
                
                newOrder = {
                    ...(orderData as any),
                    additionalCost: 0,
                    driverAdditionalFare: 0,
                    driverFee: (orderData as any).city === 'عمان' ? 1.0 : 1.5,
                    status: orderData.status || orderSettings.defaultStatus || 'بالانتظار',
                    previousStatus: '',
                    id: `${orderPrefix}${newOrderNumber}`,
                    orderNumber: newOrderNumber,
                };
                
                state.orders.unshift(newOrder);
                state.nextOrderNumber = newOrderNumber + 1;
            });
            return newOrder!;
        },
            
        refreshOrders: () => set((state) => {
            const refreshedOrders = createInitialOrders();
            const renumberedOrders = refreshedOrders.map((o, i) => ({...o, orderNumber: i + 1}));
            state.orders = renumberedOrders;
            state.nextOrderNumber = renumberedOrders.length + 1;
        }),
    }
}));


// Correctly define the hook for React components
export const useOrdersStore: UseBoundStore<StoreApi<OrdersState>> = ordersStore;
