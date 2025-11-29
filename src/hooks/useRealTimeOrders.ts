import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { useOrdersStore } from '@/store/orders-store';

export const useRealTimeOrders = () => {
  const { orders, updateOrderStatus } = useOrdersStore();

  useEffect(() => {
    // Subscribe to new orders
    const handleNewOrder = (data: any) => {
      console.log('📥 New order received:', data);
      // Refresh orders when a new order is created
      useOrdersStore.getState().loadOrdersFromAPI?.();
    };

    // Subscribe to order status changes
    const handleOrderStatusChange = async (data: any) => {
      console.log('🔄 Order status changed:', data);
      const { order_id, status } = data;
      if (order_id) {
        await updateOrderStatus(order_id, status);
      }
    };

    socket.on('new_order_created', handleNewOrder);
    socket.on('order_status_changed', handleOrderStatusChange);

    return () => {
      socket.off('new_order_created', handleNewOrder);
      socket.off('order_status_changed', handleOrderStatusChange);
    };
  }, [updateOrderStatus]);

  return { orders };
};

export default useRealTimeOrders;
