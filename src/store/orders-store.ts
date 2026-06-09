
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { usersStore } from './user-store';
import { apiSync } from '@/services/api-sync';
import api from '@/lib/api';
import { validateStatusTransition } from '@/lib/status-rules';


const createInitialOrders = () => {
    const { users } = usersStore.getState();
    const merchants = users.filter(u => u.roleId === 'merchant');
    const drivers = users.filter(u => u.roleId === 'driver');

    if (merchants.length === 0 || drivers.length === 0) return [];

    const abuAlAbd = drivers.find(d => d.name === 'ابو العبد');

    // استيراد المدن والمناطق من ملف regions-data
    const { getAllCities, getRegionsByCity } = require('@/lib/regions-data');
    const allCities = getAllCities();

    // جلب التسعير من الإعدادات
    const getDeliveryFee = (city: string): number => {
        // التسعير الافتراضي: عمان 2 دينار، باقي المدن 3 دينار
        return city === 'عمان' ? 2.0 : 3.0;
    };

    return Array.from({ length: 50 }, (_, i) => {
        let assignedDriver = drivers[i % drivers.length].name;
        if (abuAlAbd && i < 10) {
            assignedDriver = abuAlAbd.name;
        }

        // اختيار المدينة من المدن المتوفرة في النظام
        const selectedCity = allCities[i % allCities.length];
        const cityRegions = getRegionsByCity(selectedCity);
        const selectedRegion = cityRegions.length > 0 ? cityRegions[i % cityRegions.length] : selectedCity;

        // حساب التسعير بناءً على المدينة
        const deliveryFee = getDeliveryFee(selectedCity);
        const itemPrice = 30.00 + (i * 3);
        const cod = itemPrice + deliveryFee;

        return {
            id: `ORD-171981000${1 + i}`,
            source: (['Shopify', 'Manual', 'API', 'WooCommerce'] as const)[i % 4],
            referenceNumber: `REF-00${100 + i}`,
            recipient: ['محمد جاسم', 'أحمد محمود', 'أحمد خالد', 'فاطمة علي', 'حسن محمود', 'نور الهدى', 'خالد وليد'][i % 7],
            phone: `07${(791234567 + i * 1111111).toString().slice(0, 8)}`,
            whatsapp: i % 5 === 0 ? `07${(987654321 - i * 1111111).toString().slice(0, 8)}` : '',
            address: `${selectedRegion}، شارع ${i + 1}، بناية ${i % 20 + 1}`,
            city: selectedCity,
            region: selectedRegion,
            status: (['تم التوصيل', 'جاري التوصيل', 'بالانتظار', 'مرتجع', 'مؤجل', 'تم استلام المال في الفرع'] as const)[i % 6],
            previousStatus: (['بالانتظار', 'جاري التوصيل', 'بالانتظار', 'جاري التوصيل', 'جاري التوصيل', 'تم التوصيل'] as const)[i % 6],
            driver: assignedDriver,
            merchant: merchants[i % merchants.length].storeName || merchants[i % merchants.length].name,
            cod,
            itemPrice,
            deliveryFee,
            additionalCost: i % 10 === 0 ? 0.5 : 0,
            driverFee: deliveryFee, // نفس رسوم التوصيل
            driverAdditionalFare: i % 15 === 0 ? -0.25 : 0,
            date: `2024-07-${(1 + i % 28).toString().padStart(2, '0')}`,
            notes: i % 3 === 0 ? 'اتصل قبل الوصول' : '',
            lat: i % 2 === 0 ? 31.9539 + (Math.random() - 0.5) * 0.15 : undefined,
            lng: i % 2 === 0 ? 35.9106 + (Math.random() - 0.5) * 0.15 : undefined,
        }
    });
}


export type Order = {
    id: string;
    source: 'Shopify' | 'Manual' | 'API' | 'WooCommerce';
    referenceNumber: string;
    recipient: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    region: string;
    status: string;
    previousStatus: string;
    driver: string | null;
    previousDriver?: string;
    merchant: string;
    cod: number;
    itemPrice: number;
    deliveryFee: number;
    additionalCost: number;
    driverFee: number;
    driverAdditionalFare: number;
    date: string;
    notes: string;
    lat?: number;
    lng?: number;
    orderNumber: number;
};

const getHighestOrderNumber = (orders: Order[]): number => {
    if (orders.length === 0) return 0;
    return Math.max(...orders.map(o => o.orderNumber || 0));
};

