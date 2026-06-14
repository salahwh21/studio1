
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { apiSync } from '@/services/api-sync';
import api from '@/lib/api';
import { validateStatusTransition } from '@/lib/status-rules';



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
    merchantPhone?: string;
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
    settlementStatus?: 'pending' | 'settled';
};

const getHighestOrderNumber = (orders: Order[]): number => {
    if (orders.length === 0) return 0;
    return Math.max(...orders.map(o => o.orderNumber || 0));
};

export type ServerFilters = {
    status?: string;
    driver?: string;
    merchant?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
    page?: number;
    limit?: number;
};

type OrdersState = {
    orders: Order[];
    nextOrderNumber: number;
    isLoading: boolean;
    error: string | null;
    // Server-side pagination state
    serverPage: number;
    serverPageSize: number;
    serverTotalCount: number;
    serverFilters: ServerFilters;
    setOrders: (orders: Order[]) => void;
    updateOrderStatus: (orderId: string, newStatus: Order['status'], driverId?: string) => Promise<void>;
    bulkUpdateOrderStatus: (orderIds: string[], newStatus: Order['status']) => void;
    applyRemoteOrderUpdate: (orderId: string, status: string, driverId?: string | null, previousDriver?: string) => void;
    updateOrderField: (orderId: string, field: keyof Order, value: any) => void;
    deleteOrders: (orderIds: string[]) => void;
    addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'previousStatus'>) => Promise<Order>;
    refreshOrders: () => Promise<void>;
    loadOrdersFromAPI: () => Promise<void>;
    loadPage: (filters?: ServerFilters) => Promise<void>;
    setServerPage: (page: number) => void;
    setServerPageSize: (size: number) => void;
    setServerFilters: (filters: ServerFilters) => void;
};

const getSettings = () => {
    return { orderPrefix: 'ORD-', defaultStatus: 'بالانتظار' };
};


export const ordersStore = create<OrdersState>()(
    immer((set, get) => {

            return {
                orders: [],
                nextOrderNumber: 1,
                isLoading: false,
                error: null,
                serverPage: 0,
                serverPageSize: 50,
                serverTotalCount: 0,
                serverFilters: {},

                setServerPage: (page: number) => {
                    set((state) => { state.serverPage = page; });
                    get().loadPage({ ...get().serverFilters, page });
                },

                setServerPageSize: (size: number) => {
                    set((state) => { state.serverPageSize = size; state.serverPage = 0; });
                    get().loadPage({ ...get().serverFilters, page: 0, limit: size });
                },

                setServerFilters: (filters: ServerFilters) => {
                    set((state) => { state.serverFilters = filters; state.serverPage = 0; });
                    get().loadPage({ ...filters, page: 0, limit: get().serverPageSize });
                },

                loadPage: async (filters?: ServerFilters) => {
                    const state = get();
                    const mergedFilters: ServerFilters = {
                        page: state.serverPage,
                        limit: state.serverPageSize,
                        sortKey: 'created_at',
                        sortDir: 'desc',
                        ...state.serverFilters,
                        ...filters,
                    };

                    try {
                        set((s) => { s.isLoading = true; s.error = null; });
                        const response = await api.getOrders(mergedFilters as any);
                        const rawOrders = response.orders || [];
                        const totalCount = response.totalCount || 0;

                        const mapped = rawOrders.map((o: any, i: number) => ({
                            id: o.id,
                            source: o.source || 'Manual',
                            referenceNumber: o.referenceNumber || o.reference_number || '',
                            recipient: o.recipient || '',
                            phone: o.phone || '',
                            whatsapp: o.whatsapp || '',
                            address: o.address || '',
                            city: o.city || '',
                            region: o.region || '',
                            status: o.status || 'بالانتظار',
                            previousStatus: o.previousStatus || o.previous_status || '',
                            driver: o.driver || null,
                            previousDriver: o.previousDriver || o.previous_driver || undefined,
                            merchant: o.merchant || '',
                            merchantPhone: o.merchantPhone || o.merchant_phone || '',
                            cod: parseFloat(o.cod) || 0,
                            itemPrice: parseFloat(o.itemPrice ?? o.item_price) || 0,
                            deliveryFee: parseFloat(o.deliveryFee ?? o.delivery_fee) || 0,
                            additionalCost: parseFloat(o.additionalCost ?? o.additional_cost) || 0,
                            driverFee: parseFloat(o.driverFee ?? o.driver_fee) || 0,
                            driverAdditionalFare: parseFloat(o.driverAdditionalFare ?? o.driver_additional_fare) || 0,
                            date: o.date || new Date().toISOString().split('T')[0],
                            notes: o.notes || '',
                            lat: o.lat ? parseFloat(o.lat) : undefined,
                            lng: o.lng ? parseFloat(o.lng) : undefined,
                            orderNumber: o.orderNumber || o.order_number || (i + 1),
                            settlementStatus: o.settlementStatus || o.settlement_status || undefined,
                        }));

                        set((s) => {
                            s.orders = mapped;
                            s.serverTotalCount = totalCount;
                            s.isLoading = false;
                        });
                    } catch (error: any) {
                        set((s) => { s.isLoading = false; s.error = error?.message || 'Failed to load'; });
                    }
                },

                loadOrdersFromAPI: async () => {
                    try {
                        await get().loadPage();
                    } catch (error: any) {
                        const msg = error?.message || String(error);
                        const isAuthError = msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized') || msg.includes('Invalid or expired token');
                        if (isAuthError) {
                            set((state) => {
                                state.error = 'Authentication required';
                                state.isLoading = false;
                            });
                            return;
                        }
                        set((state) => {
                            state.error = 'Failed to load orders. Please check your connection.';
                            state.orders = [];
                            state.isLoading = false;
                        });
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

                // تحديث محلي فوري بدون isLoading ولا API call — للـ socket events فقط
                applyRemoteOrderUpdate: (orderId: string, status: string, driverId?: string | null, previousDriver?: string) =>
                    set((state) => {
                        const order = state.orders.find(o => o.id === orderId);
                        if (order) {
                            order.previousStatus = order.status;
                            order.status = status as any;
                            if (driverId !== undefined) order.driver = driverId ?? undefined as any;
                            if (previousDriver !== undefined) order.previousDriver = previousDriver;
                        }
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
        })
);


// Correctly define the hook for React components
export const useOrdersStore: UseBoundStore<StoreApi<OrdersState>> = ordersStore;
