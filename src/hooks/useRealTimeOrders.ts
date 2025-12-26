import { useEffect } from 'react';
import { getSocket, connectSocket } from '@/lib/socket';
import { useOrdersStore } from '@/store/orders-store';

export const useRealTimeOrders = () => {
  const { orders, updateOrderStatus, refreshOrders, deleteOrders } = useOrdersStore();

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
      // Don't refresh immediately - let the store update naturally
      // Only refresh if the order is not already in the store
      const orderId = data.id || data.order_id;
      if (orderId && !orders.find(o => o.id === orderId)) {
        // Order not found, refresh to get it
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
          // Fallback: refresh all orders
          refreshOrders();
        }
      }
    };

    // Subscribe to order updates (when order fields are changed)
    const handleOrderUpdated = (data: any) => {
      console.log('🔄 Order updated:', data);
      // Only refresh if we don't have the updated order locally
      // This prevents unnecessary refreshes that cause flickering
      const orderId = data.order_id || data.id;
      if (orderId && !orders.find(o => o.id === orderId)) {
        refreshOrders();
      }
      // Otherwise, the store will update automatically via the updateOrderField/updateOrderStatus calls
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
  }, [updateOrderStatus, refreshOrders, deleteOrders, orders]);

  return { orders };
};

export default useRealTimeOrders;