type OrdersState = {
    orders: Order[];
    nextOrderNumber: number;
    isLoading: boolean;
    error: string | null;
    setOrders: (orders: Order[]) => void;
    updateOrderStatus: (orderId: string, newStatus: Order['status'], driverId?: string) => Promise<void>;
    bulkUpdateOrderStatus: (orderIds: string[], newStatus: Order['status']) => void;
    updateOrderField: (orderId: string, field: keyof Order, value: any) => void;
    deleteOrders: (orderIds: string[]) => void;
    addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'previousStatus'>) => Promise<Order>;
    refreshOrders: () => Promise<void>;
    loadOrdersFromAPI: () => Promise<void>;
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


export const ordersStore = create<OrdersState>()(
    persist(
        immer((set, get) => {
            // Auto-loading is now handled by DataLoader in providers.tsx
            // Removed duplicate auto-load to prevent double API calls

            return {
                orders: [],
                nextOrderNumber: 1,
                isLoading: false,
                error: null,

                loadOrdersFromAPI: async () => {
                    const maxRetries = 3;
                    let retryCount = 0;

                    while (retryCount < maxRetries) {
                        try {
                            set((state) => {
                                state.isLoading = true;
                                state.error = null;
                            });

                            console.log(`🔄 Loading orders from API... (Attempt ${retryCount + 1}/${maxRetries})`);
                            // Fetch all orders - use large limit to get all orders
                            // First fetch to get total count
                            const firstResponse = await api.getOrders({ limit: 1000, page: 0 });
                            console.log('✅ First API Response:', firstResponse);

                            let allOrders = firstResponse.orders || [];
                            const totalCount = firstResponse.totalCount || 0;

                            console.log('📊 Total orders in DB:', totalCount);
                            console.log('📦 Orders loaded in first batch:', allOrders.length);

                            // If there are more orders, fetch them in batches
                            if (totalCount > 1000) {
                                console.log('🔄 Fetching remaining orders in batches...');
                                const batches = Math.ceil(totalCount / 1000);
                                for (let page = 1; page < batches; page++) {
                                    try {
                                        const batchResponse = await api.getOrders({ limit: 1000, page });
                                        if (batchResponse.orders && batchResponse.orders.length > 0) {
                                            allOrders = [...allOrders, ...batchResponse.orders];
                                            console.log(`📦 Batch ${page + 1}: Loaded ${batchResponse.orders.length} orders`);
                                        }
                                    } catch (batchError) {
                                        console.warn(`⚠️ Failed to load batch ${page + 1}, continuing...`, batchError);
                                        // Continue with other batches even if one fails
                                    }
                                }
                            }

                            console.log('✅ Total orders loaded:', allOrders.length);

                            if (allOrders.length === 0) {
                                console.warn('⚠️ No orders found in database');
                            }

                            const orders = allOrders;

                            const numberedOrders = orders.map((o: any, i: number) => {
                                // Add fallback coordinates if missing so they appear on the map
                                const baseLat = 31.9539;
                                const baseLng = 35.9106;
                                const randomLat = baseLat + (Math.random() - 0.5) * 0.15;
                                const randomLng = baseLng + (Math.random() - 0.5) * 0.15;

                                return {
                                    id: o.id,
                                    source: o.source || 'Manual',
                                    referenceNumber: o.referenceNumber || '',
                                    recipient: o.recipient || '',
                                    phone: o.phone || '',
                                    whatsapp: o.whatsapp || '',
                                    address: o.address || '',
                                    city: o.city || '',
                                    region: o.region || '',
                                    status: o.status || 'بالانتظار',
                                    previousStatus: o.previousStatus || '',
                                    driver: o.driver || 'غير معين',
                                    merchant: o.merchant || '',
                                    cod: parseFloat(o.cod) || 0,
                                    itemPrice: parseFloat(o.itemPrice) || 0,
                                    deliveryFee: parseFloat(o.deliveryFee) || 0,
                                    additionalCost: parseFloat(o.additionalCost) || 0,
                                    driverFee: parseFloat(o.driverFee) || 0,
                                    driverAdditionalFare: parseFloat(o.driverAdditionalFare) || 0,
                                    date: o.date || new Date().toISOString().split('T')[0],
                                    notes: o.notes || '',
                                    lat: o.lat ? parseFloat(o.lat) : randomLat,
                                    lng: o.lng ? parseFloat(o.lng) : randomLng,
                                    orderNumber: o.orderNumber || (i + 1),
                                };
                            });

                            set((state) => {
                                state.orders = numberedOrders;
                                state.nextOrderNumber = getHighestOrderNumber(numberedOrders) + 1;
                                state.isLoading = false;
                                state.error = null;
                            });

                            // Success - break out of retry loop
                            return;
                        } catch (error: any) {
                            retryCount++;
                            const msg = error?.message || String(error);
                            const isAuthError = msg.includes('Access token') || msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized') || msg.includes('Invalid or expired token');
                            if (isAuthError) {
                                console.log('🔐 Authentication required or backend unavailable - skipping orders load');
                                set((state) => {
                                    state.error = 'Authentication required';
                                    state.isLoading = false;
                                });
                                return; // Do not retry on auth errors
                            }
                            console.warn(`❌ Failed to load orders from API (Attempt ${retryCount}/${maxRetries}):`, msg);

                            if (retryCount >= maxRetries) {
                                // Final failure after all retries
                                set((state) => {
                                    state.error = `Failed to load orders after ${maxRetries} attempts. Please check your connection and try again.`;
                                    state.orders = []; // Clear orders on failure instead of showing mock data
                                    state.isLoading = false;
                                });
                            } else {
                                // Wait before retrying (exponential backoff)
                                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
                                console.log(`⏳ Retrying in ${delay}ms...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                            }
                        }
                    }
                },

                setOrders: (orders) => {
                    const numberedOrders = orders.map((o, i) => ({ ...o, orderNumber: o.orderNumber || i + 1 }));
                    set((state) => {
                        state.orders = numberedOrders;
                        state.nextOrderNumber = getHighestOrderNumber(numberedOrders) + 1;
                    });
                },

                updateOrderStatus: async (orderId, newStatus, driverId) => {
                    const order = get().orders.find(o => o.id === orderId);
                    if (!order) {
                        throw new Error('Order not found');
                    }

                    // Validate status transition
                    const validation = validateStatusTransition(
                        order.status,
                        newStatus,
                        driverId || order.driver || undefined
                    );

                    if (!validation.valid) {
                        set((state) => {
                            state.error = validation.error || 'Invalid status transition';
                        });
                        throw new Error(validation.error);
                    }

                    try {
                        set((state) => { state.isLoading = true; });

                        // Update via API
                        await api.updateOrderStatus(orderId, newStatus, driverId);

                        // Update local state
                        set((state) => {
                            const order = state.orders.find(o => o.id === orderId);
                            if (order) {
                                order.previousStatus = order.status;
                                order.status = newStatus as any;
                                if (driverId) {
                                    order.driver = driverId;
                                }
                            }
                            state.isLoading = false;
                            state.error = null;
                        });
                    } catch (error) {
                        console.error('Failed to update order status:', error);
                        set((state) => {
                            state.error = String(error);
                            state.isLoading = false;
                        });
                        throw error;
                    }
                },

                bulkUpdateOrderStatus: (orderIds, newStatus) =>
                    set((state) => {
                        state.orders.forEach(order => {
                            if (orderIds.includes(order.id)) {
                                order.previousStatus = order.status;
                                order.status = newStatus;
                            }
                        });
                    }),

                updateOrderField: async (orderId, field, value) => {
                    // Optimistic update
                    const state = get();
                    const originalOrder = state.orders.find(o => o.id === orderId);
                    if (!originalOrder) return;
                    const originalValue = (originalOrder as any)[field];

                    set((state) => {
                        const order = state.orders.find(o => o.id === orderId);
                        if (order) {
                            if (field === 'status') {
                                order.previousStatus = order.status;
                            }
                            (order as any)[field] = value;
                            if (field === 'cod' || field === 'deliveryFee' || field === 'additionalCost') {
                                const cod = typeof order.cod === 'number' ? order.cod : 0;
                                const deliveryFee = typeof order.deliveryFee === 'number' ? order.deliveryFee : 0;
                                const additionalCost = typeof order.additionalCost === 'number' ? order.additionalCost : 0;
                                order.itemPrice = cod - (deliveryFee + additionalCost);
                            }
                        }
                    });

                    try {
                        // Persist to backend
                        await api.updateOrder(orderId, { [field]: value });
                    } catch (error) {
                        console.error(`Failed to update order field ${field}:`, error);
                        // Revert on failure
                        set((state) => {
                            const order = state.orders.find(o => o.id === orderId);
                            if (order) {
                                (order as any)[field] = originalValue;
                            }
                            state.error = 'Failed to save changes';
                        });
                    }
                },

                deleteOrders: async (orderIds) => {
                    // Optimistic delete
                    const originalOrders = get().orders;
                    set((state) => ({
                        orders: state.orders.filter((order) => !orderIds.includes(order.id)),
                    }));

                    try {
                        await api.bulkDeleteOrders(orderIds);
                    } catch (error) {
                        console.error('Failed to delete orders:', error);
                        // Revert
                        set((state) => {
                            state.orders = originalOrders;
                            state.error = 'Failed to delete orders';
                        });
                    }
                },

                addOrder: async (orderData) => {
                    try {
                        set((state) => { state.isLoading = true; });

                        // Prepare data for API
                        const apiData = {
                            source: orderData.source || 'Manual',
                            referenceNumber: orderData.referenceNumber || '',
                            recipient: orderData.recipient,
                            phone: orderData.phone,
                            whatsapp: orderData.whatsapp || '',
                            address: orderData.address,
                            city: orderData.city,
                            region: orderData.region || '',
                            status: 'بالانتظار', // Always start with pending
                            driver: orderData.driver || '',
                            merchant: orderData.merchant || '',
                            cod: orderData.cod,
                            itemPrice: orderData.itemPrice,
                            deliveryFee: orderData.deliveryFee || (orderData.city === 'عمان' ? 1.0 : 1.5),
                            additionalCost: orderData.additionalCost || 0,
                            driverFee: orderData.city === 'عمان' ? 1.0 : 1.5,
                            driverAdditionalFare: 0,
                            date: orderData.date || new Date().toISOString().split('T')[0],
                            notes: orderData.notes || '',
                            lat: orderData.lat,
                            lng: orderData.lng,
                        };

                        // Create order via API
                        const response = await api.createOrder(apiData);

                        // FIXED: API now returns full object, use it directly instead of re-fetching
                        // Normalize the response to match Order type if needed
                        const newOrder: Order = {
                            id: response.id,
                            orderNumber: response.orderNumber,
                            source: response.source,
                            referenceNumber: response.referenceNumber,
                            recipient: response.recipient,
                            phone: response.phone,
                            whatsapp: response.whatsapp,
                            address: response.address,
                            city: response.city,
                            region: response.region,
                            status: response.status,
                            previousStatus: response.previousStatus || '',
                            driver: response.driver,
                            merchant: response.merchant,
                            cod: response.cod,
                            itemPrice: response.itemPrice,
                            deliveryFee: response.deliveryFee,
                            additionalCost: response.additionalCost,
                            driverFee: response.driverFee,
                            driverAdditionalFare: response.driverAdditionalFare,
                            date: response.date,
                            notes: response.notes,
                            lat: response.lat,
                            lng: response.lng,
                        };

                        set((state) => {
                            state.orders.unshift(newOrder);
                            state.nextOrderNumber = (newOrder.orderNumber || state.nextOrderNumber) + 1;
                            state.isLoading = false;
                        });

                        return newOrder;
                    } catch (error: any) {
                        // API failed, fallback to local creation
                        console.error('[addOrder] API failed:', error?.message || error);
                        set((state) => {
                            state.isLoading = false;
                        });

                        // Fallback to local creation
                        const orderSettings = getSettings();
                        const orderPrefix = orderSettings.orderPrefix || 'ORD-';
                        const currentState = get();
                        const newOrderNumber = currentState.nextOrderNumber;

                        const newOrder: Order = {
                            ...(orderData as any),
                            additionalCost: orderData.additionalCost || 0,
                            driverAdditionalFare: 0,
                            driverFee: (orderData as any).city === 'عمان' ? 1.0 : 1.5,
                            status: 'بالانتظار',
                            previousStatus: '',
                            id: `${orderPrefix}${newOrderNumber}`,
                            orderNumber: newOrderNumber,
                        };

                        set((state) => {
                            state.orders.unshift(newOrder);
                            state.nextOrderNumber = newOrderNumber + 1;
                        });

                        return newOrder;
                    }
                },

                refreshOrders: async () => {
                    const state = get();
                    // Only reload if not currently loading to prevent flickering
                    if (!state.isLoading) {
                        await get().loadOrdersFromAPI();
                    }
                },
            }
        }),
        {
            name: 'orders-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                orders: state.orders,
                nextOrderNumber: state.nextOrderNumber,
            }),
        }
    )
);


// Correctly define the hook for React components
export const useOrdersStore: UseBoundStore<StoreApi<OrdersState>> = ordersStore;
