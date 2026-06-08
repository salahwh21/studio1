import { useEffect, useRef } from 'react';
import { getSocket, connectSocket } from '@/lib/socket';
import { useOrdersStore } from '@/store/orders-store';

export const useRealTimeOrders = () => {
  const { orders, updateOrderStatus, refreshOrders, deleteOrders } = useOrdersStore();
  
  // Use ref for orders to avoid effect re-running on every order change
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  useEffect(() => {
    // Connect socket if not already connected
    const socket = connectSocket();
    
    // If socket is null (disabled), skip setup
    if (!socket) {
      return;
    }

    // Subscribe to new orders
    const handleNewOrder = (data: any) => {
      console.log('📥 New order received:', data);
      const orderId = data.id || data.order_id;
      if (orderId && !ordersRef.current.find(o => o.id === orderId)) {
        refreshOrders();
      }
    };

    // Subscribe to order status changes (general event)
    const handleOrderStatusChange = async (data: any) => {
      console.log('🔄 Order status changed:', data);
      const { order_id, status, driver_id } = data;
      if (order_id && status) {
        try {
          await updateOrderStatus(order_id, status, driver_id);
        } catch (error) {
          console.error('Failed to update order status:', error);
          refreshOrders();
        }
      }
    };

    // Subscribe to order updates (when order fields are changed)
    const handleOrderUpdated = (data: any) => {
      console.log('🔄 Order updated:', data);
      const orderId = data.order_id || data.id;
      if (orderId && !ordersRef.current.find(o => o.id === orderId)) {
        refreshOrders();
      }
    };

    // Subscribe to order deletions
    const handleOrderDeleted = (data: any) => {
      console.log('🗑️ Order deleted:', data);
      const { orderId } = data;
      if (orderId) {
        deleteOrders([orderId]);
      }
    };

    // Register all event listeners
    socket.on('new_order_created', handleNewOrder);
    socket.on('order_status_changed', handleOrderStatusChange);
    socket.on('order_updated', handleOrderUpdated);
    socket.on('order_deleted', handleOrderDeleted);

    return () => {
      // Cleanup: remove all event listeners
      socket.off('new_order_created', handleNewOrder);
      socket.off('order_status_changed', handleOrderStatusChange);
      socket.off('order_updated', handleOrderUpdated);
      socket.off('order_deleted', handleOrderDeleted);
    };
  }, [updateOrderStatus, refreshOrders, deleteOrders]); // Removed `orders` from deps

  return { orders };
};

export default useRealTimeOrders;

